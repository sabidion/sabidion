/* MeeTion Network · maqueta de web completa (Maikel Ferrer) */
const IP = 'meetionmc.net';
const DISCORD = 'meetionmc';
const CDN = 'https://dunb17ur4ymx4.cloudfront.net/packages/images/';
const FIN_HALLOWEEN = new Date('2026-11-01T00:00:00-05:00');
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const usd = n => (n ?? 0).toFixed(2) + ' USD';
const guardar = (k, v) => { try { localStorage.setItem('meetion-' + k, JSON.stringify(v)); } catch {} };
const leer = (k, d) => { try { const v = localStorage.getItem('meetion-' + k); return v ? JSON.parse(v) : d; } catch { return d; } };

/* ======================= contenido fijo ======================= */
const MODALIDADES = {
  'survival-rpg': { icono: 'espada', texto: 'Supervivencia con progresión de RPG: encantos custom, mochilas VIP, bóvedas, trabajos con /jobs, skills, pets y armas funcionales.' },
  'towny': { icono: 'castillo', texto: 'Funda o únete a una ciudad y expande tu territorio. Con vehículos, McMMO, trabajos y su propio pase de batalla.' },
  'prison-op': { icono: 'pico', texto: 'Mina, sube de rango y hazte con el mejor equipo. Armas funcionales, llaves, kits, spawners y skills.' },
  'survival-op': { icono: 'corona', texto: 'Supervivencia potenciada: minions, rankups, ecustoms, packs y el Evento Dioses Griegos.' },
  'earth': { icono: 'globo', texto: 'La modalidad Earth, con vehículos, kits, skills, pets y el Evento Cyber Futurista.' },
  'doom-box': { icono: 'llama', texto: 'Box PvP con rangos Lite, Flash y temporales, GKits, revives, ítems y accesos.' },
};
const NOMBRE_DESTACADOS = {
  'survival-rpg': '🎃 Evento Halloween', 'towny': '🎃 Evento Halloween', 'prison-op': '🎃 Evento Halloween',
  'earth': '🤖 Evento Cyber Futurista', 'globales': '🌐 Rangos globales', 'doom-box': '🪐 Membresías', 'cuentas': '📌 Servicios de cuenta', 'survival-op': '⚔️ Destacados',
};

// Ventajas reales de los rangos permanentes de Survival RPG (tienda pública)
const RANGOS_RPG = [
  { r: 'Bronce', precio: 11.99, homes: 8, jobs: '5', encantos: 4, mochila: 'VIP', boveda: 36, proteccion: '—', extra: '' },
  { r: 'Plata', precio: 23.99, homes: 9, jobs: '5', encantos: 4, mochila: 'VIP', boveda: 36, proteccion: 60, extra: '' },
  { r: 'Oro', precio: 44.99, homes: 10, jobs: '6', encantos: 5, mochila: 'VIP+', boveda: 45, proteccion: 70, extra: '' },
  { r: 'Diamante', precio: 56.24, homes: 11, jobs: '6', encantos: 5, mochila: 'VIP+', boveda: 45, proteccion: 80, extra: '' },
  { r: 'Esmeralda', precio: 67.49, homes: 12, jobs: '7', encantos: 5, mochila: 'VIP++', boveda: 54, proteccion: 90, extra: '' },
  { r: 'Rubí', precio: 82.49, homes: 13, jobs: '8', encantos: 6, mochila: '—', boveda: '—', proteccion: 100, extra: 'Prefijo único personalizado · /near' },
  { r: 'Amatista', precio: 187.49, homes: 18, jobs: 'Todos', encantos: 6, mochila: '—', boveda: '—', proteccion: 150, extra: 'MeeTion Pass Premium permanente · Armor Stand custom · prefijo personalizado · /near' },
];
const VENTAJAS_GENERALES = ['Entrar a la network y a la modalidad cuando estén llenas', 'Prefijo del rango en el chat y en el tabulador', 'Prioridad en la cola', 'Rol en el Discord y chat exclusivo para VIPs', 'Mayor soporte en Discord y dentro del juego'];
const COMANDOS = [
  ['/recipe', 'Ver crafteos'], ['/ec', 'Abrir tu enderchest en cualquier lado'], ['/grindstone', 'Desencantar ítems'], ['/dispose', 'Eliminar basura'],
  ['/craft', 'Mesa de crafteo portátil'], ['/sit', 'Sentarte'], ['/hat', 'Ponerte un ítem en la cabeza'], ['/colors', 'Ver los colores del chat'],
  ['/colorpicker', 'Elegir color del chat'], ['/near', 'Ver jugadores cercanos (Rubí y superior)'], ['/jobs', 'Trabajos y sueldos'],
];
const VOTOS = [
  { sitio: 'Minecraft-MP · meetionmc.com', url: 'https://minecraft-mp.com/server/297192/vote/', nota: 'Ficha principal, con más de 1.100 votos' },
  { sitio: 'Minecraft-MP · meetionmc.net', url: 'https://minecraft-mp.com/server/328005/vote/', nota: 'Segunda ficha de la network' },
  { sitio: 'Minecraft IP List', url: 'https://www.minecraftiplist.com/server/MeeTionNetwork-32758', nota: 'Ficha en Minecraft IP List' },
];

