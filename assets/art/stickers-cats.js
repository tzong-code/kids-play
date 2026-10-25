// More chunky-toy stickers: the cat friends, Sticker Scenes extras and kitchen items (viewBox 0 0 100 100).
// Same look as stickers.js (thick ink outline inherited from the wrapping <g>); helpers copied so this file stands alone.

const K = '#2B2340'; // ink
const WH = '#FFFFFF';
const SKIN = '#FFD6B5';
const PINK = '#FF8FB8';
const HOT = '#FF5FA8';
const NS = ' stroke="none"';
const n = (v) => +(+v).toFixed(1);

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="${K}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;

const P = (d, fill, x = '') => `<path d="${d}" fill="${fill}"${x}/>`;
const C = (cx, cy, r, fill, x = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${x}/>`;
const E = (cx, cy, rx, ry, fill, rot = 0, x = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${n(cx)} ${n(cy)})"` : ''}${x}/>`;
const L = (d, w = 3.5) => `<path d="${d}" fill="none" stroke-width="${w}"/>`;
// coloured stroke without ink (sprinkles, stripes)
const S = (d, color, w = 3) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
const circ = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;
const ell = (cx, cy, rx, ry) => `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`;

// glossy highlight (top-left, no outline)
const hi = (cx, cy, rx, ry, rot = -35) => E(cx, cy, rx, ry, WH, rot, ' opacity=".45" stroke="none"');
// dot eye with sparkle
const eye = (x, y, r = 3.8) => C(x, y, r, K, NS) + C(x - r * 0.32, y - r * 0.38, r * 0.4, WH, NS);
const cheek = (x, y, s = 1) => E(x, y, 4.6 * s, 3 * s, PINK, 0, ' opacity=".6" stroke="none"');
const smile = (cx, y, w, sw = 3.4) => L(`M${n(cx - w)} ${n(y)}Q${n(cx)} ${n(y + w)} ${n(cx + w)} ${n(y)}`, sw);
const face = (cx, cy, s = 1, gap = 8) =>
  eye(cx - gap * s, cy, 3.8 * s) + eye(cx + gap * s, cy, 3.8 * s) +
  cheek(cx - (gap + 6) * s, cy + 6 * s, s) + cheek(cx + (gap + 6) * s, cy + 6 * s, s) +
  smile(cx, cy + 4.5 * s, 4 * s, Math.max(2.8, 3.4 * s));

// body with soft lower-right shade: fill dark, overlay light copy shifted up-left (clipped), redraw outline
const shade = (id, d, light, dark, dx = -5, dy = -5) =>
  `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>` +
  P(d, dark, NS) + `<g clip-path="url(#${id})">${P(d, light, ` stroke="none" transform="translate(${dx} ${dy})"`)}</g>` + P(d, 'none');
// extra flat detail inside a shape already clipped by shade(id, d, …); outline redrawn on top
const inside = (id, d, body) => `<g clip-path="url(#${id})" stroke="none">${body}</g>` + P(d, 'none');
// outlined tube (stroke-built limb/branch)
const tube = (d, color, w = 9) => `<path d="${d}" fill="none" stroke-width="${w + 9}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
const sparkle = (x, y, s, fill) =>
  P(`M${x} ${n(y - s)}Q${x} ${y} ${n(x + s)} ${y}Q${x} ${y} ${x} ${n(y + s)}Q${x} ${y} ${n(x - s)} ${y}Q${x} ${y} ${x} ${n(y - s)}Z`, fill, ' stroke-width="3"');
const scallopD = (cx, cy, R, k, b, rot = -90) => {
  let d = '';
  for (let i = 0; i <= k; i++) {
    const a = ((rot + (i * 360) / k) * Math.PI) / 180;
    const x = n(cx + R * Math.cos(a)), y = n(cy + R * Math.sin(a));
    d += i ? `A${b} ${b} 0 0 1 ${x} ${y}` : `M${x} ${y}`;
  }
  return d + 'Z';
};
const SPRINKLES = ['#FF6B6B', '#FFC93C', '#4ADE9A', '#4D96FF', '#B78CFF', HOT];
// little sprinkle dashes: [[x, y, dx, dy], …], colours cycle through the rainbow
const sprinkles = (list, w = 3) => list.map(([x, y, dx, dy], i) => S(`M${x} ${y}l${dx} ${dy}`, SPRINKLES[i % SPRINKLES.length], w)).join('');

