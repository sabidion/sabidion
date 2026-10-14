import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { uno, todos, ejecutar, transaccion } from './db.js';
import { construirCatalogo } from './catalogo.js';
import { ErrorPublico, cotizar, crearPedido, obtenerPedido, marcarPagado } from './pedidos.js';
import { proveedorActivo } from './pagos/index.js';
import { crudAdmin, listarPedidos } from './admin.js';
import { crearSesion, sesionValida, leerCookie, cookieSesion, iguales, demasiadosIntentos } from './auth.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const estatico = nombre => readFileSync(resolve(aqui, '../admin', nombre));
const LIMITE_CUERPO = 200_000;

const json = (res, estado, datos, extra = {}) => {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
  res.end(JSON.stringify(datos));
};
const html = (res, estado, cuerpo) => {
  res.writeHead(estado, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(cuerpo);
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const usd = c => `${(c / 100).toFixed(2)} ${process.env.MONEDA || 'USD'}`;

function leerJson(req) {
  return new Promise((ok, fallo) => {
    const trozos = []; let tam = 0;
    req.on('data', t => { tam += t.length; if (tam > LIMITE_CUERPO) { fallo(new ErrorPublico('Cuerpo demasiado grande.', 413)); req.destroy(); } else trozos.push(t); });
    req.on('end', () => {
      if (!trozos.length) return ok({});
      try { ok(JSON.parse(Buffer.concat(trozos).toString('utf8'))); } catch { fallo(new ErrorPublico('JSON no válido.')); }
    });
    req.on('error', fallo);
  });
}

const cors = req => {
  const origen = process.env.CORS_ORIGIN;
  if (!origen || req.headers.origin !== origen) return {};
  return { 'Access-Control-Allow-Origin': origen, 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
};

const exigirJson = req => {
  if (!/^application\/json/i.test(req.headers['content-type'] || '')) throw new ErrorPublico('Content-Type debe ser application/json.', 415);
};

function paginaSimulada(p) {
  const web = esc(process.env.CORS_ORIGIN || '/');
  const lineas = p.lineas.map(l => `<li>${l.cantidad} × ${esc(l.nombre)} <span>${usd(l.precio * l.cantidad)}</span></li>`).join('');
  const estado = p.estado === 'pendiente'
    ? `<form method="post" action="/pago/simulado/${esc(p.id)}/confirmar"><button>Simular pago de ${usd(p.total)}</button></form>`
    : `<p class="ok">Pedido ${esc(p.estado)}. Ya puedes volver a la tienda.</p><a href="${web}">Volver a la tienda</a>`;
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pago de prueba</title>
<style>body{font:16px system-ui;background:#14110f;color:#f3ebe3;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}
main{max-width:420px;width:100%;background:#211b17;border:1px solid #4a3a2f;padding:24px}h1{font-size:1.1rem;margin:0 0 4px}
.aviso{color:#e9b873;font-size:.85rem;margin:0 0 16px}ul{list-style:none;padding:0;margin:0 0 16px}li{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #3a2e26}
button{width:100%;padding:12px;font:inherit;font-weight:700;background:#fb7406;color:#14110f;border:0;cursor:pointer}a{color:#fb7406}.ok{color:#8fd694}</style>
<main><h1>Pago de prueba para ${esc(p.usuario)} (${esc(p.edicion)})</h1><p class="aviso">Modo de pruebas: no se cobra nada.</p><ul>${lineas}</ul>${estado}</main>`;
}

function exigirAdmin(req) {
  if (!sesionValida(leerCookie(req, 'sid'))) throw new ErrorPublico('Necesitas iniciar sesión.', 401);
}
function exigirPlugin(req) {
  const t = process.env.PLUGIN_TOKEN;
  const dado = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!t || !iguales(dado, t)) throw new ErrorPublico('Token de plugin no válido.', 401);
}

async function manejar(req, res) {
  const url = new URL(req.url, 'http://x');
  const ruta = url.pathname.replace(/\/+$/, '') || '/';
  const m = req.method;
  const extra = cors(req);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (m === 'OPTIONS') { res.writeHead(204, extra); return res.end(); }

  // ---- público
  if (ruta === '/api/salud') return json(res, 200, { ok: true });
  if (ruta === '/api/catalogo' && m === 'GET')
    return json(res, 200, construirCatalogo(), { ...extra, 'Cache-Control': 'public, max-age=30' });
  if (ruta === '/api/cotizar' && m === 'POST') {
    exigirJson(req); const b = await leerJson(req);
    const c = cotizar(b);
    return json(res, 200, { subtotal: c.subtotal, descuento: c.descuento, total: c.total, cupon: c.cupon, moneda: process.env.MONEDA || 'USD' }, extra);
  }
  if (ruta === '/api/pedidos' && m === 'POST') {
    exigirJson(req); const b = await leerJson(req);
    const proveedor = proveedorActivo();
    const pedido = crearPedido(b, proveedor.nombre);
    try {
      const pago = await proveedor.crear(pedido);
      if (pago.ref) ejecutar('UPDATE pedidos SET ref_externa = ? WHERE id = ?', pago.ref, pedido.id);
      return json(res, 201, { id: pedido.id, url: pago.url, total: pedido.total }, extra);
    } catch (e) {
      ejecutar("UPDATE pedidos SET estado = 'fallido' WHERE id = ?", pedido.id);
      console.error('Error creando el pago:', e);
      throw new ErrorPublico('No se pudo iniciar el pago. Inténtalo de nuevo.', 502);
    }
  }
  let r;
  if (m === 'GET' && (r = ruta.match(/^\/api\/pedidos\/([0-9a-f-]{36})$/))) {
    const p = obtenerPedido(r[1]);
    if (!p) throw new ErrorPublico('Pedido no encontrado.', 404);
    return json(res, 200, { id: p.id, estado: p.estado, total: p.total, moneda: p.moneda }, extra);
  }

  // ---- pago simulado (solo con PAGO_PROVEEDOR=simulado)
  if ((r = ruta.match(/^\/pago\/simulado\/([0-9a-f-]{36})(\/confirmar)?$/))) {
    if ((process.env.PAGO_PROVEEDOR || 'simulado') !== 'simulado') throw new ErrorPublico('No disponible.', 404);
    const p = obtenerPedido(r[1]);
    if (!p) throw new ErrorPublico('Pedido no encontrado.', 404);
    if (r[2] && m === 'POST') { marcarPagado(p.id, 'simulado'); res.writeHead(303, { Location: `/pago/simulado/${p.id}` }); return res.end(); }
    if (!r[2] && m === 'GET') return html(res, 200, paginaSimulada(p));
  }

  // ---- plugin de Velocity/Leaf
  if (ruta === '/api/plugin/cola' && m === 'GET') {
    exigirPlugin(req);
    const servidor = url.searchParams.get('servidor');
    const limite = Math.min(Number(url.searchParams.get('limite')) || 50, 200);
    const filas = servidor
      ? todos("SELECT * FROM entregas WHERE estado = 'pendiente' AND servidor = ? ORDER BY id LIMIT ?", servidor, limite)
      : todos("SELECT * FROM entregas WHERE estado = 'pendiente' ORDER BY id LIMIT ?", limite);
    return json(res, 200, { entregas: filas });
  }
  if (ruta === '/api/plugin/confirmar' && m === 'POST') {
    exigirPlugin(req); exigirJson(req); const b = await leerJson(req);
    if (!Array.isArray(b.resultados) || b.resultados.length > 500) throw new ErrorPublico('Lista de resultados no válida.');
    const ahora = new Date().toISOString();
    transaccion(() => {
      for (const x of b.resultados) {
        if (!Number.isInteger(x?.id)) continue;
        if (x.ok) ejecutar("UPDATE entregas SET estado = 'entregado', entregado = ?, intentos = intentos + 1 WHERE id = ? AND estado = 'pendiente'", ahora, x.id);
        else ejecutar("UPDATE entregas SET intentos = intentos + 1, estado = CASE WHEN intentos + 1 >= 5 THEN 'error' ELSE estado END WHERE id = ? AND estado = 'pendiente'", x.id);
      }
    });
    return json(res, 200, { ok: true });
  }

  // ---- panel de administración
  if (ruta === '/admin' && m === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; frame-ancestors 'none'" });
    return res.end(estatico('index.html'));
  }
  if (ruta === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (ruta === '/admin/admin.js' && m === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(estatico('admin.js'));
  }
  if (ruta === '/api/admin/login' && m === 'POST') {
    exigirJson(req);
    if (demasiadosIntentos(req.socket.remoteAddress)) throw new ErrorPublico('Demasiados intentos. Espera un minuto.', 429);
    const b = await leerJson(req);
    const clave = process.env.ADMIN_PASSWORD;
    if (!clave || typeof b.password !== 'string' || !iguales(b.password, clave)) throw new ErrorPublico('Contraseña incorrecta.', 401);
    return json(res, 200, { ok: true }, { 'Set-Cookie': cookieSesion(crearSesion()) });
  }
  if (ruta === '/api/admin/logout' && m === 'POST') return json(res, 200, { ok: true }, { 'Set-Cookie': cookieSesion('', true) });
  if (ruta === '/api/admin/sesion' && m === 'GET') { exigirAdmin(req); return json(res, 200, { ok: true }); }
  if (ruta === '/api/admin/pedidos' && m === 'GET') { exigirAdmin(req); return json(res, 200, listarPedidos()); }
  if ((r = ruta.match(/^\/api\/admin\/([a-z]+)(?:\/(\d+))?$/))) {
    exigirAdmin(req);
    let cuerpo;
    if (m === 'POST' || m === 'PATCH') { exigirJson(req); cuerpo = await leerJson(req); }
    const salida = crudAdmin(r[1], m, r[2] ? Number(r[2]) : null, cuerpo);
    if (salida !== null && salida !== undefined) return json(res, m === 'POST' ? 201 : 200, salida);
  }

  throw new ErrorPublico('No encontrado.', 404);
}

const servidor = createServer((req, res) => {
  manejar(req, res).catch(e => {
    if (res.headersSent) return res.end();
    if (e instanceof ErrorPublico) return json(res, e.estado, { error: e.message }, cors(req));
    console.error(e);
    json(res, 500, { error: 'Error interno.' });
  });
});

export default servidor;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.env.PORT) || 3000, host = process.env.HOST || '127.0.0.1';
  servidor.listen(puerto, host, () => console.log(`Tienda escuchando en http://${host}:${puerto}`));
}
