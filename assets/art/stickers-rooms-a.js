// More chunky-toy stickers for the dollhouse: bedroom, craft room, bubble bath and piano room (viewBox 0 0 100 100).
// Same look and helpers as stickers.js (copied here so this file stands alone): thick ink outline, candy fills,
// one glossy highlight per main shape, soft lower-right shade, cute faces where they add charm.

const K = '#2B2340'; // ink
const WH = '#FFFFFF';
const NS = ' stroke="none"';
const n = (v) => +(+v).toFixed(1);

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="${K}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;

const P = (d, fill, x = '') => `<path d="${d}" fill="${fill}"${x}/>`;
const C = (cx, cy, r, fill, x = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${x}/>`;
const E = (cx, cy, rx, ry, fill, rot = 0, x = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${n(cx)} ${n(cy)})"` : ''}${x}/>`;
const L = (d, w = 3.5) => `<path d="${d}" fill="none" stroke-width="${w}"/>`;
const G = (t, body) => `<g transform="${t}">${body}</g>`;
const circ = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;
const ell = (cx, cy, rx, ry) => `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`;
// rounded rectangle
const rr = (x, y, w, h, r) =>
  `M${n(x + r)} ${n(y)}L${n(x + w - r)} ${n(y)}A${r} ${r} 0 0 1 ${n(x + w)} ${n(y + r)}L${n(x + w)} ${n(y + h - r)}A${r} ${r} 0 0 1 ${n(x + w - r)} ${n(y + h)}` +
  `L${n(x + r)} ${n(y + h)}A${r} ${r} 0 0 1 ${n(x)} ${n(y + h - r)}L${n(x)} ${n(y + r)}A${r} ${r} 0 0 1 ${n(x + r)} ${n(y)}Z`;

// glossy highlight (top-left, no outline)
const hi = (cx, cy, rx, ry, rot = -35) => E(cx, cy, rx, ry, WH, rot, ' opacity=".45" stroke="none"');
// dot eye with sparkle
const eye = (x, y, r = 3.8) => C(x, y, r, K, NS) + C(x - r * 0.32, y - r * 0.38, r * 0.4, WH, NS);
const cheek = (x, y, s = 1) => E(x, y, 4.6 * s, 3 * s, '#FF8FB8', 0, ' opacity=".6" stroke="none"');
const smile = (cx, y, w, sw = 3.4) => L(`M${n(cx - w)} ${n(y)}Q${n(cx)} ${n(y + w)} ${n(cx + w)} ${n(y)}`, sw);
const face = (cx, cy, s = 1, gap = 8) =>
  eye(cx - gap * s, cy, 3.8 * s) + eye(cx + gap * s, cy, 3.8 * s) +
  cheek(cx - (gap + 6) * s, cy + 6 * s, s) + cheek(cx + (gap + 6) * s, cy + 6 * s, s) +
  smile(cx, cy + 4.5 * s, 4 * s, Math.max(2.8, 3.4 * s));

// body with soft lower-right shade: fill dark, overlay light copy shifted up-left (clipped), redraw outline
const shade = (id, d, light, dark, dx = -5, dy = -5) =>
  `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>` +
  P(d, dark, NS) + `<g clip-path="url(#${id})">${P(d, light, ` stroke="none" transform="translate(${dx} ${dy})"`)}</g>` + P(d, 'none');
// same, for a shape with a hole (even-odd)
const shadeEO = (id, d, light, dark, dx = -5, dy = -5) =>
  `<defs><clipPath id="${id}"><path d="${d}" clip-rule="evenodd"/></clipPath></defs>` +
  P(d, dark, ' stroke="none" fill-rule="evenodd"') +
  `<g clip-path="url(#${id})">${P(d, light, ` stroke="none" fill-rule="evenodd" transform="translate(${dx} ${dy})"`)}</g>` + P(d, 'none');
// outlined tube (stroke-built limb/branch)
const tube = (d, color, w = 9) => `<path d="${d}" fill="none" stroke-width="${w + 9}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
// shapes clipped to a body, then the body's outline redrawn
const clipIn = (id, d, inner) =>
  `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>` + P(d, 'none');

const scallopD = (cx, cy, R, k, b, rot = -90) => {
  let d = '';
  for (let i = 0; i <= k; i++) {
    const a = ((rot + (i * 360) / k) * Math.PI) / 180;
    const x = n(cx + R * Math.cos(a)), y = n(cy + R * Math.sin(a));
    d += i ? `A${b} ${b} 0 0 1 ${x} ${y}` : `M${x} ${y}`;
  }
  return d + 'Z';
};
const sparkle = (x, y, s, fill) =>
  P(`M${x} ${n(y - s)}Q${x} ${y} ${n(x + s)} ${y}Q${x} ${y} ${x} ${n(y + s)}Q${x} ${y} ${n(x - s)} ${y}Q${x} ${y} ${x} ${n(y - s)}Z`, fill, ' stroke-width="3"');
