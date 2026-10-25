// Sticker set: chunky-toy cartoon SVGs (viewBox 0 0 100 100), stamped onto drawings and shown in the sticker tray.
// Every shape carries a thick ink outline (inherited from the wrapping <g>); helpers below keep the markup short.

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
// small cloud centred on (0,0), ~84 wide x 60 tall at s=1
const CLOUD = 'M-26 27C-38 27 -42 15 -36 7C-40 -5 -28 -15 -16 -9C-12 -23 8 -27 16 -13C28 -17 40 -7 36 5C44 11 42 27 28 27Z';
const miniCloud = (x, y, s) => G(`translate(${x} ${y}) scale(${s})`, P(CLOUD, WH, ` stroke-width="${n(4.5 / s)}"`));

// ---------------------------------------------------------------- mermaid world
const mermaid = svg(G('translate(-4 0)',
  P('M14 38C10 5 78 3 74 38C76 54 71 66 64 73L24 73C17 64 12 52 14 38Z', '#FF8A7A') +
  P('M34 48L54 48L56 64L32 64Z', SKIN) +
  P('M35 59a4.6 4.6 0 0 1 9.2 0ZM44 59a4.6 4.6 0 0 1 9.2 0Z', '#B78CFF', ' stroke-width="3"') +
  P('M67 81C73 69 85 64 93 65C89 73 85 78 79 82C85 84 90 89 91 93C81 95 71 91 67 81Z', '#7FD8F0') +
  shade('mermaid-s', 'M32 62C29 80 44 91 66 85L74 81C60 81 54 73 56 62Z', '#22B8CF', '#1A9CB0', -4, -4) +
  L('M39 70q3.5 3.5 7 0M47 77q3.5 3.5 7 0', 3) + hi(37, 70, 2.5, 5, -10) +
  C(44, 32, 19, SKIN) +
  P('M22 39C20 15 33 9 44 9C56 9 68 15 66 39C61 30 54 25 47 26C39 25 29 30 22 39Z', '#FF8A7A', NS) +
  L('M25.5 34.5C31 28.5 39 25.5 47 26C54 25.5 59.5 28.5 62.5 33', 3.5) + hi(29, 20, 6, 3, -35) +
  face(44, 38, 0.95, 7) +
  P(starD(61, 15, 8, 3.6), '#FFC93C', ' stroke-width="3.5"')
));

const fish = svg(
  P('M70 52L90 33C95 45 95 59 90 71Z', '#FFC93C') +
  P('M34 32C40 18 56 18 62 31Z', '#FFC93C') +
  shade('fish-s', ell(46, 52, 30, 23), '#4D96FF', '#3A7FE6') +
  P('M47 55C55 52 62 58 58 65C53 63 49 60 47 55Z', '#FFC93C', ' stroke-width="3.5"') +
  hi(40, 39, 9, 4.5, -15) +
  eye(32, 47, 4.6) + cheek(31, 57) + L('M18 55Q22 59 26 55', 3.4)
);

const tropicalFish = svg(
  P('M72 50L91 34C96 46 96 54 91 66Z', '#FF9F43') +
  P('M38 33C44 20 60 20 66 33Z', '#FF9F43') + P('M44 68C48 78 58 80 62 68Z', '#FF9F43') +
  `<defs><clipPath id="tropical-fish-c"><path d="${ell(47, 50, 30, 21)}"/></clipPath></defs>` +
  P(ell(47, 50, 30, 21), '#FF9F43', NS) +
  `<g clip-path="url(#tropical-fish-c)">` +
  P(ell(52, 55, 30, 21), '#F07F22', NS) +
  P('M36 20C31 36 31 64 36 80L45 80C40 64 40 36 45 20Z', WH, ' stroke-width="3.5"') +
  P('M58 20C54 36 54 64 58 80L65 80C61 64 61 36 65 20Z', WH, ' stroke-width="3.5"') + `</g>` +
  P(ell(47, 50, 30, 21), 'none') +
  hi(28, 39, 5, 3, -25) +
  eye(27, 46, 4.4) + cheek(27, 56) + L('M17 52Q20 56 24 53', 3.2)
);

const pufferSpikes = [-120, -90, -60, -30, 30, 60, 90, 120, 150, 180, 210].map((a) => {
  const pt = (deg, r) => { const t = (deg * Math.PI) / 180; return `${n(46 + r * Math.cos(t))} ${n(52 + r * Math.sin(t))}`; };
  return `M${pt(a - 8, 28)}L${pt(a, 39)}L${pt(a + 8, 28)}Z`;
}).join('');
const pufferfish = svg(
  P(pufferSpikes, '#FFF8EE', ' stroke-width="3.5"') +
  P('M72 52L90 38C95 46 95 58 90 66Z', '#FFC93C') +
  shade('pufferfish-s', circ(46, 52, 30), '#7FD8F0', '#5CC4E2') +
  `<defs><clipPath id="pufferfish-b"><path d="${circ(46, 52, 30)}"/></clipPath></defs>` +
  `<g clip-path="url(#pufferfish-b)">${P(ell(44, 82, 30, 17), '#FFF8EE', ' stroke-width="3"')}</g>` + P(circ(46, 52, 30), 'none') +
  C(26, 44, 2.2, '#22B8CF', NS) + C(64, 40, 2.6, '#22B8CF', NS) + C(60, 30, 1.8, '#22B8CF', NS) + C(32, 30, 2, '#22B8CF', NS) +
  P('M62 58C70 54 76 60 72 66C68 66 64 62 62 58Z', '#FFC93C', ' stroke-width="3.5"') +
  hi(34, 34, 8, 4.5) +
  eye(36, 48, 4.4) + eye(54, 48, 4.4) + cheek(29, 57) + cheek(61, 57) +
  P(ell(45, 61, 4.2, 3.4), '#FF8A7A', ' stroke-width="3"')
);

const octopusLegs = [
  'M28 56C24 66 18 70 14 64', 'M36 60C34 74 28 82 21 81', 'M46 62C45 76 42 85 36 88',
  'M54 62C55 76 58 85 64 88', 'M64 60C66 74 72 82 79 81', 'M72 56C76 66 82 70 86 64',
];
const octopus = svg(
  octopusLegs.map((d) => tube(d, '#B78CFF', 9)).join('') +
  shade('octopus-s', 'M20 56C20 30 32 14 50 14C68 14 80 30 80 56C80 64 70 66 50 66C30 66 20 64 20 56Z', '#B78CFF', '#9B6FF0') +
  C(66, 28, 3, '#9B6FF0', NS) + C(72, 38, 2.2, '#9B6FF0', NS) + C(30, 30, 2.4, '#9B6FF0', NS) +
  hi(36, 26, 8, 4.5) + face(50, 44, 1.1) +
  [[22, 74], [31, 79], [41, 80], [59, 80], [69, 79], [78, 74]].map(([x, y]) => C(x, y, 1.8, '#E6D6FF', NS)).join('')
);