// ---------------------------------------------------------------- cat friends
// Sitting cat: big head, small body, curled tail. Same head language as the kitten sticker and Carrie's mascot.
const CAT_HEAD = ell(50, 41, 31, 25);
const catBody = (w = 0) => `M${34 - w} 60C${26 - w} 70 ${25 - w} 82 ${30 - w} 89L${70 + w} 89C${75 + w} 82 ${74 + w} 70 ${66 + w} 60Z`;
const catTail = 'M67 83C82 87 92 74 87 60C84 53 78 54 80 60';
// tail bands: butt-capped dashes laid along the tail so they stay inside its fill
const tailBands = (color) => `<path d="${catTail}" fill="none" stroke="${color}" stroke-width="7.5" stroke-linecap="butt" stroke-dasharray="3.5 6" stroke-dashoffset="-4"/>`;
const cat = (id, o) => {
  const body = catBody(o.w || 0);
  const w = o.w || 0;
  return svg(
    tube(catTail, o.tailFur || o.fur, 7.5) + (o.tailMarks || '') +
    shade(`${id}-b`, body, o.fur, o.dark) +
    inside(`${id}-b`, body, E(50, 80, 10 + w * 0.6, 10, o.belly) + (o.bodyMarks || '')) +
    hi(36 - w, 73, 2.4, 4.5, 15) +
    E(41 - w * 0.4, 87.5, 7.5, 4.8, o.pawFur || o.fur) + E(59 + w * 0.4, 87.5, 7.5, 4.8, o.pawFur || o.fur) +
    P('M23 37L21 10L45 24Z', o.earL || o.fur) + P('M77 37L79 10L55 24Z', o.earR || o.fur) +
    P('M27 31L26 17L38 25Z', o.inner || PINK, NS) + P('M73 31L74 17L62 25Z', o.inner || PINK, NS) +
    shade(`${id}-h`, CAT_HEAD, o.fur, o.dark) +
    (o.headMarks ? inside(`${id}-h`, CAT_HEAD, o.headMarks) : '') +
    (o.muzzle ? E(50, 55.5, 11, 7, o.muzzle, 0, NS) : '') +
    hi(33, 28, 6.5, 3.5) +
    (o.neck || '') +
    (o.eyes ?? (eye(38, 46, 4.4) + eye(62, 46, 4.4))) +
    cheek(29.5, 54.5, 0.8) + cheek(70.5, 54.5, 0.8) +
    P('M46.5 50.5L53.5 50.5L50 54.5Z', HOT, ' stroke-width="3"') +
    (o.mouth ?? L('M50 54.5Q47 59 43 56.5M50 54.5Q53 59 57 56.5', 3)) +
    (o.whiskers ?? L('M9 48L22 50.5M9 56L22 55.5M91 48L78 50.5M91 56L78 55.5', 3)) +
    (o.top || '')
  );
};

const catSprinkle = cat('cat-sprinkle', {
  fur: '#FFF8EE', dark: '#EFE3D3', belly: WH,
  headMarks: sprinkles([[30, 36, 3, -2], [44, 22, 2, 3], [57, 24, 3, 1], [70, 35, -2, 3], [24, 46, 3, 1], [76, 45, -3, 2], [36, 25, -2, 2], [64, 29, 3, -1]], 3.2),
  bodyMarks: sprinkles([[33, 70, 3, 2], [64, 72, -2, 3], [41, 80, 3, -1], [60, 82, 2, 2], [50, 74, -3, 1], [35, 82, 2, -3]], 3.2),
  tailMarks: sprinkles([[80, 84, 3, 0], [88, 72, 0, 3], [86, 62, 3, 1]], 2.6),
  neck: P('M50 66L35 59C31 64 31 72 35 75Z', HOT, ' stroke-width="3.5"') + P('M50 66L65 59C69 64 69 72 65 75Z', HOT, ' stroke-width="3.5"') +
    L('M45 65L37 63M55 65L63 63', 2.5) + C(50, 66.5, 4.6, PINK, ' stroke-width="3.5"') + hi(36, 63, 2, 1.2, -20),
});

