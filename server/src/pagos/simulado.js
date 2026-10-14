// Proveedor de pruebas: no cobra nada. Lleva a una página local con un botón "Simular pago".
export const simulado = {
  nombre: 'simulado',
  async crear(pedido) {
    const base = (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
    return { url: `${base}/pago/simulado/${pedido.id}` };
  },
};