/* ======================= pixel art ======================= */
const PALETA = { k: '#000', w: '#fff', s: '#c8c8d8', S: '#8a8aa0', b: '#7a5230', d: '#4e3418', r: '#c80300', o: '#fb7406', y: '#ffcf4a', Y: '#d99a10', g: '#3d8a22', G: '#2a5e17', p: '#ff8a1f', P: '#c95f00', f: '#f4f4ff', e: '#3ddc84', u: '#2f6fd6', U: '#1f4fa0', c: '#4fd1ff' };
const DIBUJOS = {
  espada: ['.........sss', '........swS.', '.......swS..', '......swS...', '.....swS....', '..b.swS.....', '..bbwS......', '...bb.......', '..bdbb......', '.dd..b......', 'dd..........', 'd...........'],
  castillo: ['s.s.s..s.s.s', 'sssss..sssss', 'sSSSs..sSSSs', 'sSkSssssSkSs', 'sSSSSSSSSSSs', 'sSSkSSSSkSSs', 'sSSSSSSSSSSs', 'sSSSSddSSSSs', 'sSSSSddSSSSs', 'sSSSSddSSSSs', 'ssssssssssss', '............'],
  pico: ['.ssssssss...', 'sSSSSSSSSs..', '.s.....bSs..', '......bb.s..', '.....bb..s..', '....bb...s..', '...bb.......', '..bb........', '.bb.........', 'bb..........', 'b...........', '............'],
  corona: ['............', 'y....y....y.', 'yy..yyy..yy.', 'yyy.yyy.yyy.', 'yyyyyyyyyyy.', 'yyryyyyyeyy.', 'yyyyyyyyyyy.', 'YYYYYYYYYYY.', '............', '............', '............', '............'],
  globo: ['...uuuuuu...', '..uggUuuuu..', '.uggggUuguu.', 'ugggggUuggUu', 'uuggguuuggUu', 'uuuguuuuuggu', 'uuuuuuguuuuu', 'uuuuugggguuu', '.uuuuggguuu.', '..uuuuguuu..', '...uuuuuu...', '............'],
  llama: ['.....r......', '....ro......', '...roo.r....', '...rooor....', '..roooyor...', '..rooyyoor..', '.rooyyyyor..', '.royywwyyor.', '.royywwyyor.', '..royyyyor..', '...rooooor..', '....rrrr....'],
  calabaza: ['.....g......', '....gG......', '..ppppppp...', '.pppppppppp.', 'ppkkppppkkpp', 'ppkkppppkkpp', 'pppppkkppppp', 'ppkpppppkpp.', 'pppkkkkkppp.', '.ppppppppp..', '..PPPPPPP...', '............'],
  fantasma: ['...ffffff...', '..ffffffff..', '.ffffffffff.', '.ffkkffkkff.', '.ffkkffkkff.', '.ffffffffff.', '.fffffkfffff', '.ffffkkkffff', '.ffffffffff.', '.ffffffffff.', '.ff.ff.ff.ff', '.f..f..f..f.'],
  gema: ['....cccc....', '...cwwccc...', '..cwwcccuc..', '.cwwcccccuu.', 'cwcccccccuuu', '.ccccccccuu.', '..ucccccuu..', '...ucccuu...', '....ucuu....', '.....uu.....', '............', '............'],
  llave: ['............', '..yyy.......', '.yYYYy......', '.yY.Yy......', '.yYYYyyyyyyy', '..yyy....y.y', '.........y.y', '............', '............', '............', '............', '............'],
  jaula: ['ssssssssssss', 'sk.k.k.k.k.s', 'sk.k.k.k.k.s', 'sk.kgggk.k.s', 'sk.gwgwg.k.s', 'sk.ggggg.k.s', 'sk.kgggk.k.s', 'sk.k.k.k.k.s', 'sk.k.k.k.k.s', 'ssssssssssss', '............', '............'],
  etiqueta: ['............', '...sssssssss', '..sYYYYYYYYs', '.sYkYYYYYYYs', 'sYYYYwwwwYYs', '.sYYYYYYYYYs', '..sYYYYYYYYs', '...sssssssss', '............', '............', '............', '............'],
  cofre: ['............', '.bbbbbbbbbb.', 'bddddddddddb', 'bdbbbbbbbbdb', 'bbbbbbbbbbbb', 'kkkkkyykkkkk', 'bbbbbyybbbbb', 'bdbbbbbbbbdb', 'bdbbbbbbbbdb', 'bddddddddddb', '.bbbbbbbbbb.', '............'],
};
function pintar(raiz = document) {
  $$('svg[data-pixel]:not([data-ok])', raiz).forEach(svg => {
    const filas = DIBUJOS[svg.dataset.pixel]; if (!filas) return;
    svg.setAttribute('viewBox', `0 0 ${filas[0].length} ${filas.length}`);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.innerHTML = filas.map((f, y) => [...f].map((ch, x) => PALETA[ch] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETA[ch]}"/>` : '').join('')).join('');
    svg.dataset.ok = 1;
  });
}

/* ======================= brasas ======================= */
(() => {
  const lienzo = $('#brasas'), ctx = lienzo.getContext('2d');
  const COLORES = ['#fb7406', '#ffb347', '#c80300', '#ffcf4a', '#ff5a1f'];
  let brasas = [], humo = [], ceniza = [];
  // Humo oscuro que sube despacio desde la lava y ceniza gris que cae entre las brasas.
  const bocanada = inicio => ({ x: Math.random() * innerWidth, y: inicio ? innerHeight * (0.4 + Math.random() * 0.6) : innerHeight + 120, r: 70 + Math.random() * 90, v: 0.18 + Math.random() * 0.25, o: Math.random() * 6.3 });
  const copo = inicio => ({ x: Math.random() * innerWidth, y: inicio ? Math.random() * innerHeight : -10, t: Math.random() < 0.3 ? 3 : 2, v: 0.2 + Math.random() * 0.45, o: Math.random() * 6.3, g: 90 + Math.floor(Math.random() * 60) });
  const nueva = inicio => ({ x: Math.random() * innerWidth, y: inicio ? Math.random() * innerHeight : innerHeight + 10, t: Math.random() < 0.2 ? 4 : Math.random() < 0.6 ? 3 : 2, v: 0.4 + Math.random() * 1.3, o: Math.random() * 6.3, c: COLORES[Math.floor(Math.random() * COLORES.length)], vida: 0.6 + Math.random() * 0.4 });
  const ajustar = () => {
    lienzo.width = innerWidth * devicePixelRatio; lienzo.height = innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    brasas = Array.from({ length: Math.round(innerWidth * innerHeight / 9000) }, () => nueva(true));
    humo = Array.from({ length: Math.max(4, Math.round(innerWidth / 220)) }, () => bocanada(true));
    ceniza = Array.from({ length: Math.round(innerWidth * innerHeight / 26000) }, () => copo(true));
  };
  const dibujar = ms => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const h of humo) {
      h.y -= h.v; h.x += Math.sin(ms / 2600 + h.o) * 0.3; h.r += 0.05;
      const vida = Math.max(0, Math.min(1, h.y / innerHeight));
      const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
      g.addColorStop(0, `rgba(30, 12, 10, ${0.32 * vida})`); g.addColorStop(1, 'rgba(30, 12, 10, 0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(h.x - h.r, h.y - h.r, h.r * 2, h.r * 2);
      if (h.y < -h.r) Object.assign(h, bocanada(false));
    }
    for (const c of ceniza) {
      c.y += c.v; c.x += Math.sin(ms / 1300 + c.o) * 0.45;
      ctx.globalAlpha = 0.45; ctx.fillStyle = `rgb(${c.g}, ${c.g - 8}, ${c.g - 12})`; ctx.fillRect(Math.round(c.x), Math.round(c.y), c.t, c.t);
      if (c.y > innerHeight + 10) Object.assign(c, copo(false));
    }
    for (const b of brasas) {
      b.y -= b.v; b.x += Math.sin(ms / 900 + b.o) * 0.5;
      ctx.globalAlpha = b.vida * (0.25 + 0.75 * Math.max(0, Math.min(1, b.y / innerHeight))) * (0.7 + 0.3 * Math.sin(ms / 120 + b.o));
      ctx.fillStyle = b.c; ctx.fillRect(Math.round(b.x), Math.round(b.y), b.t, b.t);
      if (b.y < -10) Object.assign(b, nueva(false));
    }
    ctx.globalAlpha = 1;
    if (!reducido) requestAnimationFrame(dibujar);
  };
  ajustar(); addEventListener('resize', ajustar); requestAnimationFrame(dibujar);
})();

/* barra de scroll de fuego: los colores suben de abajo arriba mezclándose */
if (!reducido) {
  const raiz = document.documentElement.style;
  let pos = 0;
  setInterval(() => { pos = (pos - 3) % 270; raiz.setProperty('--sb-pos', pos + 'px'); }, 40);
}