const ORANGE_STRIPE = '#E0751E';
const catButton = cat('cat-button', {
  fur: '#FF9F43', dark: '#F08A2C', belly: '#FFF8EE', muzzle: '#FFF8EE',
  headMarks: S('M22 40L30 41M21 47L28 47M78 40L70 41M79 47L72 47', ORANGE_STRIPE, 3.6),
  bodyMarks: S('M27 68L35 70M25 76L33 77M73 68L65 70M75 76L67 77', ORANGE_STRIPE, 3.6),
  tailMarks: tailBands(ORANGE_STRIPE),
  top: L('M44 20L46 28M50 18L50 27M56 20L54 28', 3.2),
  neck: P('M30 62Q50 74 70 62L70 68.5Q50 80 30 68.5Z', '#FF6B6B', ' stroke-width="3.5"') +
    C(50, 75, 9.5, '#4D96FF', ' stroke-width="4"') + C(50, 75, 5.5, '#3A7FE6', NS) +
    C(47.6, 72.6, 1.4, K, NS) + C(52.4, 72.6, 1.4, K, NS) + C(47.6, 77.4, 1.4, K, NS) + C(52.4, 77.4, 1.4, K, NS) +
    hi(45, 70, 2.8, 1.6),
});

const catWhisker = cat('cat-whisker', {
  fur: '#B9BDCE', dark: '#A0A5BA', belly: '#F2F3F8', muzzle: '#F2F3F8',
  headMarks: P('M40 16C44 24 56 24 60 16Z', '#A0A5BA'),
  whiskers: L('M5 45L23 50M4 54L22 55M95 45L77 50M96 54L78 55', 3),
  top: P('M31 25C26 7 74 7 69 25Z', '#3B5BA9') +
    P('M31 22Q50 28 69 22L69 26Q50 32 31 26Z', '#FFC93C', ' stroke-width="3"') +
    P('M29 26Q50 33 71 26L73 30Q50 39 27 30Z', K) +
    C(50, 16.5, 3.6, '#FFC93C', ' stroke-width="2.6"') + C(50, 16.5, 1.2, WH, NS) +
    hi(38, 15, 4.5, 2.2, -20),
});

const BROWN = '#9B6240';
const catPudding = cat('cat-pudding', {
  w: 6, fur: '#FFF3DE', dark: '#F2DFC2', belly: WH, earL: '#FF9F43', earR: BROWN,
  headMarks: P('M14 24C24 22 36 26 40 36C42 46 30 52 18 50Z', '#FF9F43') + P('M60 18C70 22 76 30 76 38C70 42 62 38 60 30Z', BROWN) +
    P('M78 40C84 44 84 52 80 56L74 52Z', '#FF9F43'),
  bodyMarks: P('M18 60C30 60 38 68 36 78C30 84 20 82 18 76Z', BROWN) + P('M64 72C72 68 82 72 82 82L66 90C62 84 60 78 64 72Z', '#FF9F43'),
  tailFur: '#FF9F43',
  tailMarks: tailBands(BROWN),
  eyes: L('M32 47Q38 41 44 47M56 47Q62 41 68 47', 3.6),
  mouth: P('M43.5 56.5Q50 54 56.5 56.5Q55 63 50 63Q45 63 43.5 56.5Z', '#FF6B6B', ' stroke-width="3"') + E(50, 60.5, 3, 1.6, PINK, 0, NS),
});

const catMochi = cat('cat-mochi', {
  fur: '#4D4466', dark: '#3F3756', belly: '#5E5579', muzzle: '#6F6690', inner: '#FF8FB8',
  eyes: [38, 62].map((x) => C(x, 45, 7.6, '#FFE07A', ' stroke-width="3"') + C(x + 0.5, 46, 4.9, K, NS) +
    C(x - 1.8, 43.2, 2.2, WH, NS) + C(x + 2.6, 48.4, 1.1, WH, NS)).join(''),
  whiskers: L('M7 48L19 50M7 56L19 55.5M93 48L81 50M93 56L81 55.5', 3),
  neck: P('M58 68L60 87L70 85L68 66Z', '#B78CFF', ' stroke-width="4"') + S('M60 76L69 75M60.5 82L69.5 80.5', '#E3D6FF', 2.8) +
    P('M29 61Q50 74 71 61L71 68Q50 81 29 68Z', '#B78CFF', ' stroke-width="4"') + S('M40 68Q50 72.5 60 68', '#E3D6FF', 2.8) +
    hi(35, 65, 3, 1.4, 15),
});

