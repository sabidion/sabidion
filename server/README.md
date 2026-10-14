# API de la tienda de MeeTion Network

Backend sin dependencias externas (Node.js 22.13 o superior, SQLite integrado). Gestiona el catálogo, las ofertas,
los cupones, los pedidos y la cola de entregas que consumirá el plugin de Velocity/Leaf.

## Qué incluye (fase 1)

| Pieza | Descripción |
| --- | --- |
| `GET /api/catalogo` | Catálogo en el mismo formato que `data/catalogo.json`, con las ofertas vigentes aplicadas. |
| `POST /api/cotizar` | Calcula subtotal, descuento y total en el servidor. |
| `POST /api/pedidos` | Crea el pedido (los precios salen de la base de datos, nunca del navegador) y devuelve la URL de pago. |
| `/pago/simulado/:id` | Proveedor de pruebas: no cobra nada. |
| `/admin` | Panel: modalidades, categorías, paquetes con comandos de entrega, ofertas, cupones y pedidos. |
| `GET /api/plugin/cola`, `POST /api/plugin/confirmar` | Cola de entregas para el plugin (token `PLUGIN_TOKEN`). |

Los pagos son una capa intercambiable (`src/pagos/`). La fase 2 añade el proveedor `tebex` (Checkout API) sin tocar pedidos ni entregas.

## Puesta en marcha en el VPS

```bash
# Node 22.13+ instalado (node -v)
git clone https://github.com/sabidion/sabidion /opt/sabidion
cd /opt/sabidion/server
cp .env.example .env        # rellena ADMIN_PASSWORD, SESSION_SECRET, PLUGIN_TOKEN, CORS_ORIGIN, PUBLIC_URL
npm run seed                # importa el catálogo actual (solo si la base está vacía)
npm start                   # http://127.0.0.1:3000
```

Genera los secretos con `openssl rand -hex 32`. El archivo `.env` está en `.gitignore`: no se sube al repositorio.

Para dejarlo como servicio, copia `deploy/meetion-tienda.service` a `/etc/systemd/system/`, crea el usuario `meetion`,
dale propiedad de `/opt/sabidion/server/data` y ejecuta `systemctl enable --now meetion-tienda`.
Pon HTTPS delante con nginx (`deploy/nginx.conf.ejemplo`) y activa `COOKIE_SECURE=1`.

## Conectar la web

En `config.js` de la raíz del repositorio, pon la URL de la API:

```js
window.MEETION_API = 'https://api.tudominio.com';
```

Y en `.env` del servidor, `CORS_ORIGIN` debe ser el origen exacto de la web (por ejemplo `https://sabidion.github.io`).
Con `MEETION_API` vacío, la web sigue en modo demostración.

## Notas de seguridad

- Los precios se guardan en centavos y se recalculan siempre en el servidor.
- El panel usa sesión firmada (cookie `HttpOnly`, `SameSite=Strict`) y limita los intentos de login.
- `/api/admin/*` no envía cabeceras CORS: solo funciona desde el propio panel.
- Haz copias de seguridad de `data/tienda.db` (por ejemplo con `sqlite3 data/tienda.db ".backup copia.db"`).

## Pruebas

```bash
npm test
```