/* ======================= Nether al fondo (3 capas con parallax) ======================= */
(() => {
  let semilla = 7;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  // Montañas de bloques: el perfil cambia en cada bloque (sin tramos rectos largos), como el terreno de Minecraft.
  const cordillera = (base, amp, bloque, suave) => {
    let d = 'M0 400 V' + base, previo = base;
    for (let x = 0; x <= 2000; x += bloque) {
      const onda = base - amp * (0.5 + 0.5 * Math.sin(x / suave) * Math.cos(x / (suave * 2.7) + 1));
      let y = Math.round((onda + (azar() - 0.5) * amp * 0.45) / 8) * 8;
      if (y === previo) y += azar() < 0.5 ? -8 : 8;
      y = Math.max(16, Math.min(392, y)); previo = y;
      d += ` V${y} H${x + bloque}`;
    }
    return d + ' V400 Z';
  };
  // Fortaleza del Nether: puente con pilares y dos torres almenadas.
  // Fortaleza del Nether como la del juego: puente con barandilla de valla, pilares y dos torres con volumen
  // (cara lateral en sombra, remate más ancho con valla encima y ventanas con barrotes). Va en su propia capa,
  // por delante de los blazes, para que puedan esconderse detrás.
  const TORRES = [{ x: 1240, w: 70, top: 150 }, { x: 1640, w: 80, top: 118 }];
  const fortaleza = () => {
    const r = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
    const LUZ = '#b5481a', SOMBRA = '#170a0d', VALLA = '#2c161a', CLARO = '#43222a';
    let s = `<defs><linearGradient id="luz-lava" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a20" stop-opacity="0.45"/><stop offset="1" stop-color="#ff7a20" stop-opacity="0"/></linearGradient></defs>`;
    // pilares con arcos escalonados entre ellos (como los puentes de la fortaleza del juego)
    const PILARES = [];
    for (let x = 1190; x < 2060; x += 74) PILARES.push(x);   // el puente sigue hasta salir por la derecha
    for (const x of PILARES) s += r(x, 276, 22, 124, 'url(#ladrillo)') + r(x + 22, 276, 5, 124, SOMBRA) + r(x, 330, 27, 70, 'url(#luz-lava)');
    for (let i = 0; i < PILARES.length - 1; i++) {
      const a = PILARES[i] + 27, b = PILARES[i + 1];
      s += r(a, 276, 10, 14, 'url(#ladrillo)') + r(a, 290, 5, 7, 'url(#ladrillo)') + r(b - 10, 276, 10, 14, 'url(#ladrillo)') + r(b - 5, 290, 5, 7, 'url(#ladrillo)');
    }
    // tablero del puente con su canto iluminado y barandilla de valla
    s += r(1180, 250, 900, 26, 'url(#ladrillo)') + r(1180, 274, 900, 4, SOMBRA) + r(1180, 250, 900, 2, LUZ);
    s += r(1180, 236, 900, 3, VALLA);
    for (let x = 1182; x < 2080; x += 16) s += r(x, 236, 3, 14, VALLA);
    for (const { x, w, top } of TORRES) {
      const alto = 250 - top;
      s += r(x - 6, 228, w + 24, 22, 'url(#ladrillo)') + r(x - 6, 228, w + 24, 2, LUZ);                 // base más ancha
      s += r(x + w, top + 6, 12, alto - 6, SOMBRA);                                                       // cara lateral en sombra
      s += r(x, top, w, alto, 'url(#ladrillo)');                                                          // fachada
      const mitad = top + Math.round(alto * 0.45);
      s += r(x - 3, mitad, w + 18, 6, 'url(#ladrillo)') + r(x - 3, mitad, w + 18, 2, CLARO);              // cornisa a media altura
      s += r(x - 8, top - 12, w + 22, 12, 'url(#ladrillo)') + r(x - 8, top - 12, w + 22, 2, LUZ) + r(x + w + 2, top - 10, 12, 10, SOMBRA); // remate en voladizo
      // valla del remate con pilarcitos en las esquinas
      s += r(x - 8, top - 30, w + 22, 3, VALLA);
      for (let a = x - 4; a <= x + w + 8; a += 11) s += r(a, top - 30, 3, 18, VALLA);
      s += r(x - 8, top - 36, 8, 24, 'url(#ladrillo)') + r(x + w + 6, top - 36, 8, 24, 'url(#ladrillo)') + r(x - 8, top - 36, 8, 2, LUZ) + r(x + w + 6, top - 36, 8, 2, LUZ);
      // ventanas con luz de lava y barrotes, una encima y otra debajo de la cornisa
      for (const vy of [top + 14, mitad + 16]) {
        if (vy + 22 > 226) continue;
        const vx = x + w / 2 - 11;
        s += r(vx, vy, 22, 22, '#120608') + r(vx, vy + 12, 22, 10, '#5a1f0a') + r(vx, vy + 18, 22, 4, '#a4401a');
        for (let b = vx + 2; b < vx + 22; b += 5) s += r(b, vy, 2, 22, VALLA);
      }
    }
    // spawner de blazes encima de la torre grande: jaula negra con fuego que late dentro
    const t = TORRES[1], cx = t.x + t.w / 2 - 14, cy = t.top - 62;
    s += r(cx - 4, cy + 28, 36, 6, 'url(#ladrillo)');
    s += r(cx, cy, 28, 28, '#1b1d22') + r(cx + 3, cy + 3, 22, 22, '#2a1408');
    s += `<rect x="${cx + 6}" y="${cy + 8}" width="16" height="14" fill="#d8641a"><animate attributeName="fill" values="#d8641a;#f0a030;#b8481a;#d8641a" dur="0.9s" repeatCount="indefinite"/></rect>`;
    for (let b = cx + 3; b < cx + 28; b += 6) s += r(b, cy, 2, 28, '#1b1d22');
    for (let b = cy + 3; b < cy + 28; b += 6) s += r(cx, b, 28, 2, '#1b1d22');
    return s;
  };
  // Colores del Nether de Minecraft: netherrack para las montañas (más oscuro cuanto más cerca, a contraluz)
  // y ladrillo del Nether para la fortaleza. Cada capa lleva su textura de píxeles.
  const textura = (id, base, motas) => {
    let r = `<rect width="16" height="16" fill="${base}"/>`;
    for (let i = 0; i < 26; i++) r += `<rect x="${Math.floor(azar() * 16)}" y="${Math.floor(azar() * 16)}" width="${azar() < 0.3 ? 2 : 1}" height="1" fill="${motas[Math.floor(azar() * motas.length)]}"/>`;
    return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse">${r}</pattern>`;
  };
  const ladrillo = `<pattern id="ladrillo" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#2c161a"/>
    <path d="M0 0H16M0 8H16" stroke="#160a0d" stroke-width="2"/><path d="M8 0V8M0 8V16" stroke="#160a0d" stroke-width="2"/>
    <path d="M1 2H6M9 10H14" stroke="#43222a" stroke-width="1"/></pattern>`;
  const capas = [
    ['.nether .lejos', textura('roca-lejos', '#3f1817', ['#4a1d1c', '#361413', '#4f201f']), '#a8461e', cordillera(220, 170, 18, 150)],
    ['.nether .media', textura('roca-media', '#5a2421', ['#682c29', '#4c1d1b', '#70352f', '#421918']), '#e0702a', cordillera(300, 120, 14, 110)],
    ['.nether .cerca', textura('roca-cerca', '#2b100f', ['#341413', '#220c0b', '#3c1816']), '#c4501c', cordillera(250, 80, 10, 60)],
  ];
  for (const [sel, patron, borde, d] of capas) {
    const svg = $(sel); if (!svg) continue;
    const id = patron.match(/id="([^"]+)"/)[1];
    svg.setAttribute('viewBox', '0 0 2000 400'); svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    // La misma silueta 3 px más arriba en color de lava hace de borde iluminado.
    svg.innerHTML = `<defs>${patron}</defs><path d="${d}" fill="${borde}" transform="translate(0 -3)" shape-rendering="crispEdges"/><path d="${d}" fill="url(#${id})" shape-rendering="crispEdges"/>`;
  }
  const fort = $('.nether .fortaleza');
  if (fort) {
    fort.setAttribute('viewBox', '0 0 2000 400'); fort.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    fort.innerHTML = `<defs>${ladrillo}</defs><g shape-rendering="crispEdges">${fortaleza()}</g>`;
  }
  // Al hacer scroll, toda la escena sube hasta enseñar el lago de lava y el suelo; cada capa además se desplaza un poco distinto.
  const escena = $('.nether');
  let mx = 0, pendiente = false;
  const mover = () => {
    pendiente = false;
    const sube = Math.min(scrollY * 0.45, innerHeight * (innerWidth > 920 ? 0.28 : 0.2));
    escena.style.transform = `translateY(${(-sube).toFixed(1)}px)`;
    if (reducido) return;
    $$('.nether .monte').forEach(svg => { const k = +svg.dataset.k; svg.style.transform = `translate(${(-mx * k * 60).toFixed(1)}px, ${(sube * k * 0.8).toFixed(1)}px)`; });
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(mover); } };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir);
  if (!reducido) addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; pedir(); }, { passive: true });
  mover();

  // Lago de lava: se pinta a baja resolución (1 píxel = 5 px) para que parezca de Minecraft.
  const lago = $('.nether .lago'); if (!lago) return;
  const lctx = lago.getContext('2d');
  // Colores apagados: la lava está lejos y no debe robar protagonismo al contenido.
  const PALETA = [[58, 14, 8], [82, 20, 9], [108, 30, 11], [134, 42, 13], [158, 58, 17], [180, 78, 24], [200, 104, 36]];
  let W = 0, H = 0, img, burbujas = [];
  const ajustarLago = () => { W = Math.ceil(lago.clientWidth / 5); H = Math.ceil(lago.clientHeight / 5); lago.width = W; lago.height = H; img = lctx.createImageData(W, H); };
  const pintarLago = t => {
    const d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      // Mezcla de ondas que se mueven: zonas claras y oscuras que fluyen como la lava.
      let v = Math.sin(x * 0.13 + t * 0.9) + Math.sin(y * 0.45 - t * 1.3 + x * 0.05) + Math.sin((x + y * 2) * 0.07 + t * 0.6) + Math.sin(x * 0.031 - t * 0.4) * 1.5;
      v = (v + 4.5) / 9;
      if (y < 2) v = Math.min(1, v + 0.2 - y * 0.08);   // la superficie brilla más
      const c = PALETA[Math.max(0, Math.min(PALETA.length - 1, Math.floor(v * PALETA.length)))];
      const i = (y * W + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    lctx.putImageData(img, 0, 0);
    // Burbujas que crecen, explotan y salpican.
    if (Math.random() < 0.12 && burbujas.length < 10) burbujas.push({ x: Math.random() * W, y: 2 + Math.random() * (H - 4), r: 0, max: 0.5 + Math.random() * 0.7, s: 0 });   // pequeñas: la lava está lejos
    burbujas = burbujas.filter(b => {
      if (b.s === 0) {
        b.r += 0.05; lctx.fillStyle = '#c8783a'; lctx.fillRect(Math.round(b.x - b.r), Math.round(b.y - b.r), Math.ceil(b.r * 2), Math.ceil(b.r * 2));
        lctx.fillStyle = '#a4501c'; lctx.fillRect(Math.round(b.x - b.r) + 1, Math.round(b.y - b.r) + 1, Math.max(0, Math.ceil(b.r * 2) - 2), Math.max(0, Math.ceil(b.r * 2) - 2));
        if (b.r >= b.max) b.s = 1;
        return true;
      }
      b.s++; lctx.fillStyle = '#c8783a';
      for (const [dx, dy] of [[-1, -1], [1, -1], [0, -1]]) lctx.fillRect(Math.round(b.x + dx * b.s * 0.5), Math.round(b.y + dy * b.s * 0.5), 1, 1);
      return b.s < 3;
    });
  };
  ajustarLago(); addEventListener('resize', ajustarLago);
  pintarLago(0);
  if (reducido) return;
  // Solo se anima mientras el lago está a la vista, a unos 20 fotogramas por segundo.
  let ultimo = 0;
  const bucle = ms => {
    if (ms - ultimo > 50 && lago.getBoundingClientRect().top < innerHeight) { ultimo = ms; pintarLago(ms / 1000); }
    requestAnimationFrame(bucle);
  };
  requestAnimationFrame(bucle);
})();

