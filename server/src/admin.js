import { todos, uno, ejecutar } from './db.js';
import { ErrorPublico } from './pedidos.js';

const texto = (v, max = 200) => {
  if (typeof v !== 'string') throw new ErrorPublico('Se esperaba un texto.');
  if (v.length > max) throw new ErrorPublico(`Texto demasiado largo (máximo ${max}).`);
  return v;
};
const entero = (min = 0, max = 2_000_000_000) => v => {
  if (!Number.isInteger(v) || v < min || v > max) throw new ErrorPublico(`Número entero no válido (${min} a ${max}).`);
  return v;
};
const opcional = f => v => (v == null || v === '' ? null : f(v));
const bool = v => (v === true || v === 1 ? 1 : v === false || v === 0 ? 0 : (() => { throw new ErrorPublico('Se esperaba verdadero o falso.'); })());
const elegir = (...ops) => v => (ops.includes(v) ? v : (() => { throw new ErrorPublico(`Valor no permitido: ${ops.join(', ')}.`); })());
const fecha = opcional(v => { if (Number.isNaN(Date.parse(v))) throw new ErrorPublico('Fecha no válida.'); return new Date(v).toISOString(); });
const slug = v => { if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(v)) throw new ErrorPublico('El slug solo admite minúsculas, números y guiones.'); return v; };
const comandos = v => {
  if (!Array.isArray(v) || v.length > 30 || !v.every(c => typeof c === 'string' && c.length > 0 && c.length <= 300))
    throw new ErrorPublico('Los comandos deben ser una lista de textos (máximo 30).');
  return JSON.stringify(v.map(c => c.replace(/^\//, '')));
};

// Campos editables por tabla, con su validador. Los precios van en centavos.
const TABLAS = {
  modalidades: { orden: 'orden, id', campos: {
    slug: v => slug(texto(v, 60)), nombre: v => texto(v, 80), emoji: v => texto(v, 8), orden: entero(0, 9999), activo: bool } },
  categorias: { orden: 'modalidad_id, orden, id', campos: {
    modalidad_id: entero(1), slug: v => slug(texto(v, 80)), nombre: v => texto(v, 80), emoji: v => texto(v, 8),
    aviso: v => texto(v, 400), orden: entero(0, 9999), activo: bool } },
  paquetes: { orden: 'modalidad_id, categoria_id, orden, id', campos: {
    modalidad_id: entero(1), categoria_id: opcional(entero(1)), nombre: v => texto(v, 120), precio: entero(0, 100_000_000),
    precio_antes: opcional(entero(0, 100_000_000)), imagen: v => texto(v, 200), descripcion: v => texto(v, 2000),
    comandos, orden: entero(0, 9999), activo: bool } },
  ofertas: { orden: 'id DESC', campos: {
    nombre: v => texto(v, 80), tipo: elegir('porcentaje', 'fijo'), valor: entero(1, 100_000_000),
    alcance: elegir('todo', 'modalidad', 'categoria', 'paquete'), alcance_id: opcional(entero(1)),
    inicio: fecha, fin: fecha, activo: bool } },
  cupones: { orden: 'id DESC', campos: {
    codigo: v => { v = texto(v, 40).trim(); if (!/^[A-Za-z0-9_-]{3,40}$/.test(v)) throw new ErrorPublico('Código: 3-40 letras, números, _ o -.'); return v; },
    tipo: elegir('porcentaje', 'fijo'), valor: entero(1, 100_000_000), usos_max: opcional(entero(1)), expira: fecha, activo: bool } },
};

function validar(cfg, cuerpo, parcial) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) throw new ErrorPublico('Cuerpo JSON no válido.');
  const datos = {};
  for (const [campo, f] of Object.entries(cfg.campos)) {
    if (cuerpo[campo] === undefined) {
      if (!parcial && !['aviso', 'emoji', 'imagen', 'descripcion', 'comandos', 'orden', 'activo', 'precio_antes', 'categoria_id',
        'alcance_id', 'inicio', 'fin', 'usos_max', 'expira', 'alcance'].includes(campo)) throw new ErrorPublico(`Falta el campo "${campo}".`);
      continue;
    }
    datos[campo] = f(cuerpo[campo]);
  }
  return datos;
}

function coherencia(tabla, d, actual = {}) {
  const f = { ...actual, ...d };
  if (tabla === 'paquetes' && f.categoria_id != null) {
    const c = uno('SELECT modalidad_id FROM categorias WHERE id = ?', f.categoria_id);
    if (!c) throw new ErrorPublico('La categoría no existe.');
    if (c.modalidad_id !== f.modalidad_id) throw new ErrorPublico('La categoría pertenece a otra modalidad.');
  }
  if (tabla === 'ofertas' && f.alcance !== 'todo' && f.alcance_id == null) throw new ErrorPublico('Indica a qué se aplica la oferta (alcance_id).');
  if (tabla === 'ofertas' && f.tipo === 'porcentaje' && f.valor > 100) throw new ErrorPublico('Un porcentaje no puede pasar de 100.');
  if (tabla === 'cupones' && f.tipo === 'porcentaje' && f.valor > 100) throw new ErrorPublico('Un porcentaje no puede pasar de 100.');
}

const fila = (tabla, r) => (tabla === 'paquetes' && r ? { ...r, comandos: JSON.parse(r.comandos || '[]') } : r);

export function crudAdmin(tabla, metodo, id, cuerpo) {
  const cfg = TABLAS[tabla];
  if (!cfg) return null;
  if (metodo === 'GET' && id == null) return todos(`SELECT * FROM ${tabla} ORDER BY ${cfg.orden}`).map(r => fila(tabla, r));
  if (metodo === 'POST' && id == null) {
    const d = validar(cfg, cuerpo, false);
    coherencia(tabla, d);
    const cols = Object.keys(d);
    try {
      const r = ejecutar(`INSERT INTO ${tabla} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, ...cols.map(c => d[c]));
      return fila(tabla, uno(`SELECT * FROM ${tabla} WHERE id = ?`, r.lastInsertRowid));
    } catch (e) { throw traducir(e); }
  }
  if (id == null) return undefined;
  const actual = uno(`SELECT * FROM ${tabla} WHERE id = ?`, id);
  if (!actual) throw new ErrorPublico('No existe.', 404);
  if (metodo === 'PATCH') {
    const d = validar(cfg, cuerpo, true);
    coherencia(tabla, d, actual);
    const cols = Object.keys(d);
    if (cols.length) {
      try { ejecutar(`UPDATE ${tabla} SET ${cols.map(c => `${c} = ?`).join(',')} WHERE id = ?`, ...cols.map(c => d[c]), id); }
      catch (e) { throw traducir(e); }
    }
    return fila(tabla, uno(`SELECT * FROM ${tabla} WHERE id = ?`, id));
  }
  if (metodo === 'DELETE') { ejecutar(`DELETE FROM ${tabla} WHERE id = ?`, id); return { ok: true }; }
  return undefined;
}

function traducir(e) {
  if (/UNIQUE/.test(e.message)) return new ErrorPublico('Ya existe un registro con ese slug o código.', 409);
  if (/CHECK|FOREIGN KEY|NOT NULL/.test(e.message)) return new ErrorPublico('Datos no válidos para esa tabla.');
  return e;
}

export function listarPedidos() {
  return todos('SELECT * FROM pedidos ORDER BY creado DESC LIMIT 200');
}