const crab = svg(
  ['M26 60L11 54', 'M25 68L10 70', 'M28 76L15 84', 'M74 60L89 54', 'M75 68L90 70', 'M72 76L85 84'].map((d) => tube(d, '#FF6B6B', 5)).join('') +
  tube('M34 50L23 34', '#FF6B6B', 6) + tube('M66 50L77 34', '#FF6B6B', 6) +
  P('M17 16L21 26L30 19A11.5 11.5 0 1 1 17 16Z', '#FF6B6B') +
  P('M83 16L79 26L70 19A11.5 11.5 0 1 0 83 16Z', '#FF6B6B') +
  L('M42 48L40 36', 4.5) + L('M58 48L60 36', 4.5) +
  shade('crab-s', ell(50, 63, 30, 20), '#FF6B6B', '#E84F52') +
  C(40, 33, 6.5, WH) + C(60, 33, 6.5, WH) + eye(40.5, 33.5, 3.4) + eye(60.5, 33.5, 3.4) +
  hi(36, 53, 7, 3.5, -15) +
  cheek(36, 68) + cheek(64, 68) + smile(50, 64, 6)
);

const SHELL = 'M50 82L14 48A10.5 10.5 0 0 1 22 30A10.5 10.5 0 0 1 36 18A10.5 10.5 0 0 1 50 14A10.5 10.5 0 0 1 64 18A10.5 10.5 0 0 1 78 30A10.5 10.5 0 0 1 86 48Z';
const shell = svg(
  P('M40 74L60 74L65 88L35 88Z', '#FF5FA8') +
  shade('shell-s', SHELL, '#FF8FB8', '#FF6FA0') +
  L('M50 80L22 34M50 80L35 22M50 80L50 18M50 80L65 22M50 80L78 34', 3.2) +
  hi(31, 32, 5, 3)
);

const whale = svg(
  P('M42 30C42 22 36 18 30 18C34 13 40 14 44 20C48 14 54 13 58 18C52 18 46 22 46 30Z', '#7FD8F0', ' stroke-width="3.5"') +
  shade('whale-s', 'M12 58C12 38 30 30 48 30C66 30 76 42 78 52C80 46 84 40 90 36C93 44 91 52 86 57C90 61 92 67 90 73C84 71 80 67 77 63C72 76 58 84 44 84C24 84 12 74 12 58Z', '#4D96FF', '#3A7FE6') +
  P('M16 68C26 80 52 84 68 74C56 78 30 78 16 68Z', '#FFF8EE', ' stroke-width="3.5"') +
  hi(32, 39, 10, 4.5, -15) +
  eye(30, 52, 4.4) + cheek(38, 61) + L('M17 61Q26 67 34 62', 3.4)
);

const DOLPHIN = 'M7 58C9 53 15 51 21 50C23 36 37 24 55 24C73 24 85 38 86 54L93 60C89 66 83 68 78 65L76 76C71 70 70 64 72 58C67 53 61 51 53 52C43 53 35 57 29 61C23 65 12 65 7 58Z';
const dolphin = svg(
  P('M50 27L57 10C64 14 68 21 68 28Z', '#22B8CF') +
  `<defs><clipPath id="dolphin-c"><path d="${DOLPHIN}"/></clipPath></defs>` +
  P(DOLPHIN, '#1A9CB0', NS) +
  `<g clip-path="url(#dolphin-c)" stroke="none">${P(DOLPHIN, '#22B8CF', ' transform="translate(-3 -5)"')}${P(ell(34, 68, 30, 10), '#D6F4FB')}</g>` +
  P(DOLPHIN, 'none') +
  P('M48 53C48 61 43 67 35 68C38 61 42 56 48 53Z', '#1A9CB0', ' stroke-width="3.5"') +
  hi(48, 32, 10, 4, -15) +
  eye(30, 43, 4.2) + cheek(33, 51, 0.8) + L('M10 59Q17 60 23 56', 3)
);

const turtle = svg(
  E(24, 74, 9, 8, '#4ADE9A') + E(62, 74, 9, 8, '#4ADE9A') + P('M12 64L5 68L13 70Z', '#4ADE9A', ' stroke-width="3.5"') +
  shade('turtle-s', 'M12 66C12 40 26 26 46 26C66 26 78 40 78 66Z', '#3CC47C', '#2FA866') +
  P('M37 38L55 38L61 51L55 62L37 62L31 51Z', '#2FA866', ' stroke-width="3"') +
  L('M37 38L30 30M55 38L62 30M31 51L16 54M61 51L76 54M37 62L34 66M55 62L58 66', 3) +
  P('M8 66L82 66C82 72 79 74 75 74L15 74C11 74 8 72 8 66Z', '#4ADE9A') +
  hi(28, 38, 7, 4) +
  C(82, 52, 12, '#4ADE9A') + hi(78, 45, 3.5, 2) +
  eye(79, 50, 3) + eye(88, 50, 3) + cheek(76, 57, 0.6) + smile(84, 55, 3, 2.8)
);

const SEAL = 'M14 88C10 80 16 72 24 66C30 60 30 46 34 38C38 28 46 22 56 23C64 24 68 28 74 29C80 30 82 35 78 38C74 41 66 41 61 43C60 56 63 70 70 82C73 86 71 89 66 89L18 89C16 89 14 89 14 88Z';
const seal = svg(G('translate(0 2)',
  P('M17 87C9 88 4 83 5 77C10 78 15 82 20 84Z', '#8E9EC0') +
  shade('seal-s', SEAL, '#A9B7D6', '#8E9EC0') +
  P('M50 68C58 72 63 80 62 88L47 87Z', '#8E9EC0', ' stroke-width="3.5"') +
  hi(42, 36, 7, 4) +
  eye(55, 33, 4) + cheek(58, 41, 0.75) + E(79, 33, 3, 2.4, K, 0, NS) +
  C(68, 36, 1.1, K, NS) + C(71, 38, 1.1, K, NS) + C(67, 39.5, 1.1, K, NS) +
  `<defs><clipPath id="seal-b"><circle cx="78" cy="15" r="10.5"/></clipPath></defs>` +
  C(78, 15, 10.5, WH, NS) +
  `<g clip-path="url(#seal-b)" stroke="none">${P('M78 4C71 8 71 22 78 26L60 26L60 4Z', '#FF6B6B')}${P('M78 4C85 8 85 22 78 26L96 26L96 4Z', '#4D96FF')}${P('M70 6h16v6h-16z', '#FFC93C')}</g>` +
  C(78, 15, 10.5, 'none') + hi(74, 10, 3, 2)
));

const coralBranches = [
  'M50 86L50 50', 'M50 66C38 64 28 56 22 42', 'M50 66C62 64 72 56 78 42',
  'M50 52C44 44 38 34 36 24', 'M50 52C56 44 62 34 64 24', 'M28 54C22 54 16 52 13 46', 'M72 54C78 54 84 52 87 46',
];
const coral = svg(
  P('M24 91C26 83 38 80 50 80C62 80 74 83 76 91Z', '#FFE09A') +
  coralBranches.map((d) => `<path d="${d}" fill="none" stroke-width="20"/>`).join('') +
  coralBranches.map((d) => `<path d="${d}" fill="none" stroke="#FF8A7A" stroke-width="11"/>`).join('') +
  C(43, 70, 2.2, '#F06B5A', NS) + C(58, 60, 2.2, '#F06B5A', NS) + C(30, 52, 2, '#F06B5A', NS) + C(70, 50, 2, '#F06B5A', NS) +
  hi(37, 25, 2, 4, -20) + hi(22, 42, 2, 4, -30) +
  C(88, 24, 4, '#7FD8F0', ' stroke-width="3"') + C(82, 13, 2.6, '#7FD8F0', ' stroke-width="2.5"')
);

