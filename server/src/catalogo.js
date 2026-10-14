import { todos } from './db.js';
import { ofertasVigentes, precioFinal } from './precios.js';

const usd = c => Math.round(c) / 100;

// Mismo formato que data/catalogo.json: producto = [id, nombre, precio, precioAntes|null, imagen]
export function construirCatalogo() {
  const ofertas = ofertasVigentes();
  const mods = todos('SELECT * FROM modalidades WHERE activo = 1 ORDER BY orden, id');
  const cats = todos('SELECT * FROM categorias WHERE activo = 1 ORDER BY orden, id');
  const paqs = todos('SELECT * FROM paquetes WHERE activo = 1 ORDER BY orden, id');
  const producto = p => {
    const f = precioFinal(p, ofertas);
    return [String(p.id), p.nombre, usd(f.precio), f.antes == null ? null : usd(f.antes), p.imagen];
  };
  return mods.map(m => ({
    nombre: m.nombre, emoji: m.emoji, slug: m.slug,
    evento: paqs.filter(p => p.modalidad_id === m.id && p.categoria_id == null).map(producto),
    categorias: cats.filter(c => c.modalidad_id === m.id).map(c => ({
      nombre: c.nombre, emoji: c.emoji, slug: c.slug, aviso: c.aviso,
      productos: paqs.filter(p => p.categoria_id === c.id).map(producto),
    })),
  }));
}
