import { createHmac, timingSafeEqual } from 'node:crypto';

const DURACION_MS = 8 * 60 * 60 * 1000;
const secreto = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('Define SESSION_SECRET (mínimo 16 caracteres) en .env');
  return s;
};
const firmar = dato => createHmac('sha256', secreto()).update(dato).digest('base64url');

export function iguales(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function crearSesion() {
  const exp = String(Date.now() + DURACION_MS);
  return `${exp}.${firmar(exp)}`;
}

export function sesionValida(valor) {
  if (!valor) return false;
  const [exp, firma] = valor.split('.');
  if (!exp || !firma || !iguales(firma, firmar(exp))) return false;
  return Number(exp) > Date.now();
}

export const leerCookie = (req, nombre) =>
  (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).find(([k]) => k === nombre)?.[1];

export function cookieSesion(valor, borrar = false) {
  const partes = [`sid=${valor}`, 'HttpOnly', 'SameSite=Strict', 'Path=/', `Max-Age=${borrar ? 0 : DURACION_MS / 1000}`];
  if (process.env.COOKIE_SECURE === '1') partes.push('Secure');
  return partes.join('; ');
}

// Límite simple de intentos de login por IP: 5 por minuto.
const intentos = new Map();
export function demasiadosIntentos(ip) {
  const ahora = Date.now();
  const lista = (intentos.get(ip) || []).filter(t => ahora - t < 60_000);
  lista.push(ahora);
  intentos.set(ip, lista);
  return lista.length > 5;
}