// ---------------------------------------------------------------- princess world
const crown = svg(
  shade('crown-s', 'M18 80L12 34L32 50L50 22L68 50L88 34L82 80Z', '#FFC93C', '#F2AE22') +
  P('M17 66L83 66L82 80L18 80Z', '#FF9F43') +
  C(12, 32, 6, '#FF5FA8') + C(50, 19, 6.5, '#FF5FA8') + C(88, 32, 6, '#FF5FA8') +
  C(50, 73, 5, '#FF5FA8', ' stroke-width="3.5"') +
  P('M32 68L37 73L32 78L27 73Z', '#7FD8F0', ' stroke-width="3"') + P('M68 68L73 73L68 78L63 73Z', '#7FD8F0', ' stroke-width="3"') +
  hi(28, 52, 3.5, 7, -20)
);

const princess = svg(
  P('M23 40C19 9 81 9 77 40L81 66C68 70 32 70 19 66Z', '#B07A4E') +
  shade('princess-s', 'M40 52L60 52C61 60 63 64 66 66C78 74 85 84 86 90C70 94 30 94 14 90C15 84 22 74 34 66C37 64 39 60 40 52Z', '#FF5FA8', '#E8449A') +
  L('M35 66Q50 71 65 66', 3) +
  C(32, 82, 2.4, '#FFC93C', NS) + C(50, 86, 2.4, '#FFC93C', NS) + C(68, 82, 2.4, '#FFC93C', NS) + C(41, 76, 2, '#FFC93C', NS) + C(59, 76, 2, '#FFC93C', NS) +
  C(37, 60, 6.5, '#FF8FB8', ' stroke-width="3.5"') + C(63, 60, 6.5, '#FF8FB8', ' stroke-width="3.5"') +
  hi(30, 80, 3, 6, 30) +
  C(50, 37, 18, SKIN) +
  P('M30 42C29 20 39 16 50 16C61 16 71 20 70 42C66 33 58 29 50 31C42 29 34 33 30 42Z', '#B07A4E', NS) +
  L('M32.5 37C37 33 43 30.5 50 31C57 30.5 63 33 67.5 37', 3.5) +
  P('M38 22L36 9L43 14L50 6L57 14L64 9L62 22Z', '#FFC93C', ' stroke-width="4"') + C(50, 16, 2.6, '#FF5FA8', NS) +
  hi(34, 24, 4, 2.2, -35) +
  face(50, 42, 0.9, 7)
);

const gem = svg(
  shade('gem-s', 'M30 20L70 20L90 42L50 88L10 42Z', '#B78CFF', '#9B6FF0') +
  P('M30 20L70 20L90 42L10 42Z', '#D6C2FF', NS) +
  P('M62 42L90 42L50 88Z', '#8C62DB', NS) +
  P('M30 20L70 20L90 42L50 88L10 42Z', 'none') +
  L('M10 42L90 42M30 20L38 42L50 88L62 42L70 20M38 42L50 20L62 42', 3.2) +
  hi(28, 31, 5, 2.5, -40) + sparkle(84, 16, 7, WH)
);

const castle = svg(
  P('M11 90L11 42L29 42L29 90Z', '#FF8FB8') + P('M71 90L71 42L89 42L89 90Z', '#FF8FB8') +
  P('M8 43L20 18L32 43Z', '#8C62DB') + P('M68 43L80 18L92 43Z', '#8C62DB') +
  P('M38 60L38 30L62 30L62 60Z', '#FF8FB8') + P('M35 31L50 9L65 31Z', '#B78CFF') +
  shade('castle-s', 'M24 90L24 52L30 52L30 45L38 45L38 52L46 52L46 45L54 45L54 52L62 52L62 45L70 45L70 52L76 52L76 90Z', '#FFB3D1', '#FF8FB8', -4, -4) +
  P('M41 90L41 75C41 66 59 66 59 75L59 90Z', '#8C62DB') +
  P('M17 60C17 54 23 54 23 60L23 66L17 66Z', '#8C62DB', ' stroke-width="3"') +
  P('M77 60C77 54 83 54 83 60L83 66L77 66Z', '#8C62DB', ' stroke-width="3"') +
  P('M46 44C46 38 54 38 54 44L54 50L46 50Z', '#8C62DB', ' stroke-width="3"') +
  C(20, 16, 3, '#FFC93C', ' stroke-width="3"') + C(80, 16, 3, '#FFC93C', ' stroke-width="3"') + C(50, 7, 3.4, '#FFC93C', ' stroke-width="3"') +
  hi(16, 34, 2, 5, 25) + hi(30, 62, 2.5, 6, 0)
);

const UNI = 'M50 26C66 26 74 38 74 52C74 62 72 70 70 76C68 84 60 89 50 89C40 89 32 84 30 76C28 70 26 62 26 52C26 38 34 26 50 26Z';
const unicorn = svg(G('translate(4 0)',
  C(40, 23, 10, '#FF5FA8') + C(28, 30, 10, '#B78CFF') + C(21, 43, 9.5, '#7FD8F0') + C(20, 57, 8.5, '#FFC93C') + C(24, 70, 7.5, '#FF8FB8') +
  P('M35 36C30 30 29 22 30 14C38 18 44 24 46 29Z', WH) + P('M65 36C70 30 71 22 70 14C62 18 56 24 54 29Z', WH) +
  P('M35 30C33 26 33 22 33.5 19C37 21 40 24 41 27Z', '#FF8FB8', NS) + P('M65 30C67 26 67 22 66.5 19C63 21 60 24 59 27Z', '#FF8FB8', NS) +
  shade('unicorn-s', UNI, WH, '#EDE5F7') +
  P(ell(50, 77, 16, 9.5), '#FFE3EE', ' stroke-width="3.5"') +
  E(44.5, 76, 1.6, 2.4, K, 0, NS) + E(55.5, 76, 1.6, 2.4, K, 0, NS) +
  P('M44 30L50 6L56 30Z', '#FFC93C', ' stroke-width="4"') + L('M46 23L54 19M47.5 15.5L52.5 12.5', 3) +
  P('M54 29C44 26 36 32 36 44C42 38 48 36 54 29Z', '#FF5FA8', ' stroke-width="3.5"') +
  P('M50 30C46 34 44 40 45 46C48 40 51 36 50 30Z', '#B78CFF', ' stroke-width="3"') +
  hi(34, 50, 3.5, 7, 15) +
  eye(40, 54, 4.2) + eye(60, 54, 4.2) + L('M35.5 52L32.5 50M64.5 52L67.5 50', 2.5) +
  cheek(34, 63) + cheek(66, 63)
));

const bow = svg(
  P('M47 54L30 84L40 82L44 90L54 58Z', '#FF5FA8') + P('M53 54L70 84L60 82L56 90L46 58Z', '#FF5FA8') +
  shade('bow-a', 'M50 48C38 28 14 22 10 38C8 52 28 64 50 54Z', '#FF5FA8', '#E8449A', -4, -4) +
  shade('bow-b', 'M50 48C62 28 86 22 90 38C92 52 72 64 50 54Z', '#FF5FA8', '#E8449A', -4, -4) +
  L('M40 46C32 40 24 38 19 41M60 46C68 40 76 38 81 41', 3) +
  P('M42 40C42 37 58 37 58 40L59 58C59 62 41 62 41 58Z', '#FF8FB8') +
  hi(22, 35, 5, 3) + hi(70, 34, 5, 3, -20)
);

