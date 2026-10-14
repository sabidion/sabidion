import { todos } from './db.js';

const ahora = () => new Date().toISOString();

export function ofertasVigentes(fecha = ahora()) {
  return todos(
    `SELECT * FROM ofertas WHERE activo = 1
       AND (inicio IS NULL OR inicio <= ?) AND (fin IS NULL OR fin >= ?)`, fecha, fecha);
}

export const aplicaOferta = (o, p) =>
  o.alcance === 'todo' ||
  (o.alcance === 'modalidad' && o.alcance_id === p.modalidad_id) ||
  (o.alcance === 'categoria' && o.alcance_id === p.categoria_id) ||
  (o.alcance === 'paquete' && o.alcance_id === p.id);

export function descontar(precio, tipo, valor) {
  const rebajado = tipo === 'porcentaje' ? Math.round(precio * (100 - Math.min(valor, 100)) / 100) : precio - valor;
  return Math.max(0, rebajado);
}

// Devuelve { precio, antes, oferta } en centavos. Gana la oferta que deja el precio más bajo.
export function precioFinal(p, ofertas) {
  let mejor = p.precio, oferta = null;
  for (const o of ofertas) {
    if (!aplicaOferta(o, p)) continue;
    const candidato = descontar(p.precio, o.tipo, o.valor);
    if (candidato < mejor) { mejor = candidato; oferta = o; }
  }
  return { precio: mejor, antes: oferta ? p.precio : (p.precio_antes ?? null), oferta };
}