const HEART = 'M50 86C20 66 10 50 12 34C14 20 26 14 36 16C44 18 48 24 50 28C52 24 56 18 64 16C74 14 86 20 88 34C90 50 80 66 50 86Z';
const miniHeart = (cx, cy, s, fill) => G(`translate(${n(cx - 50 * s)} ${n(cy - 50 * s)}) scale(${s})`, P(HEART, fill, ` stroke-width="${n(3.5 / s)}"`));
// soap bubble: pale fill, thinner outline, tiny shine
const bubble = (x, y, r) => C(x, y, r, '#E6F8FF', ` stroke-width="${r > 6 ? 3.5 : 3}"`) + hi(x - r * 0.35, y - r * 0.38, r * 0.32, r * 0.2);
// water drop
const drop = (cx, cy, r, fill) =>
  P(`M${n(cx)} ${n(cy - 2.3 * r)}C${n(cx + 0.4 * r)} ${n(cy - 1.4 * r)} ${n(cx + r)} ${n(cy - 0.8 * r)} ${n(cx + r)} ${n(cy)}A${r} ${r} 0 0 1 ${n(cx - r)} ${n(cy)}` +
    `C${n(cx - r)} ${n(cy - 0.8 * r)} ${n(cx - 0.4 * r)} ${n(cy - 1.4 * r)} ${n(cx)} ${n(cy - 2.3 * r)}Z`, fill, ' stroke-width="3.5"') +
  hi(cx - r * 0.4, cy - r * 0.3, r * 0.22, r * 0.4, 20);
// small bow tie (kite tail, bouquet)
const bowTie = (x, y, s, fill, rot = 0) => G(`translate(${x} ${y}) rotate(${rot}) scale(${s})`,
  P('M0 0C-4 -7 -12 -8 -12 -2C-12 4 -4 5 0 0ZM0 0C4 -7 12 -8 12 -2C12 4 4 5 0 0Z', fill, ` stroke-width="${n(3.2 / s)}"`) +
  C(0, -0.5, 3, fill, ` stroke-width="${n(3 / s)}"`));

// ---------------------------------------------------------------- bedroom
const bed = svg(
  P(rr(13, 80, 9, 12, 2.5), '#8C62DB', ' stroke-width="4"') + P(rr(79, 80, 9, 12, 2.5), '#8C62DB', ' stroke-width="4"') +
  shade('bed-h', 'M8 84L8 40C8 26 32 26 32 40L32 84Z', '#B78CFF', '#9B6FF0', -4, -4) +
  P('M76 84L76 56C76 48 92 48 92 56L92 84Z', '#B78CFF') +
  miniHeart(20, 42, 0.18, '#FF5FA8') + hi(14, 40, 2, 5, 10) +
  P(rr(22, 70, 64, 13, 4), '#B78CFF') +
  P(rr(22, 58, 64, 14, 5), '#FFF8EE') +
  P('M26 51C25 44 31 42 39 43C47 44 52 46 52 51C52 57 48 59 39 59C31 59 27 57 26 51Z', WH) + hi(33, 47, 4, 2) +
  shade('bed-b', 'M46 55C56 51 72 50 86 52L86 79C82 83 78 79 74 82C70 85 66 81 62 83C58 85 54 81 50 83C46 82 44 70 46 55Z', '#FF8FB8', '#FF6FA0', -4, -4) +
  P('M46 55C56 51 72 50 86 52L86 60C72 58 56 59 45 64Z', '#FFB3D1', ' stroke-width="3.5"') +
  C(58, 71, 2.6, WH, NS) + C(70, 67, 2.6, WH, NS) + C(79, 73, 2.6, WH, NS) + C(65, 77, 2, WH, NS) +
  hi(54, 56, 4, 1.6, -8)
);