const wand = svg(
  tube('M22 88L52 52', '#B78CFF', 7) +
  shade('wand-s', starD(62, 38, 28, 13), '#FFC93C', '#F2AE22') +
  hi(56, 30, 4, 2.5) +
  sparkle(20, 32, 9, '#FF8FB8') + sparkle(88, 78, 7, '#7FD8F0') + sparkle(36, 12, 5, '#FFC93C')
);

const dress = svg(
  shade('dress-s', 'M38 12L45 12C46 22 54 22 55 12L62 12L64 34C64 40 62 44 60 46C76 60 88 76 88 86C74 92 26 92 12 86C12 76 24 60 40 46C38 44 36 40 36 34Z', '#B78CFF', '#9B6FF0') +
  L('M41 60L32 87M59 60L68 87M50 58L50 89', 3) +
  P('M38 43Q50 48 62 43L62 51Q50 56 38 51Z', '#FF5FA8', ' stroke-width="3.5"') +
  C(24, 80, 2.4, WH, NS) + C(38, 76, 2.4, WH, NS) + C(62, 76, 2.4, WH, NS) + C(76, 80, 2.4, WH, NS) + C(44, 68, 2, WH, NS) + C(56, 68, 2, WH, NS) +
  hi(42, 26, 3, 7, 0)
);

const PETAL = 'M50 50C35 42 33 24 43 14L50 21L57 14C67 24 65 42 50 50Z';
const flower = svg(
  [0, 72, 144, 216, 288].map((a) => P(PETAL, '#FF8FB8', a ? ` transform="rotate(${a} 50 50)"` : '')).join('') +
  [36, 108, 180, 252, 324].map((a) => L('M50 50L50 34', 3) .replace('/>', ` transform="rotate(${a} 50 50)"/>`)).join('').replace(/stroke-width="3"/g, 'stroke-width="3" stroke="#FF5FA8"') +
  hi(45, 26, 3.5, 6, -10) +
  C(50, 50, 10, '#FF5FA8') +
  [0, 72, 144, 216, 288].map((a) => C(50, 37, 2.6, '#FFC93C', ' stroke-width="2"').replace('/>', ` transform="rotate(${a + 36} 50 50)"/>`)).join('') +
  C(47, 47, 2.5, WH, ' opacity=".5" stroke="none"')
);

const swan = svg(
  P(ell(52, 86, 40, 6), '#7FD8F0') +
  shade('swan-s', 'M30 62C30 78 46 86 62 86C78 86 90 74 90 52C84 59 74 60 66 58C56 56 44 56 30 62Z', WH, '#E4E8F4') +
  P('M48 68C56 61 70 60 80 64C75 74 63 78 52 75Z', WH, ' stroke-width="3.5"') +
  tube('M40 66C30 58 26 46 34 38C42 30 42 22 34 18', WH, 8) +
  P('M24 17L11 23L24 26Z', '#FF9F43', ' stroke-width="3.5"') +
  C(32, 20, 9, WH) +
  P('M27 12L26 4L30 7.5L33 2.5L36 7.5L40 4L39 12Z', '#FFC93C', ' stroke-width="3"') +
  eye(30, 19, 2.8) + cheek(35, 24, 0.6) +
  hi(40, 66, 5, 2.5, -15)
);

const ring = svg(
  C(50, 63, 24, 'none', ' stroke-width="18"') + C(50, 63, 24, 'none', ' stroke="#FFC93C" stroke-width="9"') +
  L('M38 44L36 38M62 44L64 38', 5) +
  shade('ring-s', 'M34 22L66 22L75 33L50 54L25 33Z', '#FF5FA8', '#E8449A', -4, -4) +
  P('M34 22L66 22L75 33L25 33Z', '#FF8FB8', NS) + P('M34 22L66 22L75 33L50 54L25 33Z', 'none') +
  L('M25 33L75 33M42 22L39 33L50 54L61 33L58 22', 3) +
  hi(36, 27, 3, 1.8, -30) + sparkle(84, 18, 6, WH) + hi(32, 52, 2, 5, 40)
);

const fairy = svg(
  E(27, 44, 19, 13, '#C8F0FB', -25) + E(73, 44, 19, 13, '#C8F0FB', 25) +
  E(31, 66, 12, 8.5, '#C8F0FB', 25) + E(69, 66, 12, 8.5, '#C8F0FB', -25) +
  hi(19, 40, 5, 2.5, -25) + hi(70, 38, 4, 2, -25) +
  tube('M45 76L43 86', SKIN, 4) + tube('M55 76L57 86', SKIN, 4) +
  E(42, 88, 5, 3.5, '#FF5FA8', 0, ' stroke-width="3.5"') + E(58, 88, 5, 3.5, '#FF5FA8', 0, ' stroke-width="3.5"') +
  tube('M44 55L35 64', SKIN, 4) + tube('M56 55L67 60', SKIN, 4) +
  L('M67 60L79 42', 4) + P(starD(81, 37, 9.5, 4.4), '#FFC93C', ' stroke-width="3.5"') +
  shade('fairy-s', 'M43 50L57 50L70 74L65 80L59 75L55 81L50 76L45 81L41 75L35 80L30 74Z', '#4ADE9A', '#3CC47C', -3, -3) +
  C(50, 14, 6.5, '#FFC93C') + P('M27 36C24 9 76 9 73 36C74 48 68 54 63 56L37 56C32 54 26 48 27 36Z', '#FFC93C') +
  C(50, 34, 16, SKIN) +
  P('M33 39C32 20 41 16 50 16C59 16 68 20 67 39C63 31 57 28 51 29C44 28 37 32 33 39Z', '#FFC93C', NS) +
  L('M35 35C39 31 44 28.5 51 29C57 28.5 62 31 65 34.5', 3.4) +
  hi(38, 22, 5, 2.4, -30) +
  face(50, 39, 0.82, 7)
);

// ---------------------------------------------------------------- shared
const heart = svg(
  shade('heart-s', 'M50 86C20 66 10 50 12 34C14 20 26 14 36 16C44 18 48 24 50 28C52 24 56 18 64 16C74 14 86 20 88 34C90 50 80 66 50 86Z', '#FF5FA8', '#E8449A') +
  hi(28, 30, 8, 4.5)
);

const star = svg(
  shade('star-s', starD(50, 54, 42, 21), '#FFC93C', '#F2AE22') +
  hi(40, 38, 5, 3) + face(50, 56, 1)
);

const rbArc = (r) => `M${50 - r} 70A${r} ${r} 0 0 1 ${50 + r} 70`;
const rainbow = svg(
  `<path d="${rbArc(24.5)}" fill="none" stroke-width="33.5" stroke-linecap="butt"/>` +
  [['#FF6B6B', 36.5], ['#FF9F43', 30.5], ['#FFC93C', 24.5], ['#4ADE9A', 18.5], ['#4D96FF', 12.5]]
    .map(([c, r]) => `<path d="${rbArc(r)}" fill="none" stroke="${c}" stroke-width="6.2" stroke-linecap="butt"/>`).join('') +
  `<path d="M22 50A36 36 0 0 1 40 35" fill="none" stroke="#fff" stroke-width="3" opacity=".45"/>` +
  miniCloud(18, 72, 0.4) + miniCloud(82, 72, 0.4)
);

