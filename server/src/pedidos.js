import { randomUUID } from 'node:crypto';
import { todos, uno, ejecutar, transaccion } from './db.js';
import { ofertasVigentes, precioFinal, descontar } from './precios.js';

export class ErrorPublico extends Error {
  constructor(mensaje, estado = 400) { super(mensaje); this.estado = estado; }
}

const MONEDA = () => process.env.MONEDA || 'USD';
const reUsuario = /^\.?[A-Za-z0-9_ ]{2,16}$/;

export function buscarCupon(codigo) {
  const c = uno('SELECT * FROM cupones WHERE codigo = ? COLLATE NOCASE', String(codigo || '').trim());
  if (!c || !c.activo) return null;
  if (c.expira && c.expira < new Date().toISOString()) return null;
  if (c.usos_max != null && c.usos >= c.usos_max) return null;
  return c;
}

// Calcula todo en el servidor: el navegador solo manda ids y cantidades.
export function cotizar({ items, cupon }) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new ErrorPublico('El carrito está vacío o es demasiado grande.');
  const ofertas = ofertasVigentes();
  const juntos = new Map();
  for (const it of items) {
    const id = Number(it?.id), cant = Number(it?.cant);
    if (!Number.isInteger(id) || !Number.isInteger(cant) || cant < 1 || cant > 20) throw new ErrorPublico('Cantidad o producto no válido.');
    juntos.set(id, (juntos.get(id) || 0) + cant);
  }
  const lineas = [];
  for (const [id, cant] of juntos) {
    const p = uno(`SELECT p.*, m.slug AS mod_slug, m.activo AS mod_activo FROM paquetes p
                   JOIN modalidades m ON m.id = p.modalidad_id WHERE p.id = ?`, id);
    if (!p || !p.activo || !p.mod_activo) throw new ErrorPublico(`El producto ${id} ya no está disponible.`, 409);
    lineas.push({ paquete_id: p.id, modalidad: p.mod_slug, nombre: p.nombre, precio: precioFinal(p, ofertas).precio, cantidad: cant, comandos: p.comandos });
  }
  const subtotal = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  let descuento = 0, cuponAplicado = null;
  if (cupon) {
    const c = buscarCupon(cupon);
    if (!c) throw new ErrorPublico('El cupón no es válido o ha caducado.');
    descuento = subtotal - descontar(subtotal, c.tipo, c.valor);
    cuponAplicado = c.codigo;
  }
  return { lineas, subtotal, descuento, total: subtotal - descuento, cupon: cuponAplicado };
}

export function crearPedido({ usuario, edicion, items, cupon }, proveedor) {
  usuario = String(usuario || '').trim();
  if (!reUsuario.test(usuario)) throw new ErrorPublico('El nombre de usuario no es válido.');
  if (!['java', 'bedrock'].includes(edicion)) throw new ErrorPublico('Elige Java o Bedrock.');
  const c = cotizar({ items, cupon });
  if (c.total <= 0) throw new ErrorPublico('El total debe ser mayor que cero.');
  const id = randomUUID();
  transaccion(() => {
    ejecutar(`INSERT INTO pedidos (id, usuario, edicion, subtotal, descuento, total, moneda, cupon, proveedor, creado)
              VALUES (?,?,?,?,?,?,?,?,?,?)`, id, usuario, edicion, c.subtotal, c.descuento, c.total, MONEDA(), c.cupon, proveedor, new Date().toISOString());
    for (const l of c.lineas)
      ejecutar(`INSERT INTO pedido_lineas (pedido_id, paquete_id, modalidad, nombre, precio, cantidad, comandos) VALUES (?,?,?,?,?,?,?)`,
        id, l.paquete_id, l.modalidad, l.nombre, l.precio, l.cantidad, l.comandos);
  });
  return obtenerPedido(id);
}

export function obtenerPedido(id) {
  const p = uno('SELECT * FROM pedidos WHERE id = ?', id);
  if (!p) return null;
  return { ...p, lineas: todos('SELECT * FROM pedido_lineas WHERE pedido_id = ?', id) };
}

// Idempotente: solo pasa de pendiente a pagado una vez y genera las entregas una vez.
export function marcarPagado(id, refExterna = null) {
  return transaccion(() => {
    const p = uno('SELECT * FROM pedidos WHERE id = ?', id);
    if (!p) throw new ErrorPublico('Pedido no encontrado.', 404);
    if (p.estado !== 'pendiente') return { yaProcesado: true, pedido: p };
    const ahora = new Date().toISOString();
    ejecutar(`UPDATE pedidos SET estado='pagado', pagado=?, ref_externa=COALESCE(?, ref_externa) WHERE id=?`, ahora, refExterna, id);
    for (const l of todos('SELECT * FROM pedido_lineas WHERE pedido_id = ?', id)) {
      let comandos = [];
      try { comandos = JSON.parse(l.comandos); } catch { /* sin comandos */ }
      for (let i = 0; i < l.cantidad; i++)
        for (const comando of comandos)
          ejecutar(`INSERT INTO entregas (pedido_id, servidor, usuario, edicion, comando, creado) VALUES (?,?,?,?,?,?)`,
            id, l.modalidad, p.usuario, p.edicion, comando, ahora);
    }
    if (p.cupon) ejecutar('UPDATE cupones SET usos = usos + 1 WHERE codigo = ? COLLATE NOCASE', p.cupon);
    return { yaProcesado: false, pedido: uno('SELECT * FROM pedidos WHERE id = ?', id) };
  });
}