const book = (id, x, y, w, h, col, dark, rot) => G(`rotate(${rot} ${n(x + w / 2)} ${n(y + h / 2)})`,
  shade(id, rr(x, y, w, h, 5), col, dark, -3, -3) +
  P(`M${x + 10} ${y + 5}L${x + w - 3} ${y + 5}L${x + w - 3} ${y + h - 5}L${x + 10} ${y + h - 5}Z`, '#FFF8EE', ' stroke-width="3.5"') +
  L(`M${x + 16} ${n(y + h / 2 - 2)}L${x + w - 6} ${n(y + h / 2 - 2)}M${x + 16} ${n(y + h / 2 + 2)}L${x + w - 10} ${n(y + h / 2 + 2)}`, 2).replace('stroke-width', 'stroke="#D8CDBE" stroke-width') +
  L(`M${x + 5} ${y + 4}L${x + 5} ${y + h - 4}`, 2.6) +
  hi(x + 14, y + 2.8, 5, 1.2, 0)
);
const books = svg(
  book('books-a', 12, 68, 76, 22, '#4D96FF', '#3A7FE6', 0) +
  book('books-b', 18, 47, 66, 21, '#FF5FA8', '#E8449A', -4) +
  book('books-c', 22, 26, 58, 21, '#4ADE9A', '#3CC47C', 5)
).replace('<g stroke=', '<g transform="translate(0 -3)" stroke=');

const purpleHeart = svg(
  shade('purple-heart-s', HEART, '#B78CFF', '#9B6FF0') +
  hi(28, 30, 8, 4.5) + C(38, 44, 2.6, WH, ' opacity=".45" stroke="none"') +
  sparkle(84, 14, 7, WH)
);

// ---------------------------------------------------------------- craft room
const PALETTE = 'M50 12C77 12 93 28 91 48C89 64 76 68 68 64C60 60 53 68 57 77C61 86 51 91 40 89C20 86 8 70 9 50C10 28 27 12 50 12Z' + circ(41, 74, 6);
const palette = svg(
  shadeEO('palette-s', PALETTE, '#FFD39A', '#F2B66A') +
  [[27, 52, '#FF6B6B'], [31, 32, '#FFC93C'], [51, 24, '#4ADE9A'], [71, 29, '#4D96FF'], [80, 46, '#B78CFF']]
    .map(([x, y, c]) => P(`M${x - 7} ${y}C${x - 8} ${y - 7} ${x + 1} ${y - 9} ${x + 6} ${y - 5}C${x + 10} ${y - 1} ${x + 7} ${y + 7} ${x} ${y + 7}C${x - 4} ${y + 7} ${x - 7} ${y + 4} ${x - 7} ${y}Z`, c, ' stroke-width="3.5"') + C(x - 2.5, y - 2.5, 1.8, WH, ' opacity=".6" stroke="none"')).join('') +
  hi(18, 40, 2.5, 6, 25) +
  face(54, 48, 0.85, 7)
);

const CRAYON = 'M12 42C12 40 13 39 15 39L66 39L66 61L15 61C13 61 12 60 12 58Z';
const crayon = svg(G('rotate(-38 50 50) translate(1 0)',
  P('M66 40L83 47.5Q87.5 50 83 52.5L66 60Z', '#FF6B6B') +
  shade('crayon-s', CRAYON, '#FF6B6B', '#E84F52', -3, -3) +
  P('M24 39L58 39L58 61L24 61Z', '#FFF8EE', ' stroke-width="3.5"') +
  L('M28 39L28 61M54 39L54 61', 3).replace('stroke-width', 'stroke="#FF6B6B" stroke-width') +
  P('M66 39L66 61', 'none') +
  hi(16, 43, 3, 1.4, 0) + hi(72, 44, 2.6, 1.2, 25) +
  face(41, 48, 0.72, 7)
));

const scissors = svg(
  P('M43 50L52 58L39 66L33 61Z', '#FF5FA8', ' stroke-width="4"') +
  P('M47 55L62 13C63.5 9 58.5 7 56.5 10.5L40 50Z', '#E4E8F4') + hi(55, 18, 1.2, 5, 22) +
  P('M57 50L48 58L61 66L67 61Z', '#FF5FA8', ' stroke-width="4"') +
  shadeEO('scissors-l', circ(31, 74, 15) + circ(31, 74, 6.5), '#FF5FA8', '#E8449A', -3, -3) +
  shadeEO('scissors-r', circ(69, 74, 15) + circ(69, 74, 6.5), '#FF5FA8', '#E8449A', -3, -3) +
  P('M53 55L38 13C36.5 9 41.5 7 43.5 10.5L60 50Z', '#E4E8F4') + hi(42, 20, 1.2, 5, -22) +
  C(50, 52, 4.2, '#FFC93C', ' stroke-width="3.5"') +
  hi(24, 66, 4, 2.2) + hi(62, 66, 4, 2.2)
);