const sun = svg(
  P(starD(50, 50, 44, 29, 10), '#FF9F43') +
  shade('sun-s', circ(50, 50, 28), '#FFC93C', '#F2AE22') +
  hi(40, 37, 7, 4) + face(50, 50, 1.15)
);

const moon = svg(
  shade('moon-s', 'M58 14A36.5 36.5 0 1 0 58 86A40 40 0 0 1 58 14Z', '#FFC93C', '#F2AE22', -4, -4) +
  hi(30, 30, 4, 7, 30) +
  L('M21 46Q24.5 50 28 46', 3) + cheek(25, 55, 0.7) + smile(26, 61, 3, 2.8) +
  P(starD(75, 32, 10, 4.6), '#FFE07A', ' stroke-width="3.5"') +
  sparkle(82, 64, 7, '#FFE07A')
);

const cloud = svg(
  shade('cloud-s', 'M24 80C12 80 8 68 14 60C10 48 22 38 34 44C38 30 58 26 66 40C78 36 90 46 86 58C94 64 92 80 78 80Z', WH, '#D9EEFF', -4, -6) +
  hi(36, 50, 6, 3, -20) + face(52, 62, 1)
);

const tulip = svg(
  tube('M50 64L50 90', '#3CC47C', 5) +
  P('M50 90C34 90 22 78 24 62C38 64 48 74 50 90Z', '#3CC47C') + P('M50 90C66 90 78 78 76 62C62 64 52 74 50 90Z', '#3CC47C') +
  shade('tulip-s', 'M28 26L39 37L50 20L61 37L72 26C76 48 70 66 50 66C30 66 24 48 28 26Z', '#FF6B6B', '#E84F52') +
  L('M39 37C39 50 43 58 50 64M61 37C61 50 57 58 50 64', 3) +
  hi(34, 40, 3, 7, 10)
);

const butterfly = svg(
  E(30, 38, 21, 17, '#FF5FA8', -25) + E(70, 38, 21, 17, '#FF5FA8', 25) +
  E(33, 66, 15, 13, '#B78CFF', 25) + E(67, 66, 15, 13, '#B78CFF', -25) +
  C(27, 36, 6, '#FFC93C', ' stroke-width="3"') + C(73, 36, 6, '#FFC93C', ' stroke-width="3"') +
  C(33, 67, 4, '#FFC93C', ' stroke-width="3"') + C(67, 67, 4, '#FFC93C', ' stroke-width="3"') +
  hi(20, 30, 5, 2.5, -30) +
  L('M46 23C44 16 40 13 35 13M54 23C56 16 60 13 65 13', 3.5) + C(35, 13, 3, K, NS) + C(65, 13, 3, K, NS) +
  P('M50 32C55 32 55 38 55 44L54 80C54 84 46 84 46 80L45 44C45 38 45 32 50 32Z', '#8C62DB') +
  C(50, 29, 9, '#8C62DB') + face(50, 29, 0.5, 7)
);

const ladybug = svg(
  L('M24 50L12 45M21 63L9 65M25 76L15 84M76 50L88 45M79 63L91 65M75 76L85 84', 4.5) +
  L('M44 16C42 10 38 8 34 9M56 16C58 10 62 8 66 9', 3.5) + C(34, 9, 3, K, NS) + C(66, 9, 3, K, NS) +
  C(50, 28, 15, K) +
  shade('ladybug-s', circ(50, 60, 29), '#FF6B6B', '#E84F52') +
  L('M50 32L50 88', 3.5) +
  C(37, 49, 6, K, NS) + C(63, 49, 6, K, NS) + C(35, 70, 5, K, NS) + C(65, 70, 5, K, NS) +
  hi(34, 40, 5, 2.5, -25) +
  C(43, 22, 4.2, WH, NS) + C(57, 22, 4.2, WH, NS) + eye(43.5, 22.5, 2.4) + eye(57.5, 22.5, 2.4) +
  cheek(38, 29, 0.6) + cheek(62, 29, 0.6) + L('M47 27Q50 30 53 27', 2.5).replace('stroke-width', 'stroke="#fff" stroke-width')
);

const bee = svg(
  E(40, 30, 11, 15, WH, -20) + E(60, 28, 11, 15, WH, 20) +
  L('M30 38C28 27 24 23 18 23M37 35C37 25 40 20 46 19', 3.5) + C(18, 23, 3, K, NS) + C(46, 19, 3, K, NS) +
  P('M75 51L89 56L75 61Z', K, ' stroke-width="3"') +
  `<defs><clipPath id="bee-c"><path d="${ell(46, 56, 30, 24)}"/></clipPath></defs>` +
  P(ell(46, 56, 30, 24), '#F2AE22', NS) +
  `<g clip-path="url(#bee-c)" stroke="none">${P(ell(46, 56, 30, 24), '#FFC93C', ' transform="translate(-4 -5)"')}${P('M50 20h9v80h-9zM65 20h9v80h-9z', K)}</g>` +
  P(ell(46, 56, 30, 24), 'none') +
  hi(28, 42, 6, 3, -25) + hi(36, 24, 3, 5, -20) +
  face(32, 54, 0.95, 7)
);

const puppy = svg(
  shade('puppy-s', circ(50, 54, 30), '#F4C58F', '#E6AE72') +
  E(62, 48, 9, 8, '#D9965E', 0, NS) +
  P('M30 30C17 26 8 40 9 56C10 64 17 67 22 61C27 53 29 41 33 33Z', '#B07A4E') +
  P('M70 30C83 26 92 40 91 56C90 64 83 67 78 61C73 53 71 41 67 33Z', '#B07A4E') +
  E(50, 67, 15, 11, '#FFF8EE', 0, ' stroke-width="3.5"') +
  P('M47 72C47 80 53 80 53 72Z', '#FF8FB8', ' stroke-width="3"') +
  L('M50 65L50 70M42 70Q46 74 50 70Q54 74 58 70', 3) +
  P('M44 61C44 57 56 57 56 61C56 64 52 66 50 66C48 66 44 64 44 61Z', K, NS) +
  hi(38, 34, 7, 4) +
  eye(39, 48, 4.3) + eye(61, 48, 4.3) + cheek(30, 63) + cheek(70, 63)
);

const kitten = svg(
  P('M21 46L19 14L45 29Z', '#FF9F43') + P('M79 46L81 14L55 29Z', '#FF9F43') +
  P('M25 37L24 22L37 30Z', '#FF8FB8', NS) + P('M75 37L76 22L63 30Z', '#FF8FB8', NS) +
  shade('kitten-s', ell(50, 57, 33, 28), '#FF9F43', '#F08A2C') +
  L('M44 33L46 41M50 31L50 41M56 33L54 41', 3.2) +
  E(50, 66, 12, 8.5, '#FFF8EE', 0, NS) +
  P('M46 60L54 60L50 64.5Z', '#FF5FA8', ' stroke-width="3"') +
  L('M50 64.5Q47 69 43 66.5M50 64.5Q53 69 57 66.5', 3) +
  L('M12 59L27 61M12 67L27 66M88 59L73 61M88 67L73 66', 3) +
  hi(32, 40, 7, 4) +
  eye(37, 52, 4.5) + eye(63, 52, 4.5) + cheek(31, 63, 0.8) + cheek(69, 63, 0.8)
);

