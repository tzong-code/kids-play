// More chunky-toy stickers for the dollhouse: tennis court, swimming pool and golf green (viewBox 0 0 100 100).
// Same look and helpers as stickers.js (copied, not imported, so this file stands alone).

const K = '#2B2340'; // ink
const WH = '#FFFFFF';
const SKIN = '#FFD6B5';
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
// outlined tube (stroke-built limb/branch)
const tube = (d, color, w = 9) => `<path d="${d}" fill="none" stroke-width="${w + 9}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
// thinner outlined band (stripes, straps)
const band = (d, color, w = 4, ink = 3.5) => `<path d="${d}" fill="none" stroke-width="${w + ink * 2}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
const clipG = (id, body) => `<g clip-path="url(#${id})">${body}</g>`;

const starD = (cx, cy, R, r, pts = 5, rot = -90) => {
  let d = '';
  for (let i = 0; i < pts * 2; i++) {
    const a = ((rot + (i * 180) / pts) * Math.PI) / 180;
    const rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${n(cx + rr * Math.cos(a))} ${n(cy + rr * Math.sin(a))}`;
  }
  return d + 'Z';
};
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
const heartD = (cx, cy, s) =>
  `M${cx} ${n(cy + 7 * s)}C${n(cx - 9 * s)} ${n(cy + 1 * s)} ${n(cx - 9 * s)} ${n(cy - 6 * s)} ${n(cx - 4.5 * s)} ${n(cy - 6 * s)}` +
  `C${n(cx - 2 * s)} ${n(cy - 6 * s)} ${cx} ${n(cy - 4 * s)} ${cx} ${n(cy - 2.5 * s)}C${cx} ${n(cy - 4 * s)} ${n(cx + 2 * s)} ${n(cy - 6 * s)} ${n(cx + 4.5 * s)} ${n(cy - 6 * s)}` +
  `C${n(cx + 9 * s)} ${n(cy - 6 * s)} ${n(cx + 9 * s)} ${n(cy + 1 * s)} ${cx} ${n(cy + 7 * s)}Z`;

const LIME = '#DDF25C', LIME_D = '#C2DA3A';
const GOLD = '#FFC93C', GOLD_D = '#F2AE22';
const PINK = '#FF5FA8', PINK_D = '#E8449A';
const GREEN = '#4ADE9A', GREEN_D = '#3CC47C';
const BROWN = '#B07A4E';
const WATER = '#7FD8F0', WATER_D = '#5CC4E2';

// ---------------------------------------------------------------- tennis court
const BALL = circ(50, 50, 38);
const tennisBall = svg(
  shade('tennis-ball-s', BALL, LIME, LIME_D) +
  clipG('tennis-ball-s', ['M14 16C33 31 33 69 14 84', 'M86 16C67 31 67 69 86 84'].map((d) => band(d, WH, 4.5, 3)).join('')) +
  P(BALL, 'none') +
  hi(36, 26, 8, 4.5) + face(50, 52, 1.05)
);

const HEAD_O = ell(50, 33, 24, 27), HEAD_I = ell(50, 33, 16.5, 19.5);
const racket = svg(
  G('rotate(35 50 50)',
    P('M43 56L46.5 76L53.5 76L57 56Z', PINK) +
    P('M45 74h10v18q0 3 -5 3q-5 0 -5 -3Z', '#4D96FF') + L('M45 80L55 77M45 87L55 84', 3) +
    shade('racket-s', HEAD_O, PINK, PINK_D, -4, -4) +
    `<defs><clipPath id="racket-c"><path d="${HEAD_I}"/></clipPath></defs>` + P(HEAD_I, '#FFF8EE', NS) +
    clipG('racket-c', L('M36 0V70M43 0V70M50 0V70M57 0V70M64 0V70M0 18H100M0 25H100M0 32H100M0 39H100M0 46H100', 2.2)) +
    P(HEAD_I, 'none', ' stroke-width="3.5"') +
    hi(33, 22, 2.4, 7, 20)
  ) +
  C(80, 80, 9.5, LIME, ' stroke-width="4"') + L('M73.5 73.5C78.5 78 78.5 83 73.5 87', 2.8) + L('M86.5 73.5C81.5 78 81.5 83 86.5 87', 2.8) +
  hi(77, 76, 2.6, 1.6)
);

const trophy = svg(
  tube('M30 25C14 21 12 44 35 47', GOLD, 4) + tube('M70 25C86 21 88 44 65 47', GOLD, 4) +
  P('M30 80Q30 77 33 77L67 77Q70 77 70 80L70 88Q70 91 67 91L33 91Q30 91 30 88Z', '#8C62DB') +
  P('M42 81h16v6h-16z', '#FFE07A', ' stroke-width="2.5"') +
  P('M45 55L55 55L58 70L42 70Z', GOLD_D) +
  P('M36 72Q36 69 39 69L61 69Q64 69 64 72L64 77L36 77Z', GOLD) +
  shade('trophy-s', 'M25 15L75 15C75 42 66 56 50 58C34 56 25 42 25 15Z', GOLD, GOLD_D) +
  P('M23 9.5Q21 9.5 21 12.5Q21 15.5 23 15.5L77 15.5Q79 15.5 79 12.5Q79 9.5 77 9.5Z', '#FFE07A', ' stroke-width="4"') +
  P(starD(50, 35, 11, 5), '#FFF3C4', ' stroke-width="3.5"') +
  hi(34, 28, 3.5, 9, -10) + sparkle(88, 50, 6, WH)
);

const GLASS = 'M24 28L76 28L69 87C68.5 90 66 92 63 92L37 92C34 92 31.5 90 31 87Z';
const drink = svg(
  tube('M55 50L61 12L75 7', WH, 5) +
  `<path d="M55 50L61 12L75 7" fill="none" stroke="#FF5FA8" stroke-width="5" stroke-dasharray="4.5 5" stroke-linecap="butt"/>` +
  `<defs><clipPath id="drink-c"><path d="${GLASS}"/></clipPath></defs>` + P(GLASS, '#E6F7FC', NS) +
  clipG('drink-c', P('M0 42Q25 38 50 42T100 42V100H0Z', '#FF9F43') + P('M64 44H100V100H64Z', '#F07F22', ' stroke="none" opacity=".55"')) +
  P(GLASS, 'none') +
  hi(33, 52, 2.6, 13, -6) +
  face(50, 64, 0.9) +
  C(28, 28, 11, '#FF9F43', ' stroke-width="4"') + C(28, 28, 7, '#FFC93C', ' stroke-width="2.5"') +
  L('M28 21.5V34.5M21.5 28H34.5M23.4 23.4L32.6 32.6M32.6 23.4L23.4 32.6', 2)
);

const CAP_DOME = 'M12 64C10 38 26 20 46 20C66 20 80 36 80 60C60 56 32 58 12 64Z';
const cap = svg(G('translate(0 6)',
  shade('cap-s', CAP_DOME, PINK, PINK_D) +
  L('M46 20C40 32 38 46 40 59', 3) + L('M46 20C54 32 58 44 60 57', 3) +
  P(heartD(68, 40, 0.85), WH, ' stroke-width="3"') +
  C(46, 19, 4.5, '#FF8FB8', ' stroke-width="3.5"') +
  P('M52 60C66 50 88 51 92 60C92 68 74 72 56 68C51 66 49 62 52 60Z', '#FF8FB8') +
  L('M56 64C68 62 80 61 90 62', 2.8) +
  hi(25, 36, 7, 4, -45)
));

const SHOE = 'M6 34L6 8C6 4 9 2 13 3L27 6C32 15 44 20 58 22C68 24 72 28 72 34Z';
const shoe = (id, c, dc) =>
  shade(id, SHOE, c, dc, -4, -4) +
  band('M12 25C24 25 34 21 42 17', GOLD, 4, 3) +
  P('M58 22C67 23 72 28 72 32L56 32C55 28 56 24 58 22Z', WH, ' stroke-width="3"') +
  L('M31 12L35 8M37 15.5L41 11.5M43 18L47 14', 3) +
  P('M3 32L74 32C77 32 77 41 72 41L8 41C3 41 2 36 3 32Z', WH, ' stroke-width="4"') +
  hi(13, 14, 2.5, 6, -10);
const sneakers = svg(
  G('translate(14 16)', shoe('sneakers-a', '#FF6B6B', '#E84F52')) +
  G('translate(8 46)', shoe('sneakers-b', '#FF6B6B', '#E84F52'))
);

const medal = svg(
  P('M23 8L41 8L59 52L43 55Z', '#4D96FF') + L('M32 8L51 53', 3) +
  P('M77 8L59 8L41 52L57 55Z', '#FF6B6B') + L('M68 8L49 53', 3) +
  shade('medal-s', circ(50, 66, 23), GOLD, GOLD_D) +
  C(50, 66, 15.5, '#FFE07A', ' stroke-width="3"') +
  P(starD(50, 67, 10.5, 4.8), '#FF9F43', ' stroke-width="3.2"') +
  hi(39, 54, 6, 3.2)
);

const ARM = 'M18 52C24 50 28 46 32 42C40 32 54 34 60 46L62 30L87 28C87 46 88 60 86 70C84 80 76 86 64 86L18 86Z';
const FIST = 'M59 22C58 13 65 7 74 7C84 7 90 14 89 23C88 32 82 37 74 37C65 37 60 30 59 22Z';
const muscle = svg(
  L('M28 30L24 22M38 26L38 17M48 29L52 21', 3.5) +
  shade('muscle-s', ARM, SKIN, '#F6B994') +
  L('M60 47Q64 54 71 56', 3) +
  shade('muscle-f', FIST, SKIN, '#F6B994', -3, -3) +
  L('M60 16Q65 14 68 18M59.5 24Q65 22 68 26M64 32Q71 34 77 29', 3) +
  hi(40, 44, 7, 3.5, -25) + hi(78, 14, 4, 2.2, -20) +
  face(42, 64, 0.85) +
  P('M8 54Q8 48 14 48L22 48Q28 48 28 54L28 82Q28 88 22 88L14 88Q8 88 8 82Z', PINK) +
  L('M8 60H28M8 76H28', 3)
);
// ---------------------------------------------------------------- swimming pool
const WAVE = 'M6 66Q14 59 22 66T38 66T54 66T70 66T86 66Q91 62 94 64L94 86Q94 90 90 90L10 90Q6 90 6 86Z';
const swimmer = svg(
  E(50, 68, 20, 9, SKIN) + P('M34 66C40 62 60 62 66 66L66 74L34 74Z', PINK, ' stroke-width="4"') +
  tube('M68 64C77 56 81 44 78 31', SKIN, 7) + C(77, 28, 6, SKIN, ' stroke-width="4"') +
  C(50, 44, 19, SKIN) +
  P('M31 45C29 31 38 24 50 24C62 24 71 31 69 45C63 39 57 37 50 37C43 37 37 39 31 45Z', PINK) +
  hi(40, 30, 6, 2.8, -25) +
  C(62, 31, 3, WH, NS) + C(66.5, 33.5, 2.4, WH, NS) + C(58, 28, 2, WH, NS) +
  face(50, 50, 0.85, 7) +
  shade('swimmer-s', WAVE, WATER, WATER_D, -4, -3) +
  L('M16 77Q21 74 26 77M58 82Q63 79 68 82M74 73Q79 70 84 73', 3) +
  tube('M34 68C27 66 22 65 17 66', SKIN, 7) + C(15, 66, 5.5, SKIN, ' stroke-width="4"') +
  C(9, 56, 2.6, WATER, ' stroke-width="2.5"') + C(18, 53, 2, WATER, ' stroke-width="2.5"') +
  C(88, 26, 2.6, WATER, ' stroke-width="2.5"') + C(90, 37, 2, WATER, ' stroke-width="2.5"')
);

const SUIT = 'M32 10L39 10L41 28C45 33 55 33 59 28L61 10L68 10L70 36C71 46 66 52 66 58C66 66 72 72 78 76L62 90C58 84 54 81 50 81C46 81 42 84 38 90L22 76C28 72 34 66 34 58C34 52 29 46 30 36Z';
const swimsuit = svg(
  shade('swimsuit-s', SUIT, '#B78CFF', '#9B6FF0', -4, -4) +
  clipG('swimsuit-s', [[40, 46], [56, 44], [48, 58], [62, 64], [38, 70], [52, 72], [44, 40]].map(([x, y]) => C(x, y, 2.6, WH, NS)).join('')) +
  P('M50 35L42 30L42 40Z', PINK, ' stroke-width="3"') + P('M50 35L58 30L58 40Z', PINK, ' stroke-width="3"') +
  C(50, 35, 3, PINK, ' stroke-width="2.8"') +
  hi(37, 52, 2.6, 8, -10)
);

const goggles = svg(
  band('M17 58C14 22 86 22 83 58', PINK, 5, 3.5) +
  E(31, 58, 18, 14.5, PINK) + E(69, 58, 18, 14.5, PINK) +
  band('M46 54Q50 50 54 54', PINK, 4, 3.5) +
  shade('goggles-l', ell(31, 58, 11.5, 9), WATER, '#4DBFE0', -3, -3) +
  shade('goggles-r', ell(69, 58, 11.5, 9), WATER, '#4DBFE0', -3, -3) +
  hi(27, 54, 4, 2.2) + hi(65, 54, 4, 2.2) + hi(20, 50, 2, 1.2)
);

const RING_C = 'M23 52A27 27 0 1 0 77 52A27 27 0 1 0 23 52';
const swimRing = svg(
  `<path d="${RING_C}" fill="none" stroke-width="31"/>` +
  `<path d="${RING_C}" fill="none" stroke="${WH}" stroke-width="22"/>` +
  `<path d="${RING_C}" fill="none" stroke="#FF6B6B" stroke-width="22" stroke-dasharray="21.2 21.2" stroke-linecap="butt"/>` +
  `<path d="M66 75A27 27 0 0 0 76 63" fill="none" stroke="${K}" stroke-opacity=".12" stroke-width="16"/>` +
  `<path d="M28 34A28 28 0 0 1 42 25" fill="none" stroke="${WH}" stroke-width="5" opacity=".55"/>` +
  C(50, 52, 38.5, 'none', ' stroke-width="4.5"') + C(50, 52, 15.5, 'none', ' stroke-width="4.5"')
);

const watermelon = svg(G('rotate(-10 50 50)',
  P('M8 30A42 42 0 0 0 92 30Z', GREEN_D) +
  P('M14 30A36 36 0 0 0 86 30Z', '#E9FFD8', ' stroke-width="3"') +
  shade('watermelon-s', 'M19 30A31 31 0 0 0 81 30Z', '#FF6B6B', '#E84F52', -4, -4) +
  [[30, 40, 30], [70, 40, -30], [38, 52, 20], [62, 52, -20], [50, 56, 0]].map(([x, y, r]) => E(x, y, 1.7, 2.8, K, r, NS)).join('') +
  hi(28, 34, 5, 2.2, 20) + face(50, 40, 0.85) +
  L('M24 52Q20 48 18 42', 2.6)
));

const leaf = (x0, y0, x1, y1, c1, c2) =>
  P(`M${x0} ${y0}Q${c1} ${x1} ${y1}Q${c2} ${x0} ${y0}Z`, GREEN) + L(`M${x0} ${y0}Q${c1} ${x1} ${y1}`, 2.6);
const palmTree = svg(
  P('M18 91C24 79 38 75 52 75C66 75 80 79 86 91Z', '#FFE09A') +
  shade('palm-tree-s', 'M42 86C44 66 48 46 57 30L66 33C58 50 54 68 56 86Z', BROWN, '#946238', -3, 0) +
  L('M45.5 70L55 71M47.5 58L56.5 60M50.5 46L59.5 49M54 37L62.5 40', 3) +
  leaf(60, 30, 14, 34, '36 6', '40 30') +
  leaf(60, 30, 22, 58, '30 30', '46 44') +
  leaf(60, 30, 90, 22, '80 6', '78 28') +
  leaf(60, 30, 88, 54, '88 32', '72 40') +
  leaf(60, 30, 42, 8, '46 14', '56 16') +
  C(55, 36, 5.5, '#8B5A3C', ' stroke-width="3.5"') + C(65, 37, 5.5, '#8B5A3C', ' stroke-width="3.5"') +
  hi(30, 20, 5, 2, -20) + hi(33, 82, 5, 2, -5)
);

// ---------------------------------------------------------------- golf green
const golfFlag = svg(
  shade('golf-flag-s', 'M8 86C12 70 30 63 50 63C70 63 88 70 92 86C92 90 90 91 86 91L14 91C10 91 8 90 8 86Z', GREEN, GREEN_D) +
  E(58, 76, 10, 4, K, 0, ' stroke-width="3"') +
  tube('M58 76L58 13', WH, 3) +
  P('M60 11C68 8 74 15 88 12C84 20 85 26 88 32C76 35 68 28 60 32Z', '#FF6B6B') +
  hi(66, 15, 3.5, 1.8, -10) +
  C(58, 10, 3.6, GOLD, ' stroke-width="3"') +
  C(30, 74, 6.5, WH, ' stroke-width="3.5"') + C(28, 72, 1, '#C9C2D9', NS) + C(32, 73, 1, '#C9C2D9', NS) + C(30, 77, 1, '#C9C2D9', NS) +
  hi(26, 70, 5, 2.2, -15)
);

const HAIR = '#8C5A3C';
const golfer = svg(
  E(50, 88, 38, 5, GREEN, 0, ' stroke-width="4"') +
  C(22, 84, 4.6, WH, ' stroke-width="3"') +
  P('M62 22C78 16 88 32 82 46C79 53 72 54 70 49C76 43 74 31 62 31Z', HAIR) +
  tube('M44 72L43 83', SKIN, 4) + tube('M55 72L57 83', SKIN, 4) +
  E(41, 86, 6, 3.5, WH, 0, ' stroke-width="3.5"') + E(59, 86, 6, 3.5, WH, 0, ' stroke-width="3.5"') +
  P('M36 64L64 64L68 78L32 78Z', '#FF8FB8') +
  shade('golfer-s', 'M37 52L63 52C66 56 67 62 66 66L34 66C33 62 34 56 37 52Z', GREEN, GREEN_D, -3, -3) +
  P('M43 52L50 58L57 52Z', WH, ' stroke-width="3"') +
  tube('M72 50L74 85', '#D8D2E6', 2.5) +
  P('M72 82L85 84C88 85 88 89 85 90L73 89.5C70 89 70 83 72 82Z', '#D8D2E6', ' stroke-width="3.5"') +
  tube('M61 56L70 63', SKIN, 4) + C(72, 63, 4.6, SKIN, ' stroke-width="3.5"') +
  tube('M39 56L29 47', SKIN, 4) + C(27, 45, 4.6, SKIN, ' stroke-width="3.5"') +
  C(50, 36, 17, SKIN) +
  P('M31.5 40C30.5 19 40 15.5 50 15.5C60 15.5 69.5 19 68.5 40C64.5 32 57 28.5 50 30.5C43 28.5 35.5 32 31.5 40Z', HAIR, NS) +
  L('M34 35.5C38 32 44 29.8 50 30.3C56 29.8 62 32 66 35.5', 3.4) +
  P('M64 20L72 14L73 25Z', PINK, ' stroke-width="3"') + P('M64 20L58 12L56 22Z', PINK, ' stroke-width="3"') +
  hi(38, 23, 4, 2.2, -35) +
  face(50, 41, 0.85, 7)
);
const golfBuggy = svg(
  tube('M22 25L20 56', '#D8D2E6', 3) + tube('M77 25L79 48', '#D8D2E6', 3) +
  P('M12 38h12v18h-12z', '#4D96FF', ' stroke-width="4"') +
  tube('M15 38L14 33', '#D8D2E6', 1.5) + tube('M20 38L21 33', '#D8D2E6', 1.5) +
  E(13.5, 31.5, 3.2, 2.2, '#D8D2E6', -15, ' stroke-width="3"') + E(22, 31.5, 3.2, 2.2, '#D8D2E6', 15, ' stroke-width="3"') +
  P('M29 40C29 37 31 36 33 36L38 36C40 36 41 37 41 40L41 56L29 56Z', '#FF6B6B', ' stroke-width="4"') +
  P('M39 51C39 48 40 47 42 47L58 47C60 47 61 48 61 51L61 56L39 56Z', '#FF6B6B', ' stroke-width="4"') +
  L('M68 48L64 38', 4) + E(63, 36.5, 6, 2.4, 'none', -15, ' stroke-width="3.5"') +
  shade('golf-buggy-s', 'M8 60C8 56 11 54 15 54L62 54L66 46L80 46C86 46 91 52 91 60L91 71C91 74 89 76 86 76L13 76C10 76 8 74 8 71Z', WH, '#DCE8FF', -3, -4) +
  E(87.5, 56, 2.4, 3.4, GOLD, 0, ' stroke-width="2.5"') +
  L('M9 65H90', 3) +
  shade('golf-buggy-r', 'M12 21C12 16 15 13 20 13L80 13C85 13 88 16 88 21L88 26L12 26Z', GREEN, GREEN_D, -2, -3) +
  hi(24, 18, 7, 2, -5) +
  C(28, 77, 10.5, K) + C(28, 77, 4.3, '#D8D2E6', NS) + C(73, 77, 10.5, K) + C(73, 77, 4.3, '#D8D2E6', NS)
);
const CANOPY = scallopD(50, 40, 30, 9, 13);
const tree = svg(
  E(50, 88, 24, 4.5, GREEN, 0, ' stroke-width="4"') +
  P('M41 90C45 80 46 70 45 58L55 58C54 70 55 80 59 90Z', BROWN) +
  L('M50 76C53 72 56 70 59 70', 3) +
  shade('tree-s', CANOPY, GREEN, GREEN_D) +
  L('M30 46Q35 41 40 46M54 52Q59 47 64 52M60 30Q65 25 70 30M40 26Q45 21 50 26', 3) +
  hi(34, 24, 8, 4.5)
);

const TAIL = 'M56 84C80 88 94 70 88 50C84 38 74 34 76 24C77 16 86 14 90 20C90 8 74 2 64 12C54 22 62 36 64 48C66 60 60 66 54 68Z';
const squirrel = svg(
  shade('squirrel-t', TAIL, '#FFB866', '#F08A2C', -4, -4) +
  L('M70 30C66 40 74 48 76 58M80 70C74 76 68 78 62 78', 3) +
  shade('squirrel-s', ell(44, 68, 18, 19), '#FF9F43', '#F08A2C', -4, -4) +
  E(43, 72, 10, 12, '#FFF8EE', 0, NS) +
  E(34, 87, 7, 3.8, '#FF9F43', 0, ' stroke-width="3.5"') + E(52, 87, 7, 3.8, '#FF9F43', 0, ' stroke-width="3.5"') +
  P('M28 30L25 12L39 24Z', '#FF9F43') + P('M48 24L56 10L57 30Z', '#FF9F43') +
  P('M29 26L28 18L34 23Z', '#FF8FB8', NS) + P('M51 24L54 18L54 27Z', '#FF8FB8', NS) +
  C(41, 41, 17, '#FF9F43') +
  E(41, 47, 9, 6.5, '#FFF8EE', 0, NS) +
  P('M38 44.5L44 44.5L41 47.5Z', PINK, ' stroke-width="2.5"') + smile(41, 48.5, 2.6, 2.6) +
  eye(34, 39, 3.6) + eye(48, 39, 3.6) + cheek(28, 46, 0.75) + cheek(54, 46, 0.75) +
  hi(32, 30, 5, 2.6) +
  E(43, 67, 6, 7, BROWN, 0, ' stroke-width="3.5"') + P('M36 63C36 57 50 57 50 63Z', '#8B5A3C', ' stroke-width="3.5"') + L('M43 58L44 54', 3) +
  E(35, 66, 4, 3.4, '#FF9F43', -20, ' stroke-width="3"') + E(51, 66, 4, 3.4, '#FF9F43', 20, ' stroke-width="3"')
);

// ---------------------------------------------------------------- export
const DEFS = [
  ['tennis', 'tennis-ball', 'tennis ball', tennisBall], ['tennis', 'racket', 'racket', racket], ['tennis', 'trophy', 'trophy', trophy],
  ['tennis', 'drink', 'drink', drink], ['tennis', 'cap', 'cap', cap], ['tennis', 'sneakers', 'sneakers', sneakers],
  ['tennis', 'medal', 'medal', medal], ['tennis', 'muscle', 'strong', muscle],
  ['pool', 'swimmer', 'swimmer', swimmer], ['pool', 'swimsuit', 'swimsuit', swimsuit], ['pool', 'goggles', 'goggles', goggles],
  ['pool', 'swim-ring', 'swim ring', swimRing], ['pool', 'watermelon', 'watermelon', watermelon], ['pool', 'palm-tree', 'palm tree', palmTree],
  ['golf', 'golf-flag', 'golf flag', golfFlag], ['golf', 'golfer', 'golfer', golfer], ['golf', 'golf-buggy', 'golf buggy', golfBuggy],
  ['golf', 'tree', 'tree', tree], ['golf', 'squirrel', 'squirrel', squirrel],
];

export const STICKERS_ROOMS_B = {};
for (const [theme, id, label, s] of DEFS) STICKERS_ROOMS_B[id] = { theme, label, svg: s };
