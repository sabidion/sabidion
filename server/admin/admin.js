'use strict';
const app = document.getElementById('app');
const estado = { tab: 'catalogo', mods: [], cats: [], paqs: [], ofertas: [], cupones: [], pedidos: [], modSel: null, catSel: undefined };

// ---------- utilidades
function h(tag, attrs, ...hijos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else if (k in e && k !== 'list') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
const dinero = c => (c / 100).toFixed(2);
const aCentavos = t => { const n = Number(String(t).replace(',', '.')); if (!Number.isFinite(n) || n < 0) throw new Error('Precio no válido.'); return Math.round(n * 100); };
const fechaCorta = s => (s ? new Date(s).toLocaleString('es') : '—');
const aLocal = s => (s ? new Date(new Date(s) - new Date(s).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
const deLocal = s => (s ? new Date(s).toISOString() : null);

let temporizador;
function avisar(texto, mal = false) {
  const a = document.getElementById('aviso');
  a.textContent = texto; a.className = mal ? 'mal' : ''; a.hidden = false;
  clearTimeout(temporizador); temporizador = setTimeout(() => { a.hidden = true; }, 4000);
}

async function api(ruta, metodo = 'GET', cuerpo) {
  const r = await fetch('/api/admin' + ruta, { method: metodo, headers: cuerpo ? { 'Content-Type': 'application/json' } : {}, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && ruta !== '/login') { pintarLogin(); throw new Error('Sesión caducada.'); }
  if (!r.ok) throw new Error(d.error || 'Error inesperado.');
  return d;
}
const intentar = async fn => { try { await fn(); } catch (e) { avisar(e.message, true); } };

async function cargar() {
  const [mods, cats, paqs, ofertas, cupones, pedidos] = await Promise.all(
    ['modalidades', 'categorias', 'paquetes', 'ofertas', 'cupones', 'pedidos'].map(t => api('/' + t)));
  Object.assign(estado, { mods, cats, paqs, ofertas, cupones, pedidos });
  if (!mods.find(m => m.id === estado.modSel)) { estado.modSel = mods[0]?.id ?? null; estado.catSel = undefined; }
}

// ---------- diálogo de formulario genérico
function formulario(titulo, campos, valores, guardar, borrar) {
  const dlg = h('dialog');
  const entradas = {};
  const filas = campos.map(c => {
    let ctl;
    if (c.tipo === 'select') ctl = h('select', {}, c.opciones.map(([v, t]) => h('option', { value: v, selected: String(valores[c.k] ?? '') === String(v) }, t)));
    else if (c.tipo === 'area') ctl = h('textarea', { rows: c.filas || 4, value: valores[c.k] ?? '', placeholder: c.ayuda || '' });
    else if (c.tipo === 'check') ctl = h('input', { type: 'checkbox', checked: valores[c.k] !== 0 && valores[c.k] !== false, style: 'width:auto' });
    else ctl = h('input', { type: c.tipo || 'text', value: valores[c.k] ?? '', maxLength: c.max, step: c.tipo === 'number' ? 'any' : null, placeholder: c.ayuda || '' });
    entradas[c.k] = ctl;
    return h('label', { class: c.mitad ? '' : '' }, c.t, ctl);
  });
  const form = h('form', { class: 'grid', method: 'dialog', onsubmit: e => {
    e.preventDefault();
    intentar(async () => {
      const salida = {};
      for (const c of campos) {
        const el = entradas[c.k];
        salida[c.k] = c.tipo === 'check' ? el.checked : el.value;
      }
      await guardar(salida);
      dlg.close(); dlg.remove();
    });
  } },
    h('h3', { style: 'margin:0' }, titulo), filas,
    h('div', { class: 'acciones' },
      borrar && h('button', { type: 'button', class: 's p', onclick: () => intentar(async () => {
        if (!confirm_(dlg)) return; await borrar(); dlg.close(); dlg.remove(); }) }, 'Eliminar'),
      h('span', { style: 'flex:1' }),
      h('button', { type: 'button', class: 's', onclick: () => { dlg.close(); dlg.remove(); } }, 'Cancelar'),
      h('button', { class: 'b' }, 'Guardar')));
  dlg.append(form);
  document.body.append(dlg);
  dlg.showModal();
}
// confirmación propia en dos pasos (sin window.confirm)
function confirm_(dlg) {
  const b = dlg.querySelector('.p');
  if (b.dataset.seguro === '1') return true;
  b.dataset.seguro = '1'; b.textContent = 'Pulsa otra vez para confirmar';
  return false;
}

// ---------- login
function pintarLogin() {
  app.replaceChildren(h('form', { id: 'login', onsubmit: e => {
    e.preventDefault();
    intentar(async () => { await api('/login', 'POST', { password: e.target.password.value }); await iniciar(); });
  } }, h('h1', {}, 'Panel MeeTion'), h('label', {}, 'Contraseña', h('input', { type: 'password', name: 'password', autocomplete: 'current-password', required: true, autofocus: true })), h('button', { class: 'b' }, 'Entrar')));
}

// ---------- catálogo
const modActual = () => estado.mods.find(m => m.id === estado.modSel);
const catsDe = id => estado.cats.filter(c => c.modalidad_id === id);
const paqsDe = (mid, cid) => estado.paqs.filter(p => p.modalidad_id === mid && (p.categoria_id ?? null) === cid);

function editarModalidad(m) {
  formulario(m ? 'Editar modalidad' : 'Nueva modalidad', [
    { k: 'nombre', t: 'Nombre', max: 80 }, { k: 'slug', t: 'Slug (para la URL)', max: 60 }, { k: 'emoji', t: 'Emoji', max: 8 },
    { k: 'orden', t: 'Orden', tipo: 'number' }, { k: 'activo', t: 'Visible en la tienda', tipo: 'check' }],
  m || { orden: estado.mods.length, activo: 1 },
  async v => { const d = { ...v, orden: Number(v.orden) || 0 }; const r = m ? await api('/modalidades/' + m.id, 'PATCH', d) : await api('/modalidades', 'POST', d); estado.modSel = r.id; estado.catSel = undefined; await refrescar(); },
  m && (async () => { await api('/modalidades/' + m.id, 'DELETE'); await refrescar(); }));
}
function editarCategoria(c) {
  formulario(c ? 'Editar categoría' : 'Nueva categoría', [
    { k: 'nombre', t: 'Nombre', max: 80 }, { k: 'slug', t: 'Slug', max: 80 }, { k: 'emoji', t: 'Emoji', max: 8 },
    { k: 'aviso', t: 'Aviso (opcional)', tipo: 'area', filas: 2 }, { k: 'orden', t: 'Orden', tipo: 'number' }, { k: 'activo', t: 'Visible', tipo: 'check' }],
  c || { orden: catsDe(estado.modSel).length, activo: 1 },
  async v => { const d = { ...v, orden: Number(v.orden) || 0, modalidad_id: estado.modSel }; const r = c ? await api('/categorias/' + c.id, 'PATCH', d) : await api('/categorias', 'POST', d); estado.catSel = r.id; await refrescar(); },
  c && (async () => { await api('/categorias/' + c.id, 'DELETE'); estado.catSel = undefined; await refrescar(); }));
}
function editarPaquete(p) {
  const cats = [['', 'Destacados / evento'], ...catsDe(estado.modSel).map(c => [c.id, c.nombre])];
  formulario(p ? 'Editar paquete' : 'Nuevo paquete', [
    { k: 'nombre', t: 'Nombre', max: 120 }, { k: 'categoria_id', t: 'Categoría', tipo: 'select', opciones: cats },
    { k: 'precio', t: 'Precio', tipo: 'number' }, { k: 'precio_antes', t: 'Precio anterior (tachado, opcional)', tipo: 'number' },
    { k: 'imagen', t: 'Imagen (nombre de archivo en el CDN)', max: 200 }, { k: 'descripcion', t: 'Descripción', tipo: 'area', filas: 2 },
    { k: 'comandos', t: 'Comandos de entrega (uno por línea; {usuario} se sustituye)', tipo: 'area', filas: 4, ayuda: 'lp user {usuario} parent add oro' },
    { k: 'orden', t: 'Orden', tipo: 'number' }, { k: 'activo', t: 'A la venta', tipo: 'check' }],
  p ? { ...p, precio: dinero(p.precio), precio_antes: p.precio_antes == null ? '' : dinero(p.precio_antes), comandos: p.comandos.join('\n') }
    : { categoria_id: estado.catSel ?? '', precio: '', orden: paqsDe(estado.modSel, estado.catSel ?? null).length, activo: 1, comandos: '' },
  async v => {
    const d = { nombre: v.nombre, modalidad_id: estado.modSel, categoria_id: v.categoria_id === '' ? null : Number(v.categoria_id),
      precio: aCentavos(v.precio), precio_antes: v.precio_antes === '' ? null : aCentavos(v.precio_antes), imagen: v.imagen, descripcion: v.descripcion,
      comandos: v.comandos.split('\n').map(x => x.trim()).filter(Boolean), orden: Number(v.orden) || 0, activo: v.activo };
    if (p) await api('/paquetes/' + p.id, 'PATCH', d); else await api('/paquetes', 'POST', d);
    await refrescar();
  },
  p && (async () => { await api('/paquetes/' + p.id, 'DELETE'); await refrescar(); }));
}

function vistaCatalogo() {
  const mid = estado.modSel;
  const cats = catsDe(mid);
  const lista = paqsDe(mid, estado.catSel ?? null);
  const nombreCat = estado.catSel == null ? 'Destacados / evento' : cats.find(c => c.id === estado.catSel)?.nombre;
  const col = (titulo, accion, items) => h('section', { class: 'caja' }, h('h2', {}, titulo, accion), items);
  return h('div', { class: 'cols' },
    col('Modalidades', h('button', { class: 's', onclick: () => editarModalidad() }, '+ Nueva'),
      h('ul', { class: 'lista' }, estado.mods.map(m => h('li', {}, h('button', { class: 'fila', 'aria-current': m.id === mid, onclick: () => { estado.modSel = m.id; estado.catSel = undefined; pintar(); } },
        h('span', {}, `${m.emoji} ${m.nombre}`, !m.activo && h('small', {}, ' · oculta')), h('small', {}, estado.paqs.filter(p => p.modalidad_id === m.id).length)))))),
    col('Categorías', mid && h('button', { class: 's', onclick: () => editarCategoria() }, '+ Nueva'),
      mid ? h('ul', { class: 'lista' },
        h('li', {}, h('button', { class: 'fila', 'aria-current': estado.catSel == null, onclick: () => { estado.catSel = undefined; pintar(); } }, h('span', {}, 'Destacados / evento'), h('small', {}, paqsDe(mid, null).length))),
        cats.map(c => h('li', {}, h('button', { class: 'fila', 'aria-current': c.id === estado.catSel, onclick: () => { estado.catSel = c.id; pintar(); } },
          h('span', {}, `${c.emoji} ${c.nombre}`, !c.activo && h('small', {}, ' · oculta')), h('small', {}, paqsDe(mid, c.id).length)))))
        : h('p', { class: 'vacio' }, 'Crea una modalidad primero.')),
    col(`Paquetes · ${nombreCat || ''}`, h('span', { style: 'display:flex;gap:6px' },
      estado.catSel != null && h('button', { class: 's', onclick: () => editarCategoria(cats.find(c => c.id === estado.catSel)) }, 'Editar categoría'),
      mid && h('button', { class: 's', onclick: () => editarModalidad(modActual()) }, 'Editar modalidad'),
      mid && h('button', { class: 'b', onclick: () => editarPaquete() }, '+ Paquete')),
      lista.length ? h('div', { class: 'tabla' }, h('table', {}, h('thead', {}, h('tr', {}, ['Nombre', 'Precio', 'Antes', 'Comandos', 'Estado', ''].map(t => h('th', {}, t)))),
        h('tbody', {}, lista.map(p => h('tr', {}, h('td', { class: 'nombre' }, p.nombre), h('td', { class: 'n' }, dinero(p.precio)),
          h('td', { class: 'n' }, p.precio_antes == null ? '—' : dinero(p.precio_antes)), h('td', { class: 'n' }, p.comandos.length),
          h('td', {}, h('span', { class: 'pill ' + (p.activo ? 'ok' : 'mal') }, p.activo ? 'a la venta' : 'oculto')),
          h('td', {}, h('button', { class: 's', onclick: () => editarPaquete(p) }, 'Editar'))))))) : h('p', { class: 'vacio' }, 'No hay paquetes aquí todavía.')));
}

// ---------- ofertas y cupones
const alcanceNombre = o => {
  if (o.alcance === 'todo') return 'Toda la tienda';
  const t = { modalidad: () => estado.mods.find(x => x.id === o.alcance_id)?.nombre, categoria: () => estado.cats.find(x => x.id === o.alcance_id)?.nombre, paquete: () => estado.paqs.find(x => x.id === o.alcance_id)?.nombre }[o.alcance]();
  return `${o.alcance}: ${t || '(eliminado)'}`;
};
function editarOferta(o) {
  formulario(o ? 'Editar oferta' : 'Nueva oferta', [
    { k: 'nombre', t: 'Nombre', max: 80 },
    { k: 'tipo', t: 'Tipo', tipo: 'select', opciones: [['porcentaje', 'Porcentaje'], ['fijo', 'Cantidad fija']] },
    { k: 'valor', t: 'Valor (% o cantidad en la moneda)', tipo: 'number' },
    { k: 'alcance', t: 'Se aplica a', tipo: 'select', opciones: [['todo', 'Toda la tienda'], ['modalidad', 'Una modalidad'], ['categoria', 'Una categoría'], ['paquete', 'Un paquete']] },
    { k: 'alcance_id', t: 'ID del elemento (modalidad, categoría o paquete)', tipo: 'number' },
    { k: 'inicio', t: 'Empieza (opcional)', tipo: 'datetime-local' }, { k: 'fin', t: 'Termina (opcional)', tipo: 'datetime-local' },
    { k: 'activo', t: 'Activa', tipo: 'check' }],
  o ? { ...o, valor: o.tipo === 'fijo' ? dinero(o.valor) : o.valor, inicio: aLocal(o.inicio), fin: aLocal(o.fin) } : { tipo: 'porcentaje', alcance: 'todo', activo: 1 },
  async v => {
    const d = { nombre: v.nombre, tipo: v.tipo, valor: v.tipo === 'fijo' ? aCentavos(v.valor) : Math.round(Number(v.valor)), alcance: v.alcance,
      alcance_id: v.alcance === 'todo' || v.alcance_id === '' ? null : Number(v.alcance_id), inicio: deLocal(v.inicio), fin: deLocal(v.fin), activo: v.activo };
    if (o) await api('/ofertas/' + o.id, 'PATCH', d); else await api('/ofertas', 'POST', d); await refrescar();
  }, o && (async () => { await api('/ofertas/' + o.id, 'DELETE'); await refrescar(); }));
}
function editarCupon(c) {
  formulario(c ? 'Editar cupón' : 'Nuevo cupón', [
    { k: 'codigo', t: 'Código', max: 40 }, { k: 'tipo', t: 'Tipo', tipo: 'select', opciones: [['porcentaje', 'Porcentaje'], ['fijo', 'Cantidad fija']] },
    { k: 'valor', t: 'Valor (% o cantidad en la moneda)', tipo: 'number' }, { k: 'usos_max', t: 'Usos máximos (vacío = ilimitado)', tipo: 'number' },
    { k: 'expira', t: 'Caduca (opcional)', tipo: 'datetime-local' }, { k: 'activo', t: 'Activo', tipo: 'check' }],
  c ? { ...c, valor: c.tipo === 'fijo' ? dinero(c.valor) : c.valor, expira: aLocal(c.expira) } : { tipo: 'porcentaje', activo: 1 },
  async v => {
    const d = { codigo: v.codigo, tipo: v.tipo, valor: v.tipo === 'fijo' ? aCentavos(v.valor) : Math.round(Number(v.valor)),
      usos_max: v.usos_max === '' ? null : Number(v.usos_max), expira: deLocal(v.expira), activo: v.activo };
    if (c) await api('/cupones/' + c.id, 'PATCH', d); else await api('/cupones', 'POST', d); await refrescar();
  }, c && (async () => { await api('/cupones/' + c.id, 'DELETE'); await refrescar(); }));
}
const valorTxt = x => (x.tipo === 'porcentaje' ? `${x.valor}%` : dinero(x.valor));
function tablaSimple(cab, filas, vacio) {
  return filas.length ? h('div', { class: 'caja tabla' }, h('table', {}, h('thead', {}, h('tr', {}, cab.map(t => h('th', {}, t)))), h('tbody', {}, filas)))
    : h('p', { class: 'caja vacio' }, vacio);
}
function vistaOfertas() {
  const ahora = new Date().toISOString();
  const vigente = o => o.activo && (!o.inicio || o.inicio <= ahora) && (!o.fin || o.fin >= ahora);
  return h('div', {}, h('div', { class: 'barra' }, h('span', { class: 'espacio' }, 'Las ofertas rebajan el precio en la tienda mientras estén vigentes. Si varias coinciden, gana la más barata.'), h('button', { class: 'b', onclick: () => editarOferta() }, '+ Nueva oferta')),
    tablaSimple(['Nombre', 'Descuento', 'Se aplica a', 'Desde', 'Hasta', 'Estado', ''], estado.ofertas.map(o => h('tr', {}, h('td', { class: 'nombre' }, o.nombre), h('td', { class: 'n' }, valorTxt(o)),
      h('td', {}, alcanceNombre(o)), h('td', {}, fechaCorta(o.inicio)), h('td', {}, fechaCorta(o.fin)),
      h('td', {}, h('span', { class: 'pill ' + (vigente(o) ? 'ok' : 'mal') }, vigente(o) ? 'vigente' : o.activo ? 'fuera de fechas' : 'desactivada')),
      h('td', {}, h('button', { class: 's', onclick: () => editarOferta(o) }, 'Editar')))), 'Todavía no hay ofertas.'));
}
function vistaCupones() {
  return h('div', {}, h('div', { class: 'barra' }, h('span', { class: 'espacio' }, 'Los cupones se canjean en el carrito y descuentan sobre el total.'), h('button', { class: 'b', onclick: () => editarCupon() }, '+ Nuevo cupón')),
    tablaSimple(['Código', 'Descuento', 'Usos', 'Caduca', 'Estado', ''], estado.cupones.map(c => h('tr', {}, h('td', {}, h('b', {}, c.codigo)), h('td', { class: 'n' }, valorTxt(c)),
      h('td', { class: 'n' }, `${c.usos}${c.usos_max != null ? ' / ' + c.usos_max : ''}`), h('td', {}, fechaCorta(c.expira)),
      h('td', {}, h('span', { class: 'pill ' + (c.activo ? 'ok' : 'mal') }, c.activo ? 'activo' : 'desactivado')),
      h('td', {}, h('button', { class: 's', onclick: () => editarCupon(c) }, 'Editar')))), 'Todavía no hay cupones.'));
}
function vistaPedidos() {
  const cls = { pagado: 'ok', pendiente: 'pen', fallido: 'mal', reembolsado: 'mal' };
  return h('div', {}, h('div', { class: 'barra' }, h('span', { class: 'espacio' }, 'Últimos 200 pedidos.'), h('button', { class: 's', onclick: () => intentar(refrescar) }, 'Actualizar')),
    tablaSimple(['Fecha', 'Jugador', 'Edición', 'Total', 'Cupón', 'Proveedor', 'Estado'], estado.pedidos.map(p => h('tr', {}, h('td', {}, fechaCorta(p.creado)), h('td', {}, p.usuario), h('td', {}, p.edicion),
      h('td', { class: 'n' }, `${dinero(p.total)} ${p.moneda}`), h('td', {}, p.cupon || '—'), h('td', {}, p.proveedor), h('td', {}, h('span', { class: 'pill ' + (cls[p.estado] || '') }, p.estado)))), 'Aún no hay pedidos.'));
}

// ---------- estructura
const TABS = [['catalogo', 'Catálogo', vistaCatalogo], ['ofertas', 'Ofertas', vistaOfertas], ['cupones', 'Cupones', vistaCupones], ['pedidos', 'Pedidos', vistaPedidos]];
function pintar() {
  const vista = TABS.find(t => t[0] === estado.tab)[2];
  app.replaceChildren(
    h('header', { class: 'top' }, h('h1', {}, 'Panel MeeTion'),
      h('nav', { role: 'tablist' }, TABS.map(([id, t]) => h('button', { role: 'tab', 'aria-selected': id === estado.tab, onclick: () => { estado.tab = id; pintar(); } }, t))),
      h('button', { class: 's', onclick: () => intentar(async () => { await api('/logout', 'POST'); pintarLogin(); }) }, 'Salir')),
    h('main', {}, vista()));
}
async function refrescar() { await cargar(); pintar(); }
async function iniciar() { await cargar(); pintar(); }

(async () => {
  try { await api('/sesion'); await iniciar(); } catch { pintarLogin(); }
})();