const bunny = svg(
  E(37, 30, 9.5, 21, WH, -8) + E(63, 30, 9.5, 21, WH, 8) +
  E(37, 32, 4.5, 14, '#FF8FB8', -8, NS) + E(63, 32, 4.5, 14, '#FF8FB8', 8, NS) +
  shade('bunny-s', circ(50, 64, 25), WH, '#ECE4F4') +
  P('M47 72h6v5.5h-6z', WH, ' stroke-width="2.5"') +
  P('M46.5 66L53.5 66L50 70Z', '#FF5FA8', ' stroke-width="3"') +
  L('M50 70Q47 74 43.5 72M50 70Q53 74 56.5 72', 3) +
  hi(38, 50, 6, 3.5) +
  eye(40, 60, 4) + eye(60, 60, 4) + cheek(33, 69) + cheek(67, 69)
);

const bear = svg(
  C(26, 31, 11, '#B07A4E') + C(74, 31, 11, '#B07A4E') + C(26, 31, 5.5, '#E3B588', NS) + C(74, 31, 5.5, '#E3B588', NS) +
  shade('bear-s', circ(50, 57, 30), '#B07A4E', '#986540') +
  E(50, 67, 14, 10.5, '#F2D3AE', 0, ' stroke-width="3.5"') +
  E(50, 62, 5.5, 4, K, 0, NS) + L('M50 66L50 70M44 70Q47 73 50 70Q53 73 56 70', 3) +
  hi(36, 40, 7, 4) +
  eye(38, 51, 4.3) + eye(62, 51, 4.3) + cheek(30, 63) + cheek(70, 63)
);

const panda = svg(
  C(26, 31, 11, K) + C(74, 31, 11, K) +
  shade('panda-s', circ(50, 57, 30), WH, '#ECE8F3') +
  E(38, 53, 8, 10, K, 35, NS) + E(62, 53, 8, 10, K, -35, NS) +
  C(39, 52, 3.8, WH, NS) + C(61, 52, 3.8, WH, NS) + C(39.6, 52.6, 2, K, NS) + C(61.6, 52.6, 2, K, NS) +
  E(50, 64, 5, 3.6, K, 0, NS) + L('M50 67L50 70M45 70Q47.5 73 50 70Q52.5 73 55 70', 3) +
  hi(36, 40, 7, 4) + cheek(30, 67) + cheek(70, 67)
);

const lion = svg(
  shade('lion-m', scallopD(50, 50, 33, 14, 8), '#FF9F43', '#E8832A') +
  C(32, 33, 7, '#FFC93C') + C(68, 33, 7, '#FFC93C') + C(32, 33, 3.4, '#FF8A7A', NS) + C(68, 33, 3.4, '#FF8A7A', NS) +
  shade('lion-s', circ(50, 53, 24), '#FFC93C', '#F2AE22', -4, -4) +
  E(50, 63, 12.5, 9, '#FFF8EE', 0, ' stroke-width="3.5"') +
  E(50, 59.5, 4.2, 3, '#B07A4E', 0, NS) + L('M50 62.5L50 65M45 66Q47.5 69 50 65Q52.5 69 55 66', 2.6) +
  hi(40, 40, 5, 3) +
  eye(41, 49, 3.8) + eye(59, 49, 3.8) + cheek(35, 58, 0.8) + cheek(65, 58, 0.8)
);

const elephant = svg(
  E(24, 46, 16, 19, '#A5B8DA') + E(76, 46, 16, 19, '#A5B8DA') +
  E(26, 47, 9, 12, '#FFB8D2', 0, NS) + E(74, 47, 9, 12, '#FFB8D2', 0, NS) +
  tube('M50 58C50 70 50 78 58 82C62 84 66 80 64 76', '#A5B8DA', 10) +
  shade('elephant-s', circ(50, 44, 24), '#A5B8DA', '#8EA2C8') +
  hi(40, 30, 6, 3.5) +
  eye(41, 42, 4) + eye(59, 42, 4) + cheek(34, 51) + cheek(66, 51)
);

const giraffe = svg(
  shade('giraffe-n', 'M38 58L36 90C36 92 64 92 64 90L62 58Z', '#FFC93C', '#F2AE22', -3, 0) +
  E(45, 72, 4.5, 3.8, '#E8A04A', 0, NS) + E(55, 82, 5, 3.8, '#E8A04A', 0, NS) + E(56, 66, 3, 2.6, '#E8A04A', 0, NS) + E(43, 85, 3, 2.6, '#E8A04A', 0, NS) +
  L('M41 26L37 12M59 26L63 12', 4.5) + C(37, 11, 4.5, '#B07A4E') + C(63, 11, 4.5, '#B07A4E') +
  E(23, 34, 9, 5, '#FFC93C', -20) + E(77, 34, 9, 5, '#FFC93C', 20) +
  shade('giraffe-s', 'M50 18C64 18 72 28 72 40C72 54 66 64 50 64C34 64 28 54 28 40C28 28 36 18 50 18Z', '#FFC93C', '#F2AE22') +
  E(50, 54, 15, 9, '#FFF0C8', 0, ' stroke-width="3.5"') + C(45, 53, 1.8, K, NS) + C(55, 53, 1.8, K, NS) +
  C(37, 27, 3, '#E8A04A', NS) + C(63, 25, 2.4, '#E8A04A', NS) +
  hi(38, 28, 5, 3) +
  eye(41, 39, 3.8) + eye(59, 39, 3.8) + cheek(34, 47, 0.8) + cheek(66, 47, 0.8)
);

const chick = svg(
  P('M46 25C41 15 49 10 51 16C53 10 62 12 56 25Z', '#FFC93C', ' stroke-width="3.5"') +
  shade('chick-s', circ(50, 53, 30), '#FFC93C', '#F2AE22') +
  E(23, 58, 6, 10, '#F2AE22', 20, ' stroke-width="3.5"') + E(77, 58, 6, 10, '#F2AE22', -20, ' stroke-width="3.5"') +
  shade('chick-e', 'M18 66L26 60L34 68L42 60L50 68L58 60L66 68L74 60L82 66C82 82 68 91 50 91C32 91 18 82 18 66Z', WH, '#ECE4F4', -3, -3) +
  P('M44 52L56 52L50 59Z', '#FF9F43', ' stroke-width="3.5"') +
  hi(38, 36, 7, 4) +
  eye(40, 45, 4) + eye(60, 45, 4) + cheek(33, 54) + cheek(67, 54)
);