const PAW_PADS = [[50, 61, 26], [24, 37, 11.5], [41, 23, 11.5], [59, 23, 11.5], [76, 37, 11.5]];
const paw = svg(
  PAW_PADS.map(([x, y, r]) => C(x, y, r, WH, ' stroke-width="9"')).join('') +
  `<defs><clipPath id="paw-c">${PAW_PADS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</clipPath></defs>` +
  PAW_PADS.map(([x, y, r]) => C(x, y, r, '#F3ECF8', NS)).join('') +
  `<g clip-path="url(#paw-c)">${PAW_PADS.map(([x, y, r]) => C(x - 3, y - 3, r, WH, NS)).join('')}</g>` +
  [[25, 39], [41.5, 25.5], [58.5, 25.5], [75, 39]].map(([x, y]) => E(x, y, 6, 7, PINK, 0, ' stroke-width="3.5"')).join('') +
  P('M50 52C58 52 68 61 68 69C68 76 61 77 57 75C54 73.5 46 73.5 43 75C39 77 32 76 32 69C32 61 42 52 50 52Z', PINK, ' stroke-width="3.5"') +
  hi(42, 58, 4.5, 2.5) + hi(23, 35, 1.6, 2.6, 0) + hi(39.5, 22, 1.6, 2.6, 0) + hi(56.5, 22, 1.6, 2.6, 0) + hi(73, 35, 1.6, 2.6, 0) +
  hi(32, 50, 4, 7, 30)
);

// ---------------------------------------------------------------- sticker scenes extras
const prince = svg(
  P('M33 62C22 70 15 82 15 90L85 90C85 82 78 70 67 62Z', '#FF6B6B') +
  shade('prince-s', 'M39 54L61 54C62 59 65 62 69 64C75 68 77 80 76 90L24 90C23 80 25 68 31 64C35 62 38 59 39 54Z', '#4D96FF', '#3A7FE6') +
  P('M24.5 75L75.5 75L76 82L24 82Z', '#FFC93C', ' stroke-width="3.5"') + P('M45 74h10v9h-10z', '#FF9F43', ' stroke-width="3"') +
  P('M41 57L50 66L59 57Z', WH, ' stroke-width="3"') + C(50, 70, 1.8, '#FFC93C', NS) + C(50, 88, 1.8, '#FFC93C', NS) +
  C(32, 66, 6.5, '#FFC93C', ' stroke-width="3.5"') + C(68, 66, 6.5, '#FFC93C', ' stroke-width="3.5"') +
  hi(31, 80, 2.4, 4.5, 20) +
  P(ell(50, 34, 20.5, 17), '#8B5A3C') +
  C(50, 38, 18, SKIN) +
  P('M31 40C30 22 39 18 50 18C61 18 70 22 69 40C67 33 62 29 56 29C53 33 46 34 42 31C37 32 33 35 31 40Z', '#8B5A3C', NS) +
  L('M33 36C36 32 39 31 42 31C46 34 53 33 56 29C61 29 65 31 67.5 35', 3.5) +
  P('M37 23L35 9L43 15L50 6L57 15L65 9L63 23Z', '#FFC93C', ' stroke-width="4"') + C(50, 17, 2.8, '#4D96FF', NS) +
  hi(41, 13, 1.5, 3, 10) +
  face(50, 43, 0.9, 7)
);

const rose = svg(
  tube('M50 60C50 72 48 80 50 92', '#3CC47C', 5) +
  P('M49 78C38 70 24 72 18 80C28 88 42 88 49 78Z', '#3CC47C') + P('M51 70C60 60 76 60 82 66C76 76 60 78 51 70Z', '#3CC47C') +
  L('M24 80Q36 79 47 78M76 67Q65 68 54 70', 2.6) +
  shade('rose-s', 'M24 34C20 16 34 8 42 14C46 8 56 8 60 14C68 8 82 16 76 34C76 52 66 64 50 64C34 64 24 52 24 34Z', '#FF6B6B', '#E84F52') +
  L('M28 32C30 48 40 56 50 56C60 56 70 48 72 32', 3.2) +
  L('M36 26C36 40 44 46 52 46C60 46 66 38 64 28', 3.2) +
  P('M44 30C44 22 58 20 58 28C58 34 50 36 48 32C46 28 52 26 53 29', '#E84F52', ' stroke-width="3.2"') +
  hi(32, 30, 3, 6, 10)
);

