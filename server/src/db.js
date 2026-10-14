import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const ruta = process.env.DB_PATH || resolve(aqui, '../data/tienda.db');
if (ruta !== ':memory:') mkdirSync(dirname(ruta), { recursive: true });

export const db = new DatabaseSync(ruta);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS modalidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  orden INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modalidad_id INTEGER NOT NULL REFERENCES modalidades(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  nombre TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  aviso TEXT NOT NULL DEFAULT '',
  orden INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  UNIQUE (modalidad_id, slug)
);
-- precio y precio_antes en centavos. categoria_id NULL = sección "destacados/evento" de la modalidad.
CREATE TABLE IF NOT EXISTS paquetes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modalidad_id INTEGER NOT NULL REFERENCES modalidades(id) ON DELETE CASCADE,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio INTEGER NOT NULL CHECK (precio >= 0),
  precio_antes INTEGER CHECK (precio_antes IS NULL OR precio_antes >= 0),
  imagen TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL DEFAULT '',
  comandos TEXT NOT NULL DEFAULT '[]',
  ref_externa TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_paquetes_cat ON paquetes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_paquetes_mod ON paquetes(modalidad_id);
-- tipo: porcentaje (valor 1-100) o fijo (valor en centavos). alcance: todo | modalidad | categoria | paquete
CREATE TABLE IF NOT EXISTS ofertas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('porcentaje','fijo')),
  valor INTEGER NOT NULL CHECK (valor > 0),
  alcance TEXT NOT NULL DEFAULT 'todo' CHECK (alcance IN ('todo','modalidad','categoria','paquete')),
  alcance_id INTEGER,
  inicio TEXT,
  fin TEXT,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS cupones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('porcentaje','fijo')),
  valor INTEGER NOT NULL CHECK (valor > 0),
  usos_max INTEGER,
  usos INTEGER NOT NULL DEFAULT 0,
  expira TEXT,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  usuario TEXT NOT NULL,
  edicion TEXT NOT NULL CHECK (edicion IN ('java','bedrock')),
  subtotal INTEGER NOT NULL,
  descuento INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  moneda TEXT NOT NULL,
  cupon TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado','fallido','reembolsado')),
  proveedor TEXT NOT NULL,
  ref_externa TEXT,
  creado TEXT NOT NULL,
  pagado TEXT
);
CREATE TABLE IF NOT EXISTS pedido_lineas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  paquete_id INTEGER NOT NULL,
  modalidad TEXT NOT NULL,
  nombre TEXT NOT NULL,
  precio INTEGER NOT NULL,
  cantidad INTEGER NOT NULL,
  comandos TEXT NOT NULL DEFAULT '[]'
);
-- Cola que consume el plugin de Velocity/Leaf. servidor = slug de modalidad.
CREATE TABLE IF NOT EXISTS entregas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  servidor TEXT NOT NULL,
  usuario TEXT NOT NULL,
  edicion TEXT NOT NULL,
  comando TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','entregado','error')),
  intentos INTEGER NOT NULL DEFAULT 0,
  creado TEXT NOT NULL,
  entregado TEXT
);
CREATE INDEX IF NOT EXISTS idx_entregas_estado ON entregas(estado, servidor);
`);

export const todos = (sql, ...p) => db.prepare(sql).all(...p);
export const uno = (sql, ...p) => db.prepare(sql).get(...p);
export const ejecutar = (sql, ...p) => db.prepare(sql).run(...p);

export function transaccion(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}