const dino = svg(
  P('M27 58L23 46L35 51Z', '#FF9F43', ' stroke-width="3.5"') + P('M37 49L37 35L47 44Z', '#FF9F43', ' stroke-width="3.5"') +
  P('M49 45L54 31L59 43Z', '#FF9F43', ' stroke-width="3.5"') + P('M60 38L67 26L70 36Z', '#FF9F43', ' stroke-width="3.5"') +
  shade('dino-s', 'M8 70C18 72 26 66 30 58C34 48 44 42 56 44C60 32 66 24 78 24C88 24 94 32 92 42C90 50 84 52 76 52C78 60 76 68 72 74L72 86L62 86L60 78L46 78L44 86L34 86L34 76C24 78 14 76 8 70Z', '#3CC47C', '#2FA866') +
  P('M38 68C46 75 60 74 68 64C66 72 58 77 48 77C44 77 40 73 38 68Z', '#A8F0C8', NS) +
  L('M70 58C75 58 79 61 78 65', 4) +
  hi(74, 30, 5, 3) + hi(44, 50, 6, 3, -20) +
  eye(80, 35, 4) + cheek(81, 44, 0.7) + L('M84 46Q88 48 91 44', 3)
);

const apple = svg(
  tube('M50 30L53 14', '#B07A4E', 4) +
  P('M55 22C60 10 74 10 79 16C73 25 62 27 55 22Z', '#3CC47C', ' stroke-width="4"') +
  shade('apple-s', 'M50 30C40 22 18 22 16 46C14 70 32 88 44 86C48 85 52 85 56 86C68 88 86 70 84 46C82 22 60 22 50 30Z', '#FF6B6B', '#E84F52') +
  hi(30, 40, 6, 9, 20)
);

const strawberry = svg(
  shade('strawberry-s', 'M50 90C30 82 14 62 16 42C18 30 32 26 50 28C68 26 82 30 84 42C86 62 70 82 50 90Z', '#FF6B6B', '#E84F52') +
  [[32, 46], [50, 44], [68, 46], [40, 58], [60, 58], [30, 64], [70, 64], [50, 70], [40, 78], [60, 78], [50, 56]]
    .map(([x, y]) => E(x, y, 1.7, 2.6, '#FFE07A', 0, NS)).join('') +
  P('M26 32C32 24 40 23 44 27C44 19 48 15 50 13C52 15 56 19 56 27C60 23 68 24 74 32C66 36 58 36 50 34C42 36 34 36 26 32Z', '#3CC47C', ' stroke-width="4"') +
  tube('M50 15L50 9', '#3CC47C', 3) +
  hi(28, 48, 4, 7, 20)
);

const cupcake = svg(
  shade('cupcake-w', 'M24 58L76 58L68 90L32 90Z', '#7FD8F0', '#22B8CF', -4, 0) +
  L('M36 58L40 90M50 58L50 90M64 58L60 90', 3) +
  tube('M52 24C52 18 54 14 58 12', '#3CC47C', 2) +
  C(52, 18, 7.5, '#FF6B6B') + hi(49.5, 15.5, 2, 1.3) +
  shade('cupcake-s', 'M20 60C12 58 13 44 26 44C24 32 36 26 44 30C46 22 58 22 62 28C72 26 80 34 76 44C88 44 88 60 80 60Z', '#FF8FB8', '#FF6FA0') +
  L('M30 46Q40 52 50 46M52 38Q62 44 70 40', 3) +
  [['#FFC93C', 'M30 52l4 -2'], ['#4D96FF', 'M44 40l2 4'], ['#FFFFFF', 'M62 50l4 1'], ['#4ADE9A', 'M56 34l3 -3'], ['#B78CFF', 'M38 34l-3 -2'], ['#FFC93C', 'M70 48l2 3']]
    .map(([c, d]) => `<path d="${d}" stroke="${c}" stroke-width="3"/>`).join('') +
  hi(32, 40, 5, 2.5)
);

const iceCream = svg(
  shade('ice-cream-c', 'M28 56L72 56L52 92L48 92Z', '#FFC93C', '#F2AE22', -4, 0) +
  L('M36 62L58 82M46 58L64 72M54 58L40 80M64 60L44 92', 2.8) +
  shade('ice-cream-a', 'M24 56C18 42 32 32 50 32C68 32 82 42 76 56C72 60 66 56 62 60C58 64 52 60 48 62C42 65 38 58 32 61C28 63 25 60 24 56Z', '#4ADE9A', '#3CC47C', -4, -4) +
  shade('ice-cream-b', circ(50, 27, 17), '#FF8FB8', '#FF6FA0', -4, -4) +
  C(51, 9.5, 5, '#FF6B6B', ' stroke-width="3.5"') +
  hi(42, 21, 5, 3) + hi(32, 42, 5, 2.5, -15)
);

const car = svg(
  shade('car-s', 'M10 70L10 58C10 52 14 50 20 50L28 50L36 34C38 31 41 30 44 30L64 30C67 30 70 32 72 35L80 50L84 50C88 50 90 54 90 58L90 70C90 74 88 76 84 76L16 76C12 76 10 74 10 70Z', '#FF6B6B', '#E84F52') +
  P('M39 50L45 36L54 36L54 50Z', '#7FD8F0', ' stroke-width="3.5"') + P('M60 50L60 36L66 36L73 50Z', '#7FD8F0', ' stroke-width="3.5"') +
  L('M57 54L57 70', 3) + L('M62 59L66 59', 3) +
  E(86, 60, 2.6, 3.6, '#FFC93C', 0, ' stroke-width="2.5"') +
  hi(24, 55, 6, 2.5, -10) +
  C(29, 76, 11, K) + C(29, 76, 4.5, '#D8D2E6', NS) + C(71, 76, 11, K) + C(71, 76, 4.5, '#D8D2E6', NS)
);

const bus = svg(
  shade('bus-s', 'M8 30C8 26 12 24 16 24L76 24C86 24 92 32 92 44L92 72C92 76 90 78 86 78L14 78C10 78 8 76 8 72Z', '#FFC93C', '#F2AE22') +
  P('M14 32h12v15h-12zM31 32h12v15h-12zM48 32h12v15h-12z', '#7FD8F0', ' stroke-width="3.5"') +
  P('M65 32L77 32L77 72L65 72Z', '#7FD8F0', ' stroke-width="3.5"') + L('M71 32L71 72', 3) +
  P('M82 32C86 33 88 38 88 46L82 46Z', '#7FD8F0', ' stroke-width="3.5"') +
  L('M10 56L63 56', 3.5) + L('M79 56L90 56', 3.5) +
  E(89, 64, 2.4, 3.4, WH, 0, ' stroke-width="2.5"') +
  hi(20, 28, 6, 1.8, 0) +
  C(26, 78, 10, K) + C(26, 78, 4, '#D8D2E6', NS) + C(78, 78, 10, K) + C(78, 78, 4, '#D8D2E6', NS)
);

const fireTruck = svg(
  P('M69 32C69 25 79 25 79 32Z', '#4D96FF', ' stroke-width="3.5"') +
  shade('fire-truck-s', 'M8 46L62 46L62 36C62 33 64 32 66 32L80 32C83 32 85 34 86 37L92 52L92 72C92 75 90 76 88 76L12 76C9 76 8 75 8 72Z', '#FF6B6B', '#E84F52') +
  P('M68 38L79 38C80.5 38 81.5 39 82 40.5L86 52L68 52Z', '#7FD8F0', ' stroke-width="3.5"') +
  P('M10 34h48v8h-48z', WH, ' stroke-width="3.5"') + L('M20 34v8M30 34v8M40 34v8M50 34v8', 3) +
  P('M12 58h50v5h-50z', WH, ' stroke-width="3"') +
  E(89, 62, 2.4, 3.4, '#FFC93C', 0, ' stroke-width="2.5"') +
  hi(20, 51, 6, 2, 0) +
  C(26, 76, 10, K) + C(26, 76, 4, '#D8D2E6', NS) + C(74, 76, 10, K) + C(74, 76, 4, '#D8D2E6', NS)
);