const HORSE = '#E8A06A', HORSE_D = '#D2864E', MANE = '#8B5A3C';
const horse = svg(
  P('M77 52C88 48 96 60 92 76C90 82 84 84 82 80C84 72 82 64 76 60Z', MANE) +
  tube('M70 64L72 84', HORSE_D, 7) + tube('M44 66L44 84', HORSE_D, 7) +
  tube('M64 66L63 84', HORSE, 7) + tube('M37 64L35 84', HORSE, 7) +
  P('M30 82h11v7h-11zM39 82h10v7h-10zM58 82h10v7h-10zM67 82h10v7h-10z', MANE, ' stroke-width="3.5"') +
  P('M26 46L42 38C44 48 48 52 54 54L40 64C34 60 30 54 26 46Z', HORSE) +
  shade('horse-b', ell(57, 56, 24, 14), HORSE, HORSE_D) +
  hi(48, 47, 7, 3, -10) +
  P('M25 22L28 9L37 19Z', HORSE) + P('M28 19L29.5 13L33.5 18Z', PINK, NS) +
  shade('horse-h', 'M12 42C10 30 18 20 30 20C42 20 48 28 48 38C48 46 44 50 38 52L26 54C16 54 13 48 12 42Z', HORSE, HORSE_D, -4, -4) +
  E(20, 46, 10, 7.5, '#FFE3C8', 0, ' stroke-width="3.5"') + E(14.5, 44, 1.3, 2.2, K, -20, NS) +
  L('M13 50Q18 53 23 50.5', 2.8) +
  P('M38 20C48 18 56 26 52 34C58 38 58 46 54 50C50 46 46 40 44 32C42 28 40 24 38 20Z', MANE) +
  P('M24 22C22 16 30 13 36 17C38 21 34 26 28 27C28 24 26 23 24 22Z', MANE, ' stroke-width="3.5"') +
  hi(20, 30, 4, 2.4) +
  eye(33, 36, 4.4) + cheek(39, 44, 0.8)
);

// layered strawberry cake slice: wedge tip on the left, cut face showing sponge / cream / strawberry layers
const CAKE_CUT = 'M10 54L90 40L90 74L10 86Z';
const CAKE_ALL = 'M10 54L64 30C74 28 86 32 90 40L90 74L10 86Z';
const cakeBand = (t0, t1) => `M10 ${n(54 + 32 * t0)}L90 ${n(40 + 34 * t0)}L90 ${n(40 + 34 * t1)}L10 ${n(54 + 32 * t1)}Z`;
const cake = svg(
  P(CAKE_ALL, '#FFE07A', NS) +
  `<defs><clipPath id="cake-c"><path d="${CAKE_CUT}"/></clipPath></defs>` +
  `<g clip-path="url(#cake-c)" stroke="none">${P(cakeBand(0.3, 0.52), '#FFF8EE')}${P(cakeBand(0.82, 1), '#F2C94C')}` +
  [[22, 69], [40, 65.5], [58, 62.5], [76, 59.5]].map(([x, y]) => E(x, y, 6, 3.6, '#FF6B6B', -9) + E(x, y - 0.6, 3, 1.4, '#FFB3B3', -9)).join('') + `</g>` +
  P('M10 54L64 30C74 28 86 32 90 40L90 47C86 50 84 45 80 47C78 54 74 54 72 49C68 51 66 56 62 52C58 56 54 51 50 55C47 62 43 62 42 57C38 60 34 58 32 58C28 62 25 64 23 59C19 61 14 61 10 60Z', PINK, NS) +
  P('M10 54L64 30C74 28 86 32 90 40Z', '#FFB8D2', NS) +
  L('M10 54L90 40', 3) +
  P(CAKE_ALL, 'none') +
  C(69, 32, 6.5, '#FFF8EE', ' stroke-width="3.5"') +
  P('M70 30C64 30 60 22 66 18C68 17 72 17 74 18C80 22 76 30 70 30Z', '#FF6B6B', ' stroke-width="3.5"') +
  P('M64 18L70 14L76 18L70 20Z', '#3CC47C', ' stroke-width="3"') +
  E(67, 22, 1, 1.4, '#FFE07A', 0, NS) + E(72, 24, 1, 1.4, '#FFE07A', 0, NS) +
  hi(36, 46, 7, 2.2, -22)
);