const thread = svg(
  tube('M70 62C84 62 90 70 86 78C82 85 74 84 76 90', '#FF5FA8', 3.5) +
  shade('thread-s', 'M26 22L74 22L74 78L26 78Z', '#FF5FA8', '#E8449A', -4, -4) +
  clipIn('thread-c', 'M26 22L74 22L74 78L26 78Z',
    L('M22 30Q50 36 78 28M22 40Q50 46 78 38M22 50Q50 56 78 48M22 60Q50 66 78 58M22 70Q50 76 78 68', 2.6).replace('stroke-width', 'stroke="#E8449A" stroke-width')) +
  hi(33, 40, 2.4, 9, 0) +
  P(rr(18, 12, 64, 13, 5.5), '#FFD39A') + P(rr(18, 75, 64, 13, 5.5), '#FFD39A') +
  hi(28, 16, 5, 1.6, 0) + hi(28, 79, 5, 1.6, 0) +
  face(50, 50, 0.85, 7)
);

const BALLOON = 'M50 10C68 10 79 24 79 41C79 58 65 71 50 73C35 71 21 58 21 41C21 24 32 10 50 10Z';
const balloon = svg(
  L('M50 79C44 83 56 87 50 92', 3) +
  P('M44.5 79L50 72L55.5 79Q50 81.5 44.5 79Z', '#E84F52', ' stroke-width="3.5"') +
  shade('balloon-s', BALLOON, '#FF6B6B', '#E84F52') +
  hi(36, 26, 8, 4.5) + C(30, 38, 2.2, WH, ' opacity=".45" stroke="none"') +
  face(50, 44, 1)
);

// kite drawn upright then tilted; the tail follows the tilted bottom point (≈ 53,69)
const KT = 'M50 4L76 32L50 74L24 32Z';
const kite = svg(
  L('M53 68C48 78 62 80 66 84C70 88 80 92 89 86', 3) +
  bowTie(58, 79, 0.8, '#FF5FA8', 30) + bowTie(77, 89, 0.8, '#4D96FF', -10) +
  G('translate(-14 0) rotate(-30 50 40)',
    clipIn('kite-c', KT,
      P('M50 4L24 32L50 32Z', '#FF5FA8', NS) + P('M50 4L76 32L50 32Z', '#FFC93C', NS) +
      P('M24 32L50 74L50 32Z', '#FFC93C', NS) + P('M76 32L50 74L50 32Z', '#FF5FA8', NS) +
      P('M76 32L50 74L50 32Z', '#E8449A', ' stroke="none" opacity=".3"')) +
    L('M50 4L50 32M24 32L76 32', 3) +
    hi(42, 20, 4.5, 2.2, -48) +
    face(50, 45, 0.8, 7)
  )
);

const BRISTLE = 'M69 39C81 39 89 45 94 50C89 55 81 61 69 61Z';
const paintbrush = svg(G('rotate(-40 50 50) translate(-1 0)',
  shade('paintbrush-h', 'M6 46.5C6 44 8 43 11 43L54 40L54 60L11 57C8 57 6 56 6 53.5Z', '#FF6B6B', '#E84F52', -3, -3) +
  clipIn('paintbrush-c', BRISTLE, P(BRISTLE, '#F2B66A', NS) + P('M81 36C76 43 85 52 79 64L100 64L100 36Z', '#4D96FF', NS)) +
  P(rr(52, 37, 18, 26, 3), '#E4E8F4') + L('M58 37L58 63M64 37L64 63', 2.6).replace('stroke-width', 'stroke="#B7BED6" stroke-width') +
  hi(20, 46.5, 8, 1.5, 0) + hi(86, 46.5, 2.6, 1.3, 15)
));

const CLIP = 'M75.5 62L75.5 36A25.5 25.5 0 0 0 24.5 36L24.5 68A17 17 0 0 0 58.5 68L58.5 36A8.5 8.5 0 0 0 41.5 36L41.5 60';
const paperclip = svg(G('translate(50 50) rotate(28) scale(0.86) translate(-50 -52)',
  tube(CLIP, '#4D96FF', 5) +
  `<path d="M24.5 64L24.5 38A25.5 25.5 0 0 1 36 16" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>`
));

const YARN = circ(45, 46, 31);
const yarn = svg(
  tube('M30 30L12 10', '#FFC93C', 4) + C(11, 9, 5, '#FF5FA8', ' stroke-width="3.5"') +
  tube('M60 30L82 10', '#FFC93C', 4) + C(83, 9, 5, '#FF5FA8', ' stroke-width="3.5"') +
  tube('M62 70C68 84 80 76 86 84C89 89 85 93 80 91', '#B78CFF', 4) +
  shade('yarn-s', YARN, '#B78CFF', '#9B6FF0') +
  clipIn('yarn-c', YARN,
    L('M18 34C34 38 50 58 52 80M24 23C42 30 60 52 64 74M36 16C54 22 70 40 75 58M14 58C30 48 52 38 76 34', 3)) +
  hi(30, 30, 7, 4)
);