/* ======================= blazes sobre la fortaleza ======================= */
// Salen del spawner de la torre grande, vuelan con un movimiento ondulado (suma de senos, nunca en línea recta)
// sobre la fortaleza y, al acabar su vida, bajan a esconderse detrás de una torre. Luego reaparece otro en el spawner.
(() => {
  const lienzo = $('.nether .blazes'); if (!lienzo) return;
  const ctx = lienzo.getContext('2d');
  // Cabeza cúbica como la del juego: amarilla con textura, ojos oscuros en horizontal y la parte baja más tostada.
  const CABEZA = ['yyyyyyyy', 'yYyyYyyY', 'YYYYYYYY', 'YYyYYYyY', 'YkkYYkkY', 'OYYYYYYO', 'OOYOOYOO', 'OOOOOOOO'];
  const COL = { y: '#ffe066', Y: '#f2b42a', O: '#c77a14', k: '#4a2206' };
  const VARA = ['#ffe066', '#f7c23a', '#e8a020', '#d0881a', '#a8620e', '#7a420a'];   // de amarillo arriba a marrón abajo
  const SPAWNER = { x: 1680, y: 70 };
  const TORRES = [{ x: 1275, y: 200 }, { x: 1680, y: 190 }];
  let W = 0, H = 0, esc = 1, ox = 0, oy = 0, blazes = [], proximo = 0;
  const ajustar = () => {
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = W * devicePixelRatio; lienzo.height = H * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); ctx.imageSmoothingEnabled = false;
    esc = Math.max(W / 2000, H / 400); ox = (W - 2000 * esc) / 2; oy = H - 400 * esc;   // igual que preserveAspectRatio="xMidYMax slice"
  };
  const nuevo = ahora => ({
    nace: ahora, vida: 16000 + Math.random() * 10000, fase: Math.random() * 100,
    ax: 180 + Math.random() * 140, ay: 40 + Math.random() * 30, cx: 1280 + Math.random() * 400, cy: 120 + Math.random() * 50,
    fx: 0.00008 + Math.random() * 0.00004, fy: 0.00014 + Math.random() * 0.00006, torre: TORRES[Math.random() < 0.5 ? 0 : 1],
  });
  // Vuelo calmado: frecuencias bajas y poca amplitud extra.
  // Posición en coordenadas de la fortaleza (2000×400): sale del spawner, vuela y al final baja tras una torre.
  const posicion = (b, ahora) => {
    const t = ahora - b.nace;
    const vuelo = { x: b.cx + Math.sin(t * b.fx + b.fase) * b.ax + Math.sin(t * b.fx * 1.7 + b.fase) * 25,
                    y: b.cy + Math.sin(t * b.fy + b.fase * 1.7) * b.ay + Math.cos(t * b.fx * 1.9) * 8 };
    const salida = Math.min(1, t / 3500), entrada = Math.max(0, (t - (b.vida - 4000)) / 4000);
    const suave = k => k * k * (3 - 2 * k);
    let x = SPAWNER.x + (vuelo.x - SPAWNER.x) * suave(salida), y = SPAWNER.y + (vuelo.y - SPAWNER.y) * suave(salida);
    if (entrada > 0) { const k = suave(Math.min(1, entrada)); x += (b.torre.x - x) * k; y += (b.torre.y + 40 - y) * k; }
    return { x, y };
  };
  const dibujarBlaze = (x, y, t, p) => {
    const sx = ox + x * esc, sy = oy + y * esc;
    // brillo de fuego alrededor
    const g = ctx.createRadialGradient(sx, sy + 4 * p, 0, sx, sy + 4 * p, 10 * p);
    g.addColorStop(0, 'rgba(255, 150, 40, 0.35)'); g.addColorStop(1, 'rgba(255, 150, 40, 0)');
    ctx.fillStyle = g; ctx.fillRect(sx - 10 * p, sy - 6 * p, 20 * p, 20 * p);
    // Dos anillos de 4 varas que giran en sentidos contrarios; las de detrás se pintan antes que la cabeza.
    const varas = [];
    for (let i = 0; i < 8; i++) {
      const arriba = i < 4, a = (arriba ? 1 : -1) * t / 1100 + (i % 4) * Math.PI / 2 + (arriba ? 0 : Math.PI / 4);
      const radio = arriba ? 7 : 5;
      varas.push({ x: sx + Math.cos(a) * radio * p - p, y: sy + (arriba ? 0 : 6) * p, z: Math.sin(a) });
    }
    const vara = v => VARA.forEach((c, j) => { ctx.fillStyle = c; ctx.fillRect(Math.round(v.x), Math.round(v.y + j * p), 2 * p, p); });
    varas.filter(v => v.z < 0).forEach(vara);
    CABEZA.forEach((f, j) => [...f].forEach((ch, i) => { if (COL[ch]) { ctx.fillStyle = COL[ch]; ctx.fillRect(Math.round(sx + (i - 4) * p), Math.round(sy + (j - 6) * p), p, p); } }));
    varas.filter(v => v.z >= 0).forEach(vara);
  };
  const dibujar = ahora => {
    ctx.clearRect(0, 0, W, H);
    if (ahora > proximo && blazes.length < 3) { blazes.push(nuevo(ahora)); proximo = ahora + 6000 + Math.random() * 5000; }
    const p = Math.max(1, Math.round(esc * 1.5));   // pequeños: están lejos
    blazes = blazes.filter(b => ahora - b.nace < b.vida);
    for (const b of blazes) { const { x, y } = posicion(b, ahora); dibujarBlaze(x, y + Math.sin(ahora / 900 + b.fase) * 3, ahora, p); }
  };
  ajustar(); addEventListener('resize', ajustar);
  if (reducido) { dibujar(performance.now()); return; }
  const bucle = ahora => { if (lienzo.getBoundingClientRect().bottom > 0) dibujar(ahora); requestAnimationFrame(bucle); };
  requestAnimationFrame(bucle);
})();

/* ======================= chispas al hacer clic ======================= */
// Cada estallido usa un lienzo pequeño (200×200) solo alrededor del clic y se elimina al acabar:
// no se repinta la pantalla entera. La física va por tiempo, así se ve igual a 60 o a 144 Hz.
(() => {
  if (reducido) return;
  const COLORES = ['#ffcf4a', '#ffb347', '#fb7406', '#ff5a1f', '#c80300'];
  const TAM = 200, MAX = 4;
  let activos = 0;
  document.addEventListener('pointerdown', e => {
    if (activos >= MAX || !e.target.closest('button, a, .producto, .card.hover, [data-copiar]')) return;
    activos++;
    const dpr = Math.min(devicePixelRatio, 2);
    const c = document.createElement('canvas');
    c.width = c.height = TAM * dpr;
    c.style.cssText = `position:fixed;left:${e.clientX - TAM / 2}px;top:${e.clientY - TAM / 2}px;width:${TAM}px;height:${TAM}px;pointer-events:none;z-index:80`;
    document.body.appendChild(c);
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    const parts = Array.from({ length: 18 }, () => {
      const ang = Math.random() * Math.PI * 2, vel = 90 + Math.random() * 200;
      return { x: TAM / 2, y: TAM / 2, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 120, t: Math.random() < 0.3 ? 4 : 3, vida: 0.45 + Math.random() * 0.4, c: COLORES[(Math.random() * COLORES.length) | 0] };
    });
    let antes = performance.now();
    const paso = ahora => {
      const dt = Math.min(0.05, (ahora - antes) / 1000); antes = ahora;
      ctx.clearRect(0, 0, TAM, TAM);
      let vivas = 0;
      for (const p of parts) {
        if ((p.vida -= dt) <= 0) continue;
        vivas++;
        p.vy += 520 * dt; p.vx *= 1 - 2 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.globalAlpha = Math.min(1, p.vida * 3); ctx.fillStyle = p.c; ctx.fillRect(p.x | 0, p.y | 0, p.t, p.t);
      }
      if (vivas) requestAnimationFrame(paso); else { c.remove(); activos--; }
    };
    requestAnimationFrame(paso);
  }, { passive: true });
})();

