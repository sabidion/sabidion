// Importa data/catalogo.json (el catálogo actual de la maqueta) a la base de datos.
// Solo actúa si la base está vacía. Uso: npm run seed
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { uno, ejecutar, transaccion } from '../src/db.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const origen = process.argv[2] || resolve(aqui, '../../data/catalogo.json');

if (uno('SELECT COUNT(*) AS n FROM modalidades').n > 0) {
  console.log('La base de datos ya tiene datos; no se importa nada.');
  process.exit(0);
}
const cents = n => (n == null ? null : Math.round(n * 100));
const catalogo = JSON.parse(readFileSync(origen, 'utf8'));
let nMod = 0, nCat = 0, nPaq = 0;
transaccion(() => {
  catalogo.forEach((m, i) => {
    const { lastInsertRowid: mid } = ejecutar('INSERT INTO modalidades (slug, nombre, emoji, orden) VALUES (?,?,?,?)', m.slug, m.nombre, m.emoji || '', i);
    nMod++;
    const paquete = (p, orden, categoriaId) => {
      ejecutar(`INSERT INTO paquetes (modalidad_id, categoria_id, nombre, precio, precio_antes, imagen, ref_externa, orden)
                VALUES (?,?,?,?,?,?,?,?)`, mid, categoriaId, p[1], cents(p[2] ?? 0), cents(p[3]), p[4] || '', String(p[0]), orden);
      nPaq++;
    };
    m.evento.forEach((p, j) => paquete(p, j, null));
    m.categorias.forEach((c, k) => {
      const { lastInsertRowid: cid } = ejecutar('INSERT INTO categorias (modalidad_id, slug, nombre, emoji, aviso, orden) VALUES (?,?,?,?,?,?)',
        mid, c.slug, c.nombre, c.emoji || '', c.aviso || '', k);
      nCat++;
      c.productos.forEach((p, j) => paquete(p, j, cid));
    });
  });
});
console.log(`Importadas ${nMod} modalidades, ${nCat} categorías y ${nPaq} paquetes.`);