// ---------------------------------------------------------------- bubble bath
const TUB = 'M12 52L88 52L84 70C82 79 74 83 64 83L36 83C26 83 18 79 16 70Z';
const bathtub = svg(
  P('M20 78L31 80L29 90C28 93 21 93 20 90Z', '#FFC93C', ' stroke-width="4"') +
  P('M80 78L69 80L71 90C72 93 79 93 80 90Z', '#FFC93C', ' stroke-width="4"') +
  tube('M15 48L15 30C15 22 27 22 27 30', '#E4E8F4', 4.5) + C(27, 32, 3.5, '#E4E8F4', ' stroke-width="3.5"') +
  bubble(32, 41, 9) + bubble(47, 35, 12) + bubble(63, 37, 10) + bubble(76, 43, 8) + bubble(57, 23, 6) + bubble(82, 26, 4) + bubble(88, 16, 2.6) +
  shade('bathtub-s', TUB, '#FF8FB8', '#FF6FA0') +
  P(rr(8, 46, 84, 9, 4.5), '#FFB3D1') +
  hi(16, 49.5, 6, 1.4, 0) + hi(26, 62, 3, 6, 15) +
  face(52, 64, 0.95, 8)
);

const DUCK = 'M16 62C16 50 28 47 40 49L68 49C76 49 82 45 87 38C93 48 92 60 86 70C80 79 70 84 54 84C30 84 16 76 16 62Z';
const rubberDuck = svg(
  P(ell(52, 87, 40, 5.5), '#7FD8F0') +
  shade('rubber-duck-b', DUCK, '#FFC93C', '#F2AE22') +
  shade('rubber-duck-h', circ(44, 33, 20), '#FFC93C', '#F2AE22', -4, -4) +
  P('M27 35C18 32 9 35 10 41C12 47 22 46 29 43Z', '#FF9F43') + L('M11 40.5Q19 41 27 39.5', 2.6) +
  P('M52 60C60 55 72 57 74 63C68 72 57 72 52 66Z', '#F2AE22', ' stroke-width="3.5"') +
  hi(36, 22, 6, 3.5) + hi(24, 58, 5, 2.4, -20) +
  eye(39, 29, 4) + cheek(46, 39, 0.8)
);

const SOAP = rr(12, 52, 76, 34, 12);
const soap = svg(
  shade('soap-s', SOAP, '#D6C2FF', '#B78CFF') +
  P(rr(20, 57, 60, 20, 8), 'none', ' stroke-width="2.6" stroke="#B78CFF"') +
  hi(24, 60, 5, 2, -10) +
  face(50, 68, 0.9, 8) +
  bubble(24, 44, 8) + bubble(40, 35, 11) + bubble(60, 38, 8) + bubble(74, 26, 6) + bubble(84, 42, 4.5) + bubble(56, 16, 4)
);

const lotion = svg(
  P('M36 15L60 15C62 15 63 16 63 18L63 23L36 23Z', '#FF5FA8', ' stroke-width="4"') + P('M37 16L19 16C17 16 16 17 16 19L16 21C16 22 17 23 19 23L37 23', '#FF5FA8', ' stroke-width="4"') +
  P('M44 23L55 23L55 34L44 34Z', '#E4E8F4', ' stroke-width="4"') +
  P(rr(36, 32, 27, 10, 3), '#FF5FA8', ' stroke-width="4"') +
  shade('lotion-s', 'M26 52C26 45 31 40 38 40L61 40C68 40 73 45 73 52L73 84C73 88 71 90 67 90L32 90C28 90 26 88 26 84Z', '#4ADE9A', '#3CC47C') +
  P(rr(33, 55, 33, 26, 6), '#FFF8EE', ' stroke-width="3.5"') +
  miniHeart(49.5, 64, 0.17, '#FF5FA8') +
  hi(31, 50, 2.6, 6, 10) + hi(42, 18, 4, 1.3, 0) +
  eye(42, 72, 2.8) + eye(57, 72, 2.8) + smile(49.5, 74, 2.6, 2.6)
);

const shower = svg(
  tube('M9 14L38 14C46 14 50 18 50 26', '#E4E8F4', 6) +
  P('M43 25L57 25L57 31L43 31Z', '#E4E8F4', ' stroke-width="4"') +
  shade('shower-s', 'M42 30L58 30L80 49C80 55 20 55 20 49Z', '#7FD8F0', '#5CC4E2', -4, -4) +
  P(ell(50, 51, 30, 6.5), '#22B8CF') +
  C(34, 51, 1.6, K, NS) + C(42, 52.5, 1.6, K, NS) + C(50, 53, 1.6, K, NS) + C(58, 52.5, 1.6, K, NS) + C(66, 51, 1.6, K, NS) +
  hi(38, 40, 5, 2, -30) + hi(17, 11.5, 4, 1, 0) +
  drop(30, 70, 4.5, '#4D96FF') + drop(50, 68, 4.5, '#4D96FF') + drop(70, 70, 4.5, '#4D96FF') +
  drop(40, 87, 4, '#4D96FF') + drop(60, 87, 4, '#4D96FF')
);