/* ======================= calor alrededor del ratón ======================= */
(() => {
  const calor = $('.calor'); if (!calor || reducido || matchMedia('(hover: none)').matches) return;
  let quieto;
  addEventListener('pointermove', e => {
    calor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    calor.classList.add('on');
    clearTimeout(quieto); quieto = setTimeout(() => calor.classList.remove('on'), 1600);
  }, { passive: true });
  document.addEventListener('pointerleave', () => calor.classList.remove('on'));
})();

/* ======================= datos en vivo ======================= */
const vivo = { jugadores: null, miembros: null, enLinea: null };
const contar = (el, total, suf = '') => {
  if (!el) return;
  const t0 = performance.now();
  const paso = t => { const k = reducido ? 1 : Math.min(1, (t - t0) / 1300); el.textContent = Math.round(total * (1 - (1 - k) ** 3)).toLocaleString('es') + suf; if (k < 1) requestAnimationFrame(paso); };
  requestAnimationFrame(paso);
};
const pintarVivo = () => {
  $$('[data-vivo="jugadores"]').forEach(el => vivo.jugadores != null ? contar(el, vivo.jugadores) : null);
  $$('[data-vivo="miembros"]').forEach(el => vivo.miembros != null ? contar(el, vivo.miembros) : null);
  $$('[data-vivo="enlinea"]').forEach(el => vivo.enLinea != null ? contar(el, vivo.enLinea) : null);
};
fetch('https://api.mcsrvstat.us/3/' + IP).then(r => r.json()).then(d => { vivo.jugadores = d.online ? d.players.online : 0; pintarVivo(); }).catch(() => {});
fetch(`https://discord.com/api/v10/invites/${DISCORD}?with_counts=true`).then(r => r.json()).then(d => { vivo.miembros = d.approximate_member_count; vivo.enLinea = d.approximate_presence_count; pintarVivo(); }).catch(() => {});

/* cuenta atrás */
const partes = () => { const ms = Math.max(0, FIN_HALLOWEEN - Date.now()); return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 }; };
const p2 = n => String(n).padStart(2, '0');
setInterval(() => {
  const { d, h, m, s } = partes();
  $('#cuenta').textContent = `${d}d ${p2(h)}h ${p2(m)}m ${p2(s)}s`;
  const g = $('#cuenta-grande'); if (g) g.innerHTML = [[d, 'días'], [h, 'horas'], [m, 'min'], [s, 'seg']].map(([v, l]) => `<div><b>${p2(v)}</b><small>${l}</small></div>`).join('');
}, 1000);

/* ======================= catálogo ======================= */
let CATALOGO = [];
const modalidad = slug => CATALOGO.find(m => m.slug === slug);
// Las imágenes originales pesan ~2 MB; se sirven reducidas a webp con wsrv.nl
const imagen = (p, w = 240) => p[4] ? `https://wsrv.nl/?url=${encodeURIComponent(CDN.replace('https://', '') + p[4])}&w=${w}&h=${w}&fit=contain&output=webp&q=82` : '';
const iconoDe = p => { const n = (p[1] || '').toLowerCase(); return /llave|key/.test(n) ? 'llave' : /spawner|generador/.test(n) ? 'jaula' : /tag|prefijo/.test(n) ? 'etiqueta' : /pase|pass|nivel/.test(n) ? 'gema' : 'cofre'; };
const sinImagen = (p, tam) => `<svg class="icono" data-pixel="${iconoDe(p)}" style="width:${tam}px;height:${tam}px;margin:0 auto"></svg>`;
const todosLosProductos = () => CATALOGO.flatMap(m => [...m.evento.map(p => ({ p, m, c: null })), ...m.categorias.flatMap(c => c.productos.map(p => ({ p, m, c })))]);

/* ======================= sesión y carrito ======================= */
let sesion = leer('sesion', null);
let carrito = leer('carrito', []);
const avatarDe = (nombre, edicion, tam = 32) => edicion === 'java' && /^[A-Za-z0-9_]{3,16}$/.test(nombre || '') ? `https://mc-heads.net/avatar/${nombre}/${tam}` : `https://mc-heads.net/avatar/MHF_Steve/${tam}`;
function pintarSesion() {
  $('#avatar').src = sesion ? avatarDe(sesion.nombre, sesion.edicion) : avatarDe(null);
  $('#nombre-usuario').textContent = sesion ? (sesion.edicion === 'bedrock' ? '.' : '') + sesion.nombre : 'Identifícate';
}
function pintarCarrito() {
  $('#num-carrito').textContent = carrito.reduce((s, l) => s + l.cant, 0);
  $('#lineas').innerHTML = carrito.length ? carrito.map((l, i) => `
    <div class="linea">${l.img ? `<img src="${esc(l.img)}" alt="">` : '<svg class="icono" data-pixel="cofre" style="width:48px;height:48px;margin:0"></svg>'}
      <div><b>${esc(l.nombre)}</b><small class="muted">${esc(l.modalidad)}</small>
        <div class="cant"><button data-menos="${i}">−</button><span>${l.cant}</span><button data-mas="${i}">+</button></div></div>
      <div class="p">${usd(l.precio * l.cant)}</div></div>`).join('') : '<p class="vacio">Tu carrito está vacío.<br>Añade algo de la tienda.</p>';
  $('#total').textContent = usd(carrito.reduce((s, l) => s + l.precio * l.cant, 0));
  guardar('carrito', carrito); pintar($('#lineas'));
}
function anadir(p, m) {
  const ex = carrito.find(l => l.id === p[0]);
  ex ? ex.cant++ : carrito.push({ id: p[0], nombre: p[1], precio: p[2] || 0, img: imagen(p, 96), modalidad: m.nombre, cant: 1 });
  pintarCarrito(); aviso(`<b>✔</b> ${esc(p[1])} añadido al carrito`);
  if (!sesion) setTimeout(() => abrir('#modal-login'), 500);
}