const SHARK = 'M8 58C10 44 28 36 50 36C64 36 76 42 82 48L92 34C96 46 96 60 92 72L82 62C74 70 60 76 44 76C24 76 8 70 8 58Z';
const shark = svg(
  P('M38 39L50 15C57 21 62 30 62 39Z', '#4F8FE0') +
  shade('shark-s', SHARK, '#6AA8F2', '#4F8FE0') +
  inside('shark-s', SHARK, P('M4 60C18 72 46 76 74 64L80 82L4 82Z', '#EAF4FF')) +
  P('M46 62C49 70 46 79 38 84C37 76 38 70 40 64Z', '#4F8FE0', ' stroke-width="3.5"') +
  L('M58 50Q56 55 58 60M64 49Q62 54 64 59', 2.8) +
  hi(36, 42, 10, 3.5, -10) +
  eye(28, 50, 4.6) + cheek(32, 60, 0.9) +
  P('M10 60Q18 68 28 63Q20 64 10 60Z', K, ' stroke-width="3"') +
  P('M15 62.5L17 66L19 63.8Z', WH, NS) + P('M21 64L23 66.5L24.5 63.6Z', WH, NS)
);

const BUBBLES = [[38, 60, 25], [72, 32, 15], [75, 72, 10]];
const bubbles = svg(
  BUBBLES.map(([x, y, r], i) =>
    shade(`bubbles-${i}`, circ(x, y, r), '#DDF6FD', '#E3D6FF', -r * 0.22, -r * 0.22) +
    S(`M${n(x - r * 0.62)} ${n(y + r * 0.2)}A${n(r * 0.66)} ${n(r * 0.66)} 0 0 1 ${n(x - r * 0.2)} ${n(y - r * 0.62)}`, WH, n(Math.max(2.4, r * 0.16))) +
    C(x + r * 0.42, y - r * 0.44, r * 0.13, WH, NS)).join('') +
  sparkle(18, 22, 6, WH) + sparkle(90, 54, 4.5, '#FFE07A')
);

const SQUID_LEGS = ['M38 58C34 70 26 74 22 70', 'M44 60C42 72 38 80 33 82', 'M50 60C50 72 49 80 47 86', 'M56 60C58 72 62 80 67 82', 'M62 58C66 70 74 74 78 70'];
const SQUID = 'M50 8C62 16 70 32 68 56C68 62 60 64 50 64C40 64 32 62 32 56C30 32 38 16 50 8Z';
const squid = svg(
  tube('M40 58C32 78 20 86 13 78', PINK, 5.5) + tube('M60 58C68 78 80 86 87 78', PINK, 5.5) +
  SQUID_LEGS.map((d) => tube(d, PINK, 7.5)).join('') +
  P('M38 20L20 32L34 42Z', '#FF6FA0') + P('M62 20L80 32L66 42Z', '#FF6FA0') +
  shade('squid-s', SQUID, PINK, '#FF6FA0') +
  C(50, 26, 3, '#FFB8D2', NS) + C(42, 34, 2.2, '#FFB8D2', NS) + C(58, 34, 2.2, '#FFB8D2', NS) +
  hi(42, 22, 3.5, 6.5, 20) +
  face(50, 46, 0.95, 7.5)
);

const HEART = 'M50 86C20 66 10 50 12 34C14 20 26 14 36 16C44 18 48 24 50 28C52 24 56 18 64 16C74 14 86 20 88 34C90 50 80 66 50 86Z';
const blueHeart = svg(
  shade('blue-heart-s', HEART, '#4D96FF', '#3A7FE6') +
  hi(28, 30, 8, 4.5) + C(22, 42, 2.4, WH, ' opacity=".6" stroke="none"') +
  sparkle(80, 22, 7, WH)
);

// ---------------------------------------------------------------- kitchen
const COOKIE = scallopD(50, 51, 39, 14, 15);
const cookie = svg(
  shade('cookie-s', COOKIE, '#F2BE7A', '#DFA05C') +
  [[34, 34, 20], [56, 30, -15], [70, 46, 30], [42, 54, 0], [62, 64, 45], [30, 66, -30], [48, 76, 15], [72, 72, -10]]
    .map(([x, y, r]) => P(`M${x - 4} ${y + 2}C${x - 4} ${y - 4} ${x + 4} ${y - 4} ${x + 4} ${y + 2}C${x + 2} ${y + 4} ${x - 2} ${y + 4} ${x - 4} ${y + 2}Z`, '#7A4A2E', ` stroke-width="2.5" transform="rotate(${r} ${x} ${y})"`)).join('') +
  C(46, 40, 1.4, '#C98A4A', NS) + C(60, 52, 1.4, '#C98A4A', NS) + C(38, 70, 1.4, '#C98A4A', NS) +
  hi(30, 26, 8, 4)
);