// ---------------------------------------------------------------- piano room
const pianoKeys = [21, 31, 41, 51, 61, 71, 81];
const piano = svg(
  P(rr(18, 82, 9, 10, 2.5), '#E8449A', ' stroke-width="4"') + P(rr(73, 82, 9, 10, 2.5), '#E8449A', ' stroke-width="4"') +
  shade('piano-s', rr(14, 18, 72, 66, 6), '#FF8FB8', '#FF6FA0') +
  P(rr(9, 12, 82, 10, 5), '#FF5FA8') +
  P('M34 26L66 26L66 44L34 44Z', '#FFF8EE', ' stroke-width="3.5"') +
  L('M38 31L62 31M38 35L62 35M38 39L62 39', 1.6) +
  C(44, 39.5, 2.2, K, NS) + L('M46 39.5L46 31', 1.8) + C(55, 35.5, 2.2, K, NS) + L('M57 35.5L57 28', 1.8) +
  P(rr(10, 48, 80, 17, 3), WH) +
  L(pianoKeys.map((x) => `M${x} 48L${x} 65`).join(''), 2.4) +
  [21, 31, 51, 61, 71].map((x) => P(`M${x - 3} 48L${x + 3} 48L${x + 3} 58L${x - 3} 58Z`, K, ' stroke-width="1"')).join('') +
  P(rr(8, 64, 84, 6, 3), '#FF5FA8', ' stroke-width="4"') +
  hi(20, 26, 2.4, 8, 0) + hi(18, 14.5, 5, 1.3, 0) +
  face(50, 76, 0.75, 8)
);

const music = (id, x, y, rx, ry, col, dark, s) => G(`rotate(-20 ${x} ${y})`, shade(id, ell(x, y, rx, ry), col, dark, -3, -3)) +
  hi(x - rx * 0.45, y - ry * 0.4, rx * 0.25, ry * 0.18, -20) + face(x, y - 1, s, 6.5);
const musicNote = svg(
  shade('music-note-s', 'M49 72L49 16Q49 11 54 11L57 11C59 24 78 28 78 46C78 52 76 57 72 60C73 47 67 40 57 38L57 72Z', '#FF5FA8', '#E8449A', -3, -3) +
  hi(53, 26, 1.2, 7, 0) +
  music('music-note-h', 37, 73, 17, 12.5, '#FF5FA8', '#E8449A', 0.7)
);

const musicNotes = svg(
  shade('music-notes-s', 'M39 74L39 25L86 15L86 64L79 64L79 26.5L46 33.5L46 74Z', '#B78CFF', '#9B6FF0', -3, -3) +
  hi(52, 25, 6, 1.2, -12) +
  music('music-notes-a', 28, 76, 15, 11, '#B78CFF', '#9B6FF0', 0.58) +
  music('music-notes-b', 68, 66, 15, 11, '#B78CFF', '#9B6FF0', 0.58)
);

const MIC = circ(50, 29, 19);
const microphone = svg(G('rotate(-18 50 52)',
  L('M50 88C50 94 40 96 34 92', 3.5) +
  shade('microphone-h', 'M40 52L60 52L55.5 86C55 90 45 90 44.5 86Z', '#FF5FA8', '#E8449A', -3, -3) +
  P(rr(35, 45, 30, 10, 5), '#FFC93C') +
  shade('microphone-s', MIC, '#E4E8F4', '#C5CBE0') +
  clipIn('microphone-c', MIC, L('M28 20L72 20M28 29L72 29M28 38L72 38M41 8L41 50M50 8L50 50M59 8L59 50', 2).replace('stroke-width', 'stroke="#A8B0CC" stroke-width')) +
  hi(42, 21, 6, 3.5) + hi(44, 64, 1.4, 6, 0) + C(50, 70, 3.2, '#FFC93C', ' stroke-width="3"')
) + sparkle(82, 22, 7, '#FFC93C') + sparkle(18, 30, 5, '#7FD8F0'));