/* ======================= modales y avisos ======================= */
const abrir = sel => { $('#capa').classList.add('on'); $(sel).classList.add('on'); };
const cerrarTodo = () => { $$('.modal.on, .cajon.on').forEach(e => e.classList.remove('on')); $('#capa').classList.remove('on'); };
$('#capa').addEventListener('click', cerrarTodo);
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarTodo(); });
document.addEventListener('click', e => { if (e.target.closest('[data-cerrar]')) cerrarTodo(); });
const aviso = html => { const t = $('#toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2300); };

$('#btn-carrito').addEventListener('click', () => abrir('#cajon'));
$('#btn-pagar').addEventListener('click', () => { if (!carrito.length) return aviso('Tu carrito está vacío'); cerrarTodo(); abrir('#modal-pago'); });
$('#lineas').addEventListener('click', e => {
  const mas = e.target.dataset.mas, menos = e.target.dataset.menos;
  if (mas != null) carrito[mas].cant++;
  if (menos != null) { carrito[menos].cant--; if (carrito[menos].cant <= 0) carrito.splice(menos, 1); }
  pintarCarrito();
});
$('#btn-menu').addEventListener('click', () => $('#links').classList.toggle('abierto'));

let edicion = 'java';
$('#btn-usuario').addEventListener('click', () => { $('#input-usuario').value = sesion?.nombre || ''; abrir('#modal-login'); setTimeout(() => $('#input-usuario').focus(), 200); });
$$('[data-edicion]').forEach(b => b.addEventListener('click', () => { edicion = b.dataset.edicion; $$('[data-edicion]').forEach(x => x.classList.toggle('on', x === b)); previa(); }));
const previa = () => { const n = $('#input-usuario').value.trim(); $('#previa').src = avatarDe(n, edicion, 48); $('#previa-txt').textContent = n ? (edicion === 'bedrock' ? '.' : '') + n : 'Así aparecerás en la tienda'; };
let tPrev; $('#input-usuario').addEventListener('input', () => { clearTimeout(tPrev); tPrev = setTimeout(previa, 350); });
$('#btn-entrar').addEventListener('click', () => {
  const n = $('#input-usuario').value.trim();
  if (!/^[A-Za-z0-9_ ]{3,16}$/.test(n)) return aviso('Escribe un usuario válido (3–16 caracteres)');
  sesion = { nombre: n, edicion }; guardar('sesion', sesion); pintarSesion(); cerrarTodo(); aviso(`<b>✔</b> ¡Hola, ${esc(n)}!`);
});

function verProducto(id) {
  const hit = todosLosProductos().find(x => x.p[0] === id); if (!hit) return;
  const { p, m, c } = hit;
  const base = (p[1] || '').replace(/\[.*?\]/g, '').trim().toLowerCase();
  const rango = RANGOS_RPG.find(r => r.r.toLowerCase() === base);
  const ventajas = rango ? [...VENTAJAS_GENERALES, `${rango.homes} homes`, `Trabajos en /jobs: ${rango.jobs}`, `Hasta ${rango.encantos} encantos custom por ítem`, rango.mochila !== '—' ? `Mochila ${rango.mochila}` : '', rango.boveda !== '—' ? `Bóvedas personales de ${rango.boveda} slots` : '', rango.proteccion !== '—' ? `${rango.proteccion} bloques de protección` : '', rango.extra].filter(Boolean) : null;
  $('#contenido-producto').innerHTML = `
    <h3>${esc(p[1])}</h3>
    <div class="img-grande">${imagen(p) ? `<img src="${esc(imagen(p, 400))}" alt="">` : sinImagen(p, 120)}</div>
    <p class="muted">${esc(m.emoji)} ${esc(m.nombre)}${c ? ' · ' + esc(c.emoji + ' ' + c.nombre) : ''}</p>
    ${ventajas ? `<ul>${ventajas.map(v => `<li>${esc(v)}</li>`).join('')}</ul><p class="muted" style="font-size:0.8rem">Ventajas tal como aparecen en la tienda actual (Survival RPG).</p>` : '<p class="muted" style="margin:12px 0">Entrega automática en la modalidad al completar el pago.</p>'}
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px">
      <div class="precio pixel" style="font-size:1.5rem;color:var(--gold)">${p[3] ? `<del class="muted" style="font-size:0.9rem;margin-right:8px">${p[3].toFixed(2)}</del>` : ''}${usd(p[2])}</div>
      <button class="btn gold" id="btn-add-modal">Añadir</button>
    </div>`;
  pintar($('#contenido-producto'));
  $('#btn-add-modal').onclick = () => { anadir(p, m); cerrarTodo(); };
  abrir('#modal-producto');
}

/* ======================= piezas reutilizables ======================= */
const tarjetaProducto = (p, m) => {
  const off = p[3] && p[2] ? Math.round((1 - p[2] / p[3]) * 100) : 0;
  return `<div class="card hover producto" data-ver="${esc(p[0])}">
    ${off > 0 ? `<span class="off">-${off}%</span>` : ''}
    <div class="img">${imagen(p) ? `<img loading="lazy" src="${esc(imagen(p))}" alt="">` : sinImagen(p, 80)}</div>
    <div class="nombre">${esc(p[1])}</div>
    <div class="precio">${p[3] ? `<span class="antes">${p[3].toFixed(2)} USD</span>` : ''}${(p[2] ?? 0).toFixed(2)} <small>USD</small></div>
    <button class="btn sm" data-add="${esc(p[0])}" data-mod="${esc(m.slug)}">Añadir</button>
  </div>`;
};
const JUGADORES = ['Alex_Pro', 'Kira77', 'NetherKing', 'Lia_mc', 'xDarkSoul', 'ElPana09', 'Sofi_RPG', 'BlazeHunter', 'Tomi_YT', 'Vale.mc', 'Rex_Craft', 'Nico2009'];
const SKINS = ['MHF_Steve', 'MHF_Alex', 'MHF_Blaze', 'MHF_Enderman', 'MHF_Skeleton', 'MHF_Zombie', 'MHF_Creeper', 'MHF_Villager'];
let feedTimer;
function arrancarFeed() {
  clearInterval(feedTimer);
  const lista = $('#feed'); if (!lista) return;
  const pool = todosLosProductos().filter(x => x.p[2] > 0);
  let n = 0;
  const add = hace => {
    if (!pool.length) return;
    const { p, m } = pool[Math.floor(Math.random() * pool.length)];
    const li = document.createElement('li');
    li.innerHTML = `<img src="https://mc-heads.net/avatar/${SKINS[n % SKINS.length]}/28" alt=""><div><b>${JUGADORES[n % JUGADORES.length]}</b><span>${esc(p[1])} · ${esc(m.nombre)}</span></div><span class="en-vivo" style="margin-left:auto;color:var(--muted)">${hace}</span>`;
    lista.prepend(li); while (lista.children.length > 6) lista.lastChild.remove(); n++;
  };
  ['hace 5 h', 'hace 3 h', 'hace 2 h', 'hace 1 h', 'hace 25 min', 'hace 4 min'].forEach(add);
  if (!reducido) feedTimer = setInterval(() => add('ahora'), 5000);
}
const MES = new Date().toLocaleDateString('es', { month: 'long' });
const widgets = () => `
  <div class="card widget"><h4>Compras recientes <span class="en-vivo">EN VIVO</span></h4><ul class="feed" id="feed"></ul></div>`;
// Franja de arriba de la tienda: se ve nada más entrar, sin hacer scroll.
const franjaTienda = () => `
  <div class="franja-tienda">
    <div class="card donador-mes"><span class="corona-flota"><svg data-pixel="corona"></svg></span>
      <img src="https://mc-heads.net/body/MHF_Blaze/120" alt="">
      <div><p class="label" style="margin:0">&gt; top donador de ${MES} <span class="ejemplo">ejemplo</span></p><h3>Jugador****</h3>
        <p class="muted">El que más apoyó a la network este mes. Sale aquí y gana un rango de regalo.</p></div></div>
    <div class="card meta-mes"><div class="meta-cab"><p class="label" style="margin:0">&gt; meta de ${MES} <span class="ejemplo">ejemplo</span></p><b class="pixel" id="meta-pct">0%</b></div>
      <div class="meta-bar grande"><i id="meta"></i></div>
      <p class="muted">Cada compra suma. Al llegar al 100 %: <b style="color:var(--gold)">KeyAll global y doble de llaves</b> en todas las modalidades.</p></div>
  </div>`;

/* ======================= vistas ======================= */
const VISTAS = {
  inicio() {
    const jugables = CATALOGO.filter(m => MODALIDADES[m.slug]);
    return `<div class="vista">
    <header class="hero"><div class="wrap">
      <div class="logo-wrap"><img src="logo.png" alt="MeeTion MC"></div>
      <div class="stats">
        <span class="stat"><span class="dot"></span><b data-vivo="jugadores">…</b> jugando ahora</span>
        <span class="stat">Discord <b data-vivo="miembros">…</b> miembros</span>
        <span class="stat"><b>${CATALOGO.length - 2}</b> modalidades</span>
      </div>
      <h1>Donde <span class="fuego">arde</span><br>la leyenda</h1>
      <p class="lead">La network hispana con Survival RPG, Towny, Prison OP, Survival OP, Earth y Doom Box. Elige tu modalidad y únete a miles de jugadores.</p>
      <div class="ip"><div><small>IP del servidor</small><code>${IP}</code></div><button class="btn" data-copiar>Copiar IP</button></div>
    </div></header>
    <section class="alt"><div class="wrap">
      <p class="label reveal">&gt; accesos rápidos</p><h2 class="reveal">Todo en un sitio</h2>
      <div class="accesos">
        <a class="card hover acceso reveal" href="#tienda"><svg class="icono" data-pixel="cofre"></svg><h3>Tienda</h3><p>${todosLosProductos().length} productos en ${CATALOGO.reduce((s, m) => s + m.categorias.length, 0)} categorías.</p><span class="ir">Ver tienda →</span></a>
        <a class="card hover acceso reveal" href="#votar"><svg class="icono" data-pixel="gema"></svg><h3>Votar</h3><p>Vota cada día y gana recompensas en el juego.</p><span class="ir">Votar →</span></a>
        <a class="card hover acceso reveal" href="#wiki"><svg class="icono" data-pixel="pico"></svg><h3>Wiki</h3><p>Rangos, comandos, normas y guía para empezar.</p><span class="ir">Abrir wiki →</span></a>
        <a class="card hover acceso reveal" href="#comunidad"><svg class="icono" data-pixel="llama"></svg><h3>Discord</h3><p><b data-vivo="enlinea">…</b> personas conectadas ahora mismo.</p><span class="ir">Entrar →</span></a>
      </div>
    </div></section>
    <section><div class="wrap">
      <p class="label reveal">&gt; modalidades</p><h2 class="reveal">Elige tu camino</h2>
      <div class="grid-3">${jugables.map(m => tarjetaModalidad(m)).join('')}</div>
    </div></section></div>`;
  },
  modalidades() {
    return `<div class="vista"><div class="wrap cabecera"><p class="label">&gt; modalidades</p><h1>Seis formas de jugar</h1><p>Cada modalidad tiene su progreso, sus rangos y su tienda. Tu rango global te acompaña en todas.</p></div>
    <section style="padding-top:10px"><div class="wrap"><div class="grid-3">${CATALOGO.filter(m => MODALIDADES[m.slug]).map(m => tarjetaModalidad(m)).join('')}</div></div></section></div>`;
  },
  tienda(modSlug, catSlug) {
    const m = modalidad(modSlug) || modalidad('survival-rpg');
    const cat = catSlug && catSlug !== 'destacados' ? m.categorias.find(c => c.slug === catSlug) : null;
    const productos = cat ? cat.productos : m.evento;
    const titulo = cat ? `${cat.emoji} ${cat.nombre}` : NOMBRE_DESTACADOS[m.slug] || 'Destacados';
    return `<div class="vista"><div class="wrap">
      <div class="cabecera" style="padding-bottom:22px"><p class="label">&gt; tienda oficial</p><h1>Tienda</h1><p>Paga y lo recibes en el juego al instante. ${todosLosProductos().length} productos de las ${CATALOGO.length} secciones de la tienda actual.</p></div>
      ${franjaTienda()}
      <div class="tienda">
        <aside class="lateral">
          <div class="card mods">${CATALOGO.map(x => `
            <details ${x.slug === m.slug ? 'open' : ''}><summary>${esc(x.emoji)} ${esc(x.nombre)} <small>${x.evento.length + x.categorias.reduce((s, c) => s + c.productos.length, 0)}</small></summary>
              ${x.evento.length ? `<a href="#tienda/${x.slug}/destacados" class="${x.slug === m.slug && !cat ? 'activo' : ''}">${esc(NOMBRE_DESTACADOS[x.slug] || 'Destacados')} <small>${x.evento.length}</small></a>` : ''}
              ${x.categorias.map(c => `<a href="#tienda/${x.slug}/${c.slug}" class="${cat === c ? 'activo' : ''}">${esc(c.emoji)} ${esc(c.nombre)} <small>${c.productos.length}</small></a>`).join('')}
            </details>`).join('')}
          </div>
          ${widgets()}
        </aside>
        <div>
          <select class="cat-movil" id="cat-movil" aria-label="Categoría">${CATALOGO.map(x => `<optgroup label="${esc(x.emoji + ' ' + x.nombre)}">
            ${x.evento.length ? `<option value="${x.slug}/destacados" ${x.slug === m.slug && !cat ? 'selected' : ''}>${esc(NOMBRE_DESTACADOS[x.slug] || 'Destacados')} (${x.evento.length})</option>` : ''}
            ${x.categorias.map(c => `<option value="${x.slug}/${c.slug}" ${cat === c ? 'selected' : ''}>${esc(c.emoji + ' ' + c.nombre)} (${c.productos.length})</option>`).join('')}</optgroup>`).join('')}</select>
          <div class="barra-tienda"><h2>${esc(titulo)}</h2>
            <label class="buscar">🔍<input id="buscar" placeholder="Buscar en toda la tienda…"></label>
            <select class="orden" id="orden"><option value="">Orden de la tienda</option><option value="asc">Precio ↑</option><option value="desc">Precio ↓</option><option value="off">Mayor descuento</option></select>
          </div>
          <p class="muted" style="margin:-8px 0 16px;font-size:0.9rem">${esc(m.emoji)} ${esc(m.nombre)} · ${productos.length} productos</p>
          ${cat?.aviso ? `<div class="aviso">🔔 ${esc(cat.aviso)}</div>` : ''}
          <div class="productos" id="productos" data-mod="${m.slug}">${productos.map(p => tarjetaProducto(p, m)).join('') || '<p class="vacio">No hay productos en esta categoría.</p>'}</div>
        </div>
      </div></div></div>`;
  },
  eventos() {
    const rpg = modalidad('survival-rpg'), earth = modalidad('earth'), sop = modalidad('survival-op');
    const dioses = sop?.categorias.find(c => /dioses/i.test(c.nombre));
    const muestra = (lista, n = 3) => lista.filter(p => p[4]).slice(0, n).map(p => `<div><img src="${esc(imagen(p))}" alt=""><b>${esc(p[1])}</b><br><span class="muted">${usd(p[2])}</span></div>`).join('');
    const ev = (titulo, icono, texto, lista, ruta, extra = '') => `
      <div class="card evento-card reveal" style="margin-bottom:26px"><div>
        <h3><svg data-pixel="${icono}" style="width:34px;height:34px;display:inline;vertical-align:-6px"></svg> ${titulo}</h3>
        <p class="muted">${texto}</p>${extra}
        <div class="chips"><span>${lista.length} productos</span></div>
        <a class="btn" href="#tienda/${ruta}" style="margin-top:18px">Ver productos del evento</a>
      </div><div class="muestra">${muestra(lista)}</div></div>`;
    return `<div class="vista"><div class="wrap cabecera"><p class="label">&gt; eventos</p><h1>Eventos activos</h1><p>Rangos y objetos de temporada, solo durante el evento.</p></div>
    <section style="padding-top:10px"><div class="wrap">
      ${ev('Halloween 2026', 'calabaza', 'Rangos Vampiro y objetos de temporada en Survival RPG, Towny y Prison OP.', rpg.evento, 'survival-rpg/destacados', '<div class="cuenta-grande" id="cuenta-grande"></div>')}
      ${dioses ? ev('Dioses Griegos', 'corona', 'Zeus y el resto del Olimpo llegan a Survival OP: rangos temporales, permanentes y mejoras.', dioses.productos, `survival-op/${dioses.slug}`) : ''}
      ${ev('Cyber Futurista', 'globo', 'Rangos Cyber y objetos futuristas en la modalidad Earth.', earth.evento, 'earth/destacados')}
    </div></section></div>`;
  },
  votar() {
    const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    return `<div class="vista"><div class="wrap cabecera"><p class="label">&gt; votar</p><h1>Vota y gana</h1><p>Cada voto ayuda a que más jugadores encuentren la network. Vota en todas las listas cada día.</p></div>
    <section style="padding-top:10px"><div class="wrap">
      <div style="display:grid;gap:18px">${VOTOS.map((v, i) => `
        <div class="card hover voto reveal"><span class="n">${i + 1}</span><div><h3>${esc(v.sitio)}</h3><p class="muted">${esc(v.nota)}</p></div>
          <a class="btn gold" href="${esc(v.url)}" target="_blank" rel="noopener">Votar</a></div>`).join('')}
      </div>
      <div class="grid-2" style="margin-top:30px">
        <div class="card reveal"><h3 class="pixel" style="font-size:1rem">Recompensas por voto <span class="ejemplo">ejemplo</span></h3>
          <ul style="color:var(--muted);padding-left:20px;margin-top:10px"><li>1 llave de votos por cada lista</li><li>Dinero del juego en tu modalidad</li><li>Votar en las 3 listas: llave extra</li></ul>
          <h3 class="pixel" style="font-size:0.9rem;margin-top:18px">Tu racha semanal <span class="ejemplo">ejemplo</span></h3>
          <div class="racha">${dias.map((d, i) => `<div class="${i < 4 ? 'hecho' : ''}"><b>${i < 4 ? '✔' : '·'}</b>${d}</div>`).join('')}</div></div>
        <div class="card reveal"><h3 class="pixel" style="font-size:1rem">Top votantes del mes <span class="ejemplo">ejemplo</span></h3>
          <table class="tabla" style="margin-top:10px"><tr><th>#</th><th>Jugador</th><th>Votos</th></tr>
          ${['NetherKing', 'Sofi_RPG', 'Kira77', 'Alex_Pro', 'Lia_mc'].map((j, i) => `<tr><td>${i + 1}</td><td><img src="https://mc-heads.net/avatar/${SKINS[i]}/20" style="display:inline;vertical-align:-4px;margin-right:8px">${j}</td><td>${[93, 88, 74, 71, 60][i]}</td></tr>`).join('')}</table></div>
      </div>
    </div></section></div>`;
  },
  wiki(seccion = 'primeros-pasos') {
    const SECCIONES = { 'primeros-pasos': 'Primeros pasos', rangos: 'Rangos', comandos: 'Comandos', normas: 'Normas', faq: 'Preguntas frecuentes' };
    const cuerpo = {
      'primeros-pasos': `<h2>Primeros pasos <span class="ejemplo">ejemplo</span></h2>
        <ol><li>Abre Minecraft Java (1.16 o superior) y añade el servidor <b style="color:var(--gold)">${IP}</b>.</li><li>Entra y elige tu modalidad en el lobby.</li><li>Protege tu zona y empieza a progresar.</li><li>Únete al Discord para enterarte de eventos y sorteos.</li></ol>
        <h3>¿Qué modalidad elijo?</h3><ul>${CATALOGO.filter(m => MODALIDADES[m.slug]).map(m => `<li><b>${esc(m.nombre)}</b>: ${esc(MODALIDADES[m.slug].texto)}</li>`).join('')}</ul>`,
      rangos: `<h2>Rangos de Survival RPG</h2><p>Ventajas de los rangos permanentes tal como aparecen en la tienda actual.</p>
        <h3>Todos los rangos incluyen</h3><ul>${VENTAJAS_GENERALES.map(v => `<li>${v}</li>`).join('')}</ul>
        <h3>Comparativa</h3><div class="tabla-scroll"><table class="tabla"><tr><th>Rango</th><th>Precio</th><th>Homes</th><th>/jobs</th><th>Encantos</th><th>Mochila</th><th>Bóveda</th><th>Protección</th></tr>
        ${RANGOS_RPG.map(r => `<tr><td class="rango">${r.r}</td><td>${usd(r.precio)}</td><td>${r.homes}</td><td>${r.jobs}</td><td>${r.encantos}</td><td>${r.mochila}</td><td>${r.boveda}</td><td>${r.proteccion}</td></tr>`).join('')}</table></div>
        <p class="muted" style="margin-top:10px;font-size:0.9rem">Extra: Rubí añade prefijo personalizado y /near. Amatista añade MeeTion Pass Premium permanente y Armor Stand custom.</p>
        <a class="btn" href="#tienda/survival-rpg/${modalidad('survival-rpg')?.categorias.find(c => /permanentes/i.test(c.nombre))?.slug || 'destacados'}" style="margin-top:16px">Ver rangos en la tienda</a>`,
      comandos: `<h2>Comandos de rango</h2><p>Comandos que desbloquean los rangos de Survival RPG.</p><div class="cmds" style="margin-top:14px">${COMANDOS.map(([c, d]) => `<div class="cmd"><code>${c}</code><span>${d}</span></div>`).join('')}</div>`,
      normas: `<h2>Normas <span class="ejemplo">ejemplo</span></h2><ol><li>Respeta a todos los jugadores y al staff.</li><li>Prohibidos los hacks, clientes modificados y exploits.</li><li>Nada de spam ni publicidad de otros servidores.</li><li>Prohibido el griefing fuera de las zonas permitidas.</li><li>No compartas datos personales ni cuentas.</li><li>Las sanciones las decide el staff; se pueden apelar por Discord.</li></ol>`,
      faq: `<h2>Preguntas frecuentes</h2><div class="faq">
        <details open><summary>¿Cuánto tarda en llegar mi compra?</summary><p>Se entrega sola en el juego al completar el pago, aunque estés conectado.</p></details>
        <details><summary>¿Los rangos sirven en todas las modalidades?</summary><p>Los rangos de cada modalidad funcionan en esa modalidad. Los rangos globales (MEET, MEET+ y MEETGOD) dan ventajas en toda la network.</p></details>
        <details><summary>¿Qué diferencia hay entre temporal y permanente?</summary><p>El temporal dura un tiempo limitado; el permanente es para siempre. Si ya tienes un rango, puedes mejorarlo con un Upgrade pagando solo la diferencia.</p></details>
        <details><summary>¿Puedo jugar desde Bedrock?</summary><p>Elige "Bedrock" al identificarte en la tienda; tu usuario aparecerá con un punto delante.</p></details>
        <details><summary>He tenido un problema con un pago</summary><p>Abre un ticket en el Discord con tu usuario y el comprobante.</p></details></div>`,
    };
    return `<div class="vista"><div class="wrap cabecera"><p class="label">&gt; wiki</p><h1>Wiki</h1><p>Todo lo que necesitas saber para jugar en MeeTion.</p></div>
    <div class="wrap wiki"><div class="card wiki-menu">${Object.entries(SECCIONES).map(([k, v]) => `<a href="#wiki/${k}" class="${k === seccion ? 'activo' : ''}">${v}</a>`).join('')}</div>
    <div class="card wiki-cuerpo">${cuerpo[seccion] || cuerpo['primeros-pasos']}</div></div></div>`;
  },
  comunidad() {
    return `<div class="vista"><div class="wrap cabecera"><p class="label">&gt; comunidad</p><h1>La comunidad</h1><p>Eventos, sorteos, soporte y anuncios: todo pasa en el Discord.</p></div>
    <section style="padding-top:10px"><div class="wrap">
      <div class="discord reveal"><svg class="icono" data-pixel="llama"></svg><div><h2>Únete al Discord</h2><p><b data-vivo="miembros">…</b> miembros · <b data-vivo="enlinea">…</b> conectados ahora</p></div>
        <a class="btn gold" href="https://discord.gg/${DISCORD}" target="_blank" rel="noopener">Entrar al Discord</a></div>
    </div></section></div>`;
  },
};
function tarjetaModalidad(m) {
  const info = MODALIDADES[m.slug];
  const n = m.evento.length + m.categorias.reduce((s, c) => s + c.productos.length, 0);
  return `<a class="card hover modalidad reveal" href="#tienda/${m.slug}/destacados">
    <svg class="icono" data-pixel="${info.icono}"></svg>
    <h3>${esc(m.nombre)}</h3><p>${esc(info.texto)}</p>
    <div class="meta"><span>${m.categorias.length} categorías</span><span>${n} productos</span></div>
    <div class="chips">${m.categorias.slice(0, 5).map(c => `<span>${esc(c.nombre)}</span>`).join('')}</div></a>`;
}

/* ======================= enrutador ======================= */
let obsReveal;
function render() {
  const [ruta = 'inicio', ...args] = (location.hash.slice(1) || 'inicio').split('/');
  const vista = VISTAS[ruta] ? ruta : 'inicio';
  $('#vista').innerHTML = VISTAS[vista](...args);
  $$('#links a').forEach(a => a.classList.toggle('activo', a.dataset.ruta === vista));
  $('#links').classList.remove('abierto');
  pintar($('#vista')); pintarVivo(); arrancarFeed();
  const meta = $('#meta'); if (meta) setTimeout(() => { meta.style.width = '62%'; const pct = $('#meta-pct'); if (pct) contar(pct, 62, '%'); }, 300);
  obsReveal?.disconnect();
  obsReveal = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obsReveal.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal', $('#vista')).forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; obsReveal.observe(el); });
  if (!render.primera) scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' });
  render.primera = false;
  if (vista === 'tienda') prepararTienda();
}
render.primera = true;

function prepararTienda() {
  const cont = $('#productos'), m = modalidad(cont.dataset.mod);
  const original = cont.innerHTML;
  const aplicar = () => {
    const q = $('#buscar').value.trim().toLowerCase(), orden = $('#orden').value;
    let lista;
    if (q.length >= 2) lista = todosLosProductos().filter(x => x.p[1].toLowerCase().includes(q));
    else if (orden) {
      const base = location.hash.split('/')[2];
      const cat = base && base !== 'destacados' ? m.categorias.find(c => c.slug === base) : null;
      lista = (cat ? cat.productos : m.evento).map(p => ({ p, m }));
    }
    if (!lista) { cont.innerHTML = original; return; }
    if (orden === 'asc') lista.sort((a, b) => (a.p[2] || 0) - (b.p[2] || 0));
    if (orden === 'desc') lista.sort((a, b) => (b.p[2] || 0) - (a.p[2] || 0));
    if (orden === 'off') lista.sort((a, b) => ((b.p[3] ? 1 - b.p[2] / b.p[3] : 0) - (a.p[3] ? 1 - a.p[2] / a.p[3] : 0)));
    cont.innerHTML = lista.slice(0, 120).map(x => tarjetaProducto(x.p, x.m)).join('') || '<p class="vacio">Sin resultados.</p>';
    pintar(cont);
  };
  $('#cat-movil').addEventListener('change', e => { location.hash = 'tienda/' + e.target.value; });
  $('#buscar').addEventListener('input', aplicar);
  $('#orden').addEventListener('change', aplicar);
}

/* clics globales: añadir, ver producto, copiar IP */
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) { e.stopPropagation(); const hit = todosLosProductos().find(x => x.p[0] === add.dataset.add); if (hit) anadir(hit.p, hit.m); return; }
  const ver = e.target.closest('[data-ver]');
  if (ver) return verProducto(ver.dataset.ver);
  if (e.target.closest('[data-copiar]')) { navigator.clipboard?.writeText(IP).catch(() => {}); aviso('<b>✔</b> IP copiada. ¡Te esperamos en el fuego!'); }
});
addEventListener('hashchange', render);

/* arranque */
pintar(); pintarSesion(); pintarCarrito();
fetch('data/catalogo.json').then(r => r.json()).then(d => { CATALOGO = d; render(); })
  .catch(() => { $('#vista').innerHTML = '<p class="vacio">No se pudo cargar el catálogo.</p>'; });