const milk = svg(
  P('M24 44L42 26L60 44Z', '#F0F2FA') +
  P('M42 26L64 18L80 36L60 44Z', '#D6E2F5') +
  P('M40 27L41 15L63 8L64 19Z', '#F0F2FA', ' stroke-width="4"') +
  P('M60 44L80 36L80 82L60 90Z', '#C8D8F2') +
  shade('milk-s', 'M24 44L60 44L60 90L24 90Z', WH, '#EEF1F8', -3, -3) +
  P('M24 56L60 56L60 78L24 78Z', '#4D96FF', ' stroke-width="3.5"') + P('M60 56L80 50L80 70L60 78Z', '#3A7FE6', ' stroke-width="3.5"') +
  P('M42 59C46 65 48 68 48 71C48 74 45 76 42 76C39 76 36 74 36 71C36 68 38 65 42 59Z', WH, ' stroke-width="3"') +
  P('M24 44L60 44L60 90L24 90Z', 'none') +
  hi(31, 49, 2.5, 3.5, 0) + hi(31, 84, 2, 3, 0)
);

const DOUGH_O = 38, DOUGH_I = 10, DCX = 50, DCY = 51;
const ring = (R, r) => circ(DCX, DCY, R) + circ(DCX, DCY, r);
const FROST = scallopD(DCX, DCY, 27.5, 12, 8.5) + circ(DCX, DCY, 16);
const doughnut = svg(
  `<defs><clipPath id="doughnut-c"><path d="${ring(DOUGH_O, DOUGH_I)}" clip-rule="evenodd"/></clipPath></defs>` +
  P(ring(DOUGH_O, DOUGH_I), '#D99A55', ' fill-rule="evenodd" stroke="none"') +
  `<g clip-path="url(#doughnut-c)">${P(ring(DOUGH_O, DOUGH_I), '#F2BE7A', ' fill-rule="evenodd" stroke="none" transform="translate(-4 -4)"')}</g>` +
  P(FROST, PINK, ' fill-rule="evenodd" stroke-width="3.5"') +
  sprinkles([[36, 33, 3, 3], [51, 28, 4, 0], [65, 34, -2, 4], [71, 49, 0, 4], [66, 64, -3, 3], [49, 72, 4, 0], [34, 67, 3, -3], [28, 49, 0, 4]], 3.2) +
  P(ring(DOUGH_O, DOUGH_I), 'none', ' fill-rule="evenodd"') +
  hi(32, 30, 7, 3.5)
);

// swirl lollipop: pink disc with a white spiral stripe
const spiral = (() => {
  let d = '';
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 5.2;
    const r = 1 + 4.8 * t;
    d += `${i ? 'L' : 'M'}${n(50 + r * Math.cos(t))} ${n(37 + r * Math.sin(t))}`;
  }
  return d;
})();
const lollipop = svg(
  tube('M50 60L50 90', '#FFF8EE', 5.5) +
  shade('lollipop-s', circ(50, 37, 28), HOT, '#E8449A') +
  inside('lollipop-s', circ(50, 37, 28), S(spiral, '#FFF8EE', 6.5)) +
  P('M50 70L40 64C37 68 37 74 40 77Z', '#7FD8F0', ' stroke-width="3.5"') + P('M50 70L60 64C63 68 63 74 60 77Z', '#7FD8F0', ' stroke-width="3.5"') +
  C(50, 70.5, 3.8, '#22B8CF', ' stroke-width="3"') +
  hi(37, 24, 7, 3.5)
);