const VIOLIN = 'M50 40C39 40 31 42 31 51C31 58 37 60 37 65C37 70 29 72 29 80C29 89 39 93 50 93C61 93 71 89 71 80C71 72 63 70 63 65C63 60 69 58 69 51C69 42 61 40 50 40Z';
const violin = svg(
  G('translate(51 50) rotate(36) scale(0.9) translate(-50 -50)',
    P('M46 8L54 8L54 42L46 42Z', '#B07A4E', ' stroke-width="4"') +
    C(50, 8, 5.5, '#B07A4E', ' stroke-width="4"') + C(50, 8, 1.8, K, NS) +
    L('M44 16L40 16M56 16L60 16M44 24L40 24M56 24L60 24', 4) +
    shade('violin-s', VIOLIN, '#FF9F43', '#F07F22') +
    P('M46.5 22L53.5 22L54 74L46 74Z', '#4A3A66', ' stroke-width="4"') +
    L('M48.6 24L48.6 86M51.4 24L51.4 86', 1.2).replace('stroke-width', 'stroke="#FFF8EE" stroke-width') +
    L('M39 60C37 64 41 68 39 72M61 60C63 64 59 68 61 72', 2.6) +
    P('M43 76L57 76L56 80L44 80Z', '#FFC93C', ' stroke-width="3"') +
    P('M46 84L54 84L53 91L47 91Z', '#4A3A66', ' stroke-width="3"') +
    hi(38, 48, 3, 6, 20) + hi(36, 80, 2.4, 5, 15)
  ) +
  tube('M18 30L80 86', '#B07A4E', 3) + L('M21 34L78 85', 1.6).replace('stroke-width', 'stroke="#FFF8EE" stroke-width') +
  P(rr(74, 80, 9, 8, 2), '#4A3A66', ' stroke-width="3" transform="rotate(42 78.5 84)"')
);

const DRUM = 'M14 40C14 54.7 86 54.7 86 40L86 74C86 88.7 14 88.7 14 74Z';
const drum = svg(
  shade('drum-s', DRUM, '#FF6B6B', '#E84F52', -4, -4) +
  clipIn('drum-c', DRUM,
    `<path d="M10 52L24 72L37 54L50 76L63 54L76 72L90 52" fill="none" stroke-width="8"/><path d="M10 52L24 72L37 54L50 76L63 54L76 72L90 52" fill="none" stroke="#FFF8EE" stroke-width="3"/>` +
    P('M10 70C10 86 90 86 90 70L90 100L10 100Z', '#4D96FF')) +
  L('M14 71C14 85.7 86 85.7 86 71', 4) +
  E(50, 40, 36, 12, '#4D96FF') + E(50, 39.5, 30, 8.5, '#FFF8EE', 0, ' stroke-width="3"') +
  hi(20, 56, 2.4, 6, 0) + hi(36, 37, 6, 1.6, -5) +
  tube('M18 8L43 33', '#FFC93C', 4) + C(44, 34, 4.5, '#FFC93C', ' stroke-width="3.5"') +
  tube('M82 8L57 33', '#FFC93C', 4) + C(56, 34, 4.5, '#FFC93C', ' stroke-width="3.5"')
);

const trumpet = svg(G('translate(50 50) scale(1.03) translate(-49.5 -46)',
  tube('M56 58L30 58C21 58 21 46 30 46', '#FFC93C', 6) +
  tube('M15 46L64 46', '#FFC93C', 6) +
  P('M6 40C9 40 11 43 15 44L15 48C11 49 9 52 6 52Z', '#F2AE22', ' stroke-width="4"') +
  shade('trumpet-b', 'M60 40L80 25C86 21 92 30 92 46C92 62 86 71 80 67L60 52Z', '#FFC93C', '#F2AE22', -3, -3) +
  E(87, 46, 5, 17, '#F2AE22', 0, ' stroke-width="4"') + E(88.5, 46, 2.2, 11, '#E09A14', 0, NS) +
  [35, 45, 55].map((x) => L(`M${x} 26L${x} 32`, 3.5) + C(x, 24, 3.6, '#FFF8EE', ' stroke-width="3.5"')).join('') +
  P(rr(29, 31, 32, 29, 4), '#FFC93C', ' stroke-width="4"') + L('M39.7 31L39.7 60M50.3 31L50.3 60', 3) + hi(33, 40, 1.2, 5, 0) +
  hi(70, 33, 5, 2.2, -35) + hi(24, 43.5, 6, 1, 0)
));

