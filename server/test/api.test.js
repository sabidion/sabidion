import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DB_PATH = ':memory:';
process.env.ADMIN_PASSWORD = 'clave-de-prueba';
process.env.SESSION_SECRET = 'secreto-de-prueba-largo-123456';
process.env.PLUGIN_TOKEN = 'token-plugin-prueba';
process.env.PAGO_PROVEEDOR = 'simulado';
process.env.CORS_ORIGIN = 'https://web.ejemplo';

const { default: servidor } = await import('../src/server.js');
let base, cookie;

before(async () => { await new Promise(ok => servidor.listen(0, '127.0.0.1', ok)); base = `http://127.0.0.1:${servidor.address().port}`; });
after(() => servidor.close());

const api = async (ruta, { metodo = 'GET', cuerpo, cabeceras = {} } = {}) => {
  const r = await fetch(base + ruta, {
    method: metodo, redirect: 'manual',
    headers: { ...(cuerpo ? { 'Content-Type': 'application/json' } : {}), ...cabeceras },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const t = await r.text();
  let datos; try { datos = JSON.parse(t); } catch { datos = t; }
  return { estado: r.status, datos, cabeceras: r.headers };
};
const admin = (ruta, o = {}) => api('/api/admin' + ruta, { ...o, cabeceras: { Cookie: cookie, ...(o.cabeceras || {}) } });

test('el panel exige iniciar sesión', async () => {
  assert.equal((await api('/api/admin/modalidades')).estado, 401);
  assert.equal((await api('/api/admin/login', { metodo: 'POST', cuerpo: { password: 'mala' } })).estado, 401);
  const ok = await api('/api/admin/login', { metodo: 'POST', cuerpo: { password: 'clave-de-prueba' } });
  assert.equal(ok.estado, 200);
  cookie = ok.cabeceras.get('set-cookie').split(';')[0];
  assert.match(ok.cabeceras.get('set-cookie'), /HttpOnly/);
  assert.equal((await admin('/modalidades')).estado, 200);
});

let mod, cat, rango, pase;
test('crear modalidad, categoría y paquetes desde el panel', async () => {
  mod = (await admin('/modalidades', { metodo: 'POST', cuerpo: { slug: 'survival', nombre: 'SURVIVAL', emoji: '🌲' } })).datos;
  cat = (await admin('/categorias', { metodo: 'POST', cuerpo: { modalidad_id: mod.id, slug: 'rangos', nombre: 'Rangos' } })).datos;
  rango = (await admin('/paquetes', { metodo: 'POST', cuerpo: { modalidad_id: mod.id, categoria_id: cat.id, nombre: 'ORO', precio: 1000, comandos: ['/lp user {usuario} parent add oro', 'broadcast {usuario} compró ORO'] } })).datos;
  pase = (await admin('/paquetes', { metodo: 'POST', cuerpo: { modalidad_id: mod.id, nombre: 'PASE', precio: 500 } })).datos;
  assert.deepEqual(rango.comandos, ['lp user {usuario} parent add oro', 'broadcast {usuario} compró ORO']);
  const c = (await api('/api/catalogo')).datos;
  assert.deepEqual(c[0].categorias[0].productos[0], [String(rango.id), 'ORO', 10, null, '']);
  assert.deepEqual(c[0].evento[0], [String(pase.id), 'PASE', 5, null, '']);
});

test('validaciones del panel', async () => {
  const mala = cuerpo => admin('/paquetes', { metodo: 'POST', cuerpo: { modalidad_id: mod.id, nombre: 'X', ...cuerpo } });
  assert.equal((await mala({ precio: -1 })).estado, 400);
  assert.equal((await mala({ precio: 10.5 })).estado, 400);
  assert.equal((await mala({ precio: 10, comandos: 'rm -rf' })).estado, 400);
  const otra = (await admin('/modalidades', { metodo: 'POST', cuerpo: { slug: 'otra', nombre: 'OTRA' } })).datos;
  assert.equal((await mala({ precio: 10, modalidad_id: otra.id, categoria_id: cat.id })).estado, 400);
  assert.equal((await admin('/modalidades', { metodo: 'POST', cuerpo: { slug: 'survival', nombre: 'DUP' } })).estado, 409);
  await admin(`/modalidades/${otra.id}`, { metodo: 'DELETE' });
});

test('las ofertas rebajan el precio y muestran el precio anterior', async () => {
  const o = (await admin('/ofertas', { metodo: 'POST', cuerpo: { nombre: 'Halloween', tipo: 'porcentaje', valor: 25, alcance: 'categoria', alcance_id: cat.id } })).datos;
  let c = (await api('/api/catalogo')).datos;
  assert.deepEqual(c[0].categorias[0].productos[0].slice(2, 4), [7.5, 10]);
  assert.deepEqual(c[0].evento[0].slice(2, 4), [5, null]);
  await admin(`/ofertas/${o.id}`, { metodo: 'PATCH', cuerpo: { fin: '2000-01-01T00:00:00Z' } });
  c = (await api('/api/catalogo')).datos;
  assert.deepEqual(c[0].categorias[0].productos[0].slice(2, 4), [10, null]);
  await admin(`/ofertas/${o.id}`, { metodo: 'DELETE' });
});

let pedidoId;
test('el pedido calcula el precio en el servidor e ignora lo que mande el navegador', async () => {
  await admin('/cupones', { metodo: 'POST', cuerpo: { codigo: 'HOLA10', tipo: 'porcentaje', valor: 10, usos_max: 1 } });
  const items = [{ id: rango.id, cant: 2, precio: 1 }, { id: pase.id, cant: 1 }];
  const cot = await api('/api/cotizar', { metodo: 'POST', cuerpo: { items, cupon: 'hola10' } });
  assert.deepEqual([cot.datos.subtotal, cot.datos.descuento, cot.datos.total], [2500, 250, 2250]);
  const r = await api('/api/pedidos', { metodo: 'POST', cuerpo: { usuario: 'Steve', edicion: 'java', items, cupon: 'HOLA10', total: 1 } });
  assert.equal(r.estado, 201);
  assert.equal(r.datos.total, 2250);
  assert.match(r.datos.url, /\/pago\/simulado\//);
  pedidoId = r.datos.id;
});

test('rechaza datos no válidos', async () => {
  const pedir = c => api('/api/pedidos', { metodo: 'POST', cuerpo: { usuario: 'Steve', edicion: 'java', items: [{ id: pase.id, cant: 1 }], ...c } });
  assert.equal((await pedir({ usuario: 'a;b' })).estado, 400);
  assert.equal((await pedir({ edicion: 'consola' })).estado, 400);
  assert.equal((await pedir({ items: [{ id: 999999, cant: 1 }] })).estado, 409);
  assert.equal((await pedir({ items: [{ id: pase.id, cant: 0 }] })).estado, 400);
  assert.equal((await pedir({ cupon: 'NOEXISTE' })).estado, 400);
});

test('el pago es idempotente y crea las entregas una sola vez', async () => {
  assert.equal((await api(`/api/pedidos/${pedidoId}`)).datos.estado, 'pendiente');
  assert.equal((await api(`/pago/simulado/${pedidoId}/confirmar`, { metodo: 'POST' })).estado, 303);
  assert.equal((await api(`/pago/simulado/${pedidoId}/confirmar`, { metodo: 'POST' })).estado, 303);
  assert.equal((await api(`/api/pedidos/${pedidoId}`)).datos.estado, 'pagado');
  const cola = await api('/api/plugin/cola?servidor=survival', { cabeceras: { Authorization: 'Bearer token-plugin-prueba' } });
  assert.equal(cola.datos.entregas.length, 4); // 2 ORO x 2 comandos
  assert.equal(cola.datos.entregas[0].comando, 'lp user {usuario} parent add oro');
  assert.equal(cola.datos.entregas[0].usuario, 'Steve');
  // el cupón de un solo uso ya está gastado
  const otra = await api('/api/cotizar', { metodo: 'POST', cuerpo: { items: [{ id: pase.id, cant: 1 }], cupon: 'HOLA10' } });
  assert.equal(otra.estado, 400);
});

test('el plugin confirma entregas y exige token', async () => {
  const h = { Authorization: 'Bearer token-plugin-prueba' };
  assert.equal((await api('/api/plugin/cola')).estado, 401);
  assert.equal((await api('/api/plugin/cola', { cabeceras: { Authorization: 'Bearer otro' } })).estado, 401);
  const { entregas } = (await api('/api/plugin/cola', { cabeceras: h })).datos;
  await api('/api/plugin/confirmar', { metodo: 'POST', cabeceras: h, cuerpo: { resultados: entregas.map(e => ({ id: e.id, ok: true })) } });
  assert.equal((await api('/api/plugin/cola', { cabeceras: h })).datos.entregas.length, 0);
});

test('CORS solo para el origen configurado', async () => {
  const bueno = await api('/api/catalogo', { cabeceras: { Origin: 'https://web.ejemplo' } });
  assert.equal(bueno.cabeceras.get('access-control-allow-origin'), 'https://web.ejemplo');
  const malo = await api('/api/catalogo', { cabeceras: { Origin: 'https://malo.ejemplo' } });
  assert.equal(malo.cabeceras.get('access-control-allow-origin'), null);
});