const dripD = (() => {
  // frosting cap: top ellipse plus drips over the front edge
  const xs = [18, 26, 34, 42, 50, 58, 66, 74, 82];
  const len = [6, 12, 7, 14, 8, 13, 6, 11, 6];
  let d = 'M18 50C18 38 82 38 82 50';
  for (let i = xs.length - 1; i > 0; i--) {
    const x1 = xs[i], x0 = xs[i - 1], m = (x0 + x1) / 2, yb = 50 + len[i];
    d += `L${x1} ${yb}C${x1} ${yb + 4} ${m + 1} ${yb + 4} ${m + 1} ${yb}C${m + 1} ${yb - 3} ${x0} ${50 + len[i - 1] - 2} ${x0} ${50 + len[i - 1]}`;
  }
  return d + 'Z';
})();
const CAKE_BODY = 'M18 50L18 80C18 88 82 88 82 80L82 50Z';
const CANDLES = [[34, '#4D96FF'], [50, '#FFC93C'], [66, '#4ADE9A']];
const birthdayCake = svg(
  P(ell(50, 85, 42, 7), '#7FD8F0') +
  shade('birthday-cake-s', CAKE_BODY, '#FFF3DE', '#F2DFC2', -4, 0) +
  [[26, 74], [38, 78], [50, 79], [62, 78], [74, 74], [32, 66], [56, 68]].map(([x, y], i) => C(x, y, 2.4, SPRINKLES[i % 6], NS)).join('') +
  P(dripD, PINK, ' stroke-width="3.5"') +
  CANDLES.map(([x, c]) => P(`M${x - 3.5} 46V26h7v20Z`, c, ' stroke-width="3.5"') + S(`M${x - 3.5} 33l7 -3M${x - 3.5} 41l7 -3`, WH, 2.4) +
    L(`M${x} 26v-3`, 2.5) + P(`M${x} 9C${x + 6} 15 ${x + 5} 22 ${x} 22C${x - 5} 22 ${x - 6} 15 ${x} 9Z`, '#FF9F43', ' stroke-width="3"') +
    E(x, 18, 1.8, 2.6, '#FFE07A', 0, NS)).join('') +
  hi(26, 46, 4, 1.8, -10) + hi(24, 64, 1.8, 3.5, 0)
);

const CANDY = circ(50, 50, 20);
const candy = svg(
  P('M33 44L13 30C17 42 17 58 13 70L33 56Z', '#FFC93C') + P('M67 44L87 30C83 42 83 58 87 70L67 56Z', '#FFC93C') +
  L('M28 46L18 38M28 54L18 62M72 46L82 38M72 54L82 62', 2.8) +
  shade('candy-s', CANDY, '#FF6B6B', '#E84F52', -4, -4) +
  inside('candy-s', CANDY, S('M22 60L50 26M30 76L64 34M46 80L76 44', WH, 6)) +
  hi(41, 39, 6, 3)
);

const TEAPOT = 'M22 62C22 44 34 38 50 38C66 38 78 44 78 62C78 78 66 86 50 86C34 86 22 78 22 62Z';
const teapot = svg(
  tube('M76 50C92 46 94 74 76 74', PINK, 6) +
  P('M26 62C16 60 12 48 8 34L15 31C18 42 22 48 30 50Z', PINK) +
  shade('teapot-s', TEAPOT, PINK, '#FF6FA0') +
  P('M30 40C30 28 70 28 70 40Z', HOT) + C(50, 25, 5.5, HOT) +
  P(ell(50, 40, 22, 4.5), '#FF6FA0', ' stroke-width="4"') +
  P('M36 84L64 84L62 90L38 90Z', HOT, ' stroke-width="3.5"') +
  C(32, 74, 2.2, WH, NS) + C(68, 74, 2.2, WH, NS) + C(50, 80, 2.2, WH, NS) + C(30, 56, 1.8, WH, NS) + C(70, 56, 1.8, WH, NS) +
  hi(33, 49, 6.5, 3.5) + hi(40, 33, 3, 1.5, -15) +
  face(50, 61, 0.9, 8)
);

// ---------------------------------------------------------------- export
const DEFS = [
  ['cats', 'cat-sprinkle', 'Sprinkle', catSprinkle], ['cats', 'cat-button', 'Button', catButton],
  ['cats', 'cat-whisker', 'Captain Whisker', catWhisker], ['cats', 'cat-pudding', 'Pudding', catPudding],
  ['cats', 'cat-mochi', 'Mochi', catMochi], ['cats', 'paw', 'paw print', paw],
  ['scene', 'prince', 'prince', prince], ['scene', 'rose', 'rose', rose], ['scene', 'horse', 'horse', horse],
  ['scene', 'cake', 'cake', cake], ['scene', 'shark', 'shark', shark], ['scene', 'bubbles', 'bubbles', bubbles],
  ['scene', 'squid', 'squid', squid], ['scene', 'blue-heart', 'blue heart', blueHeart],
  ['kitchen', 'cookie', 'cookie', cookie], ['kitchen', 'milk', 'milk', milk], ['kitchen', 'doughnut', 'doughnut', doughnut],
  ['kitchen', 'lollipop', 'lollipop', lollipop], ['kitchen', 'birthday-cake', 'birthday cake', birthdayCake],
  ['kitchen', 'candy', 'candy', candy], ['kitchen', 'teapot', 'teapot', teapot],
];

export const STICKERS_CATS = {};
for (const [theme, id, label, s] of DEFS) STICKERS_CATS[id] = { theme, label, svg: s };