const train = svg(
  C(30, 15, 6, WH, ' stroke-width="3.5"') + C(42, 9, 4.5, WH, ' stroke-width="3.5"') +
  P('M23 42L21 26L37 26L35 42Z', '#8C62DB') + P('M19 26h20v-5h-20z', '#FFC93C', ' stroke-width="3.5"') +
  P('M16 64L7 78L20 78Z', '#FFC93C', ' stroke-width="3.5"') +
  shade('train-b', 'M14 46C14 43 16 40 20 40L60 40L60 76L14 76Z', '#4D96FF', '#3A7FE6') +
  L('M36 40L36 76', 3.5) +
  shade('train-c', 'M56 28L88 28L88 76L56 76Z', '#FF6B6B', '#E84F52') +
  P('M51 28L51 22C51 20 53 19 55 19L89 19C91 19 93 20 93 22L93 28Z', '#8C62DB') +
  P('M63 34h18v14h-18z', '#7FD8F0', ' stroke-width="3.5"') +
  hi(24, 48, 6, 2, 0) + hi(66, 37, 3, 1.6, 0) +
  C(27, 77, 9, K) + C(27, 77, 3.6, '#FFC93C', NS) + C(48, 77, 9, K) + C(48, 77, 3.6, '#FFC93C', NS) +
  C(74, 75, 12, K) + C(74, 75, 5, '#FFC93C', NS)
);

const plane = svg(
  P('M17 49L12 24C12 21 14 20 17 21L36 42Z', '#4D96FF') +
  P('M50 44L60 30L69 30L64 44Z', '#3A7FE6') +
  shade('plane-s', 'M10 52C10 44 18 40 28 40L72 40C84 40 92 46 92 52C92 58 84 62 72 62L28 62C18 62 10 60 10 52Z', WH, '#DCE8FF', -3, -4) +
  P('M74 44C80 44 85 47 87.5 50.5L74 50.5Z', '#7FD8F0', ' stroke-width="3.5"') +
  C(36, 49, 3.6, '#7FD8F0', ' stroke-width="3"') + C(47, 49, 3.6, '#7FD8F0', ' stroke-width="3"') + C(58, 49, 3.6, '#7FD8F0', ' stroke-width="3"') +
  P('M40 56L62 56L50 84L37 84Z', '#4D96FF') +
  hi(26, 45, 6, 2, 0)
);

const ROCKET = 'M50 8C64 18 70 38 68 68L32 68C30 38 36 18 50 8Z';
const rocket = svg(
  P('M40 72L60 72C60 82 54 86 50 92C46 86 40 82 40 72Z', '#FF9F43') + P('M45 72L55 72C55 79 52 82 50 86C48 82 45 79 45 72Z', '#FFC93C', NS) +
  P('M38 66L62 66L60 74L40 74Z', '#8C62DB', ' stroke-width="4"') +
  P('M33 46L18 62L18 76L34 68Z', '#FF6B6B') + P('M67 46L82 62L82 76L66 68Z', '#FF6B6B') +
  `<defs><clipPath id="rocket-c"><path d="${ROCKET}"/></clipPath></defs>` +
  P(ROCKET, '#E4DEF0', NS) +
  `<g clip-path="url(#rocket-c)" stroke="none">${P(ROCKET, WH, ' transform="translate(-4 0)"')}<path d="M0 0h100v27h-100z" fill="#FF6B6B"/></g>` +
  L('M38 27L62 27', 4) + P(ROCKET, 'none') +
  C(50, 44, 10, '#4D96FF') + C(50, 44, 5.5, '#7FD8F0', NS) + hi(46.5, 40.5, 2.6, 1.6) +
  hi(40, 40, 2.2, 9, 8)
);

// ---------------------------------------------------------------- export
const DEFS = [
  ['mermaid', 'mermaid', 'mermaid', mermaid], ['mermaid', 'fish', 'fish', fish], ['mermaid', 'tropical-fish', 'tropical fish', tropicalFish],
  ['mermaid', 'pufferfish', 'pufferfish', pufferfish], ['mermaid', 'octopus', 'octopus', octopus], ['mermaid', 'crab', 'crab', crab],
  ['mermaid', 'shell', 'shell', shell], ['mermaid', 'whale', 'whale', whale], ['mermaid', 'dolphin', 'dolphin', dolphin],
  ['mermaid', 'turtle', 'turtle', turtle], ['mermaid', 'seal', 'seal', seal], ['mermaid', 'coral', 'coral', coral],
  ['princess', 'crown', 'crown', crown], ['princess', 'princess', 'princess', princess], ['princess', 'gem', 'gem', gem],
  ['princess', 'castle', 'castle', castle], ['princess', 'unicorn', 'unicorn', unicorn], ['princess', 'bow', 'bow', bow],
  ['princess', 'wand', 'magic wand', wand], ['princess', 'dress', 'dress', dress], ['princess', 'flower', 'flower', flower],
  ['princess', 'swan', 'swan', swan], ['princess', 'ring', 'ring', ring], ['princess', 'fairy', 'fairy', fairy],
  ['shared', 'heart', 'heart', heart], ['shared', 'star', 'star', star], ['shared', 'rainbow', 'rainbow', rainbow],
  ['shared', 'sun', 'sun', sun], ['shared', 'moon', 'moon', moon], ['shared', 'cloud', 'cloud', cloud],
  ['shared', 'tulip', 'tulip', tulip], ['shared', 'butterfly', 'butterfly', butterfly], ['shared', 'ladybug', 'ladybug', ladybug],
  ['shared', 'bee', 'bee', bee], ['shared', 'puppy', 'puppy', puppy], ['shared', 'kitten', 'kitten', kitten],
  ['shared', 'bunny', 'bunny', bunny], ['shared', 'bear', 'bear', bear], ['shared', 'panda', 'panda', panda],
  ['shared', 'lion', 'lion', lion], ['shared', 'elephant', 'elephant', elephant], ['shared', 'giraffe', 'giraffe', giraffe],
  ['shared', 'chick', 'chick', chick], ['shared', 'dino', 'dinosaur', dino], ['shared', 'apple', 'apple', apple],
  ['shared', 'strawberry', 'strawberry', strawberry], ['shared', 'cupcake', 'cupcake', cupcake], ['shared', 'ice-cream', 'ice cream', iceCream],
  ['shared', 'car', 'car', car], ['shared', 'bus', 'bus', bus], ['shared', 'fire-truck', 'fire truck', fireTruck],
  ['shared', 'train', 'train', train], ['shared', 'plane', 'plane', plane], ['shared', 'rocket', 'rocket', rocket],
];

export const STICKERS = {};
export const STICKER_SETS = { mermaid: [], princess: [], shared: [] };
for (const [theme, id, label, s] of DEFS) {
  STICKERS[id] = { theme, label, svg: s };
  STICKER_SETS[theme].push(id);
}