const SHEET = 'M20 12L68 12L82 26L82 86C82 88 80 90 78 90L22 90C20 90 18 88 18 86L18 14C18 13 19 12 20 12Z';
const staff = (y) => [0, 1, 2, 3, 4].map((i) => `M27 ${y + i * 5}L73 ${y + i * 5}`).join('');
const nh = (x, y) => E(x, y, 3.6, 2.8, K, -20, NS);
const sheetMusic = svg(G('rotate(-5 50 50)',
  shade('sheet-music-s', SHEET, '#FFFFFF', '#E9E2F4', -3, -3) +
  P('M68 12L68 23C68 25 69 26 71 26L82 26Z', '#E9E2F4', ' stroke-width="3.5"') +
  L(staff(30) + staff(60), 1.6) +
  L('M29 55C27 58 31 60 33 57L33 24C33 20 37 21 36 25C35 30 28 34 28 42C28 48 36 49 37 44C38 40 33 38 31 42', 2.6) +
  nh(42, 45) + L('M45.4 44L45.4 30', 2.2) +
  nh(52, 40) + L('M55.4 39L55.4 25', 2.2) + L('M55.4 25C58 28 61 29 60 34', 2.2) +
  nh(64, 47.5) + nh(71, 42.5) + L('M67.4 46.5L67.4 32M74.4 41.5L74.4 27', 2.2) + P('M67.4 32L74.4 27L74.4 30L67.4 35Z', K, ' stroke-width="1.6"') +
  nh(33, 72.5) + L('M36.4 71.5L36.4 57', 2.2) +
  nh(45, 67.5) + L('M48.4 66.5L48.4 52', 2.2) +
  nh(57, 75) + L('M60.4 74L60.4 59.5', 2.2) +
  nh(68, 62.5) + L('M71.4 61.5L71.4 47', 2.2) +
  hi(26, 20, 5, 1.6, 0)
) + miniHeart(78, 82, 0.2, '#FF5FA8'));

const flowerHead = (x, y, R, col, centre) => P(scallopD(x, y, R, 6, n(R * 0.55)), col) + C(x, y, R * 0.4, centre, ' stroke-width="3"') + hi(x - R * 0.45, y - R * 0.5, R * 0.28, R * 0.16);
const bouquet = svg(
  E(22, 46, 13, 6, '#4ADE9A', -35) + E(78, 46, 13, 6, '#4ADE9A', 35) + E(50, 46, 6, 12, '#4ADE9A') +
  L('M18 44L28 47M82 44L72 47', 2.4) +
  flowerHead(50, 22, 13, '#FFC93C', '#FF9F43') +
  flowerHead(30, 34, 13, '#FF5FA8', '#FFC93C') +
  flowerHead(70, 34, 13, '#B78CFF', '#FFC93C') +
  flowerHead(50, 44, 11, '#FF6B6B', '#FFC93C') +
  shade('bouquet-w', 'M22 52L78 52L56 92L44 92Z', '#7FD8F0', '#5CC4E2', -4, -4) +
  L('M40 52L47 92M60 52L53 92', 2.6).replace('stroke-width', 'stroke="#22B8CF" stroke-width') +
  P('M22 52L78 52L56 92L44 92Z', 'none') +
  hi(31, 58, 4, 1.8, 0) +
  bowTie(50, 68, 1.05, '#FF5FA8')
);

// ---------------------------------------------------------------- export
const DEFS = [
  ['bedroom', 'bed', 'bed', bed], ['bedroom', 'books', 'books', books], ['bedroom', 'purple-heart', 'purple heart', purpleHeart],
  ['craft', 'palette', 'paint palette', palette], ['craft', 'crayon', 'crayon', crayon], ['craft', 'scissors', 'scissors', scissors],
  ['craft', 'thread', 'thread', thread], ['craft', 'balloon', 'balloon', balloon], ['craft', 'kite', 'kite', kite],
  ['craft', 'paintbrush', 'paintbrush', paintbrush], ['craft', 'paperclip', 'paper clip', paperclip], ['craft', 'yarn', 'yarn', yarn],
  ['bath', 'bathtub', 'bathtub', bathtub], ['bath', 'rubber-duck', 'rubber duck', rubberDuck], ['bath', 'soap', 'soap', soap],
  ['bath', 'lotion', 'lotion', lotion], ['bath', 'shower', 'shower', shower],
  ['piano', 'piano', 'piano', piano], ['piano', 'music-note', 'music note', musicNote], ['piano', 'music-notes', 'music notes', musicNotes],
  ['piano', 'microphone', 'microphone', microphone], ['piano', 'violin', 'violin', violin], ['piano', 'drum', 'drum', drum],
  ['piano', 'trumpet', 'trumpet', trumpet], ['piano', 'sheet-music', 'sheet music', sheetMusic], ['piano', 'bouquet', 'bouquet', bouquet],
];

export const STICKERS_ROOMS_A = {};
for (const [theme, id, label, s] of DEFS) STICKERS_ROOMS_A[id] = { theme, label, svg: s };
