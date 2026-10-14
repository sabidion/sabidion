import { simulado } from './simulado.js';

const proveedores = { simulado };

// Interfaz común: crear(pedido) -> { url, ref? }. La fase 2 añade aquí el proveedor "tebex".
export function proveedorActivo() {
  const nombre = process.env.PAGO_PROVEEDOR || 'simulado';
  const p = proveedores[nombre];
  if (!p) throw new Error(`Proveedor de pago desconocido: ${nombre}`);
  return p;
}
