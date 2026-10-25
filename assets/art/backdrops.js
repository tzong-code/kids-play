// Chunky-toy background scenes for Sticker Scenes and Kitty Dollhouse.
// Same ink outline, candy palette and glossy highlights as js/art.js, but kept calm in the middle so
// stickers dropped on top stand out. Scenes are 1000x600 "slice" (edges crop), the house is 1200x760 "meet".
// Every id is prefixed with its backdrop key so several can live inline on one page.

const INK = '#2B2340';
const PINK = '#FF5FA8', BUBBLE = '#FF8FB8', LILAC = '#B78CFF', GOLD = '#FFC93C', CORAL = '#FF8A7A';
const LAGOON = '#22B8CF', AQUA = '#7FD8F0', BLUE = '#4D96FF', MINT = '#4ADE9A', GREEN = '#3CC47C';
const CREAM = '#FFF8EE', SAND = '#FFE7B8', WH = '#FFFFFF';

const n = (v) => +(+v).toFixed(1);
const NS = ' stroke="none"';

const wrap = (vb, fit, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="${fit}">` +
  (defs ? `<defs>${defs}</defs>` : '') + body + `</svg>`;
const scene = (defs, body) => wrap('0 0 1000 600', 'xMidYMid slice', defs, body);
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;

const R = (x, y, w, h, fill, rx = 0, x2 = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${rx ? ` rx="${rx}"` : ''} fill="${fill}"${x2}/>`;
const P = (d, fill, x2 = '') => `<path d="${d}" fill="${fill}"${x2}/>`;
const C = (cx, cy, r, fill, x2 = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${x2}/>`;
const E = (cx, cy, rx, ry, fill, x2 = '') => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${x2}/>`;
const L = (d, w = 0, x2 = '') => `<path d="${d}" fill="none"${w ? ` stroke-width="${w}"` : ''}${x2}/>`;
/** Soft (non-ink) line, used for floor planks, tile joints and paint lines. */
const soft = (d, color, w = 3) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
const shine = (cx, cy, rx, ry, rot = -20, op = 0.5) =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${WH}" opacity="${op}" stroke="none" transform="rotate(${rot} ${n(cx)} ${n(cy)})"/>`;
/** Fat outlined line: ink underneath, colour on top. */
const tube = (d, w, color) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const lin = (id, c1, c2, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;

function starD(cx, cy, R0, r, k = 5) {
  let d = '';
  for (let i = 0; i < k * 2; i++) {
    const a = (Math.PI / k) * i - Math.PI / 2, rr = i % 2 ? r : R0;
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)}`;
  }
  return d + 'Z';
}
const sparkleD = (x, y, r) =>
  `M${n(x)} ${n(y - r)}Q${n(x + r * 0.18)} ${n(y - r * 0.18)} ${n(x + r)} ${n(y)}Q${n(x + r * 0.18)} ${n(y + r * 0.18)} ${n(x)} ${n(y + r)}` +
  `Q${n(x - r * 0.18)} ${n(y + r * 0.18)} ${n(x - r)} ${n(y)}Q${n(x - r * 0.18)} ${n(y - r * 0.18)} ${n(x)} ${n(y - r)}Z`;
const sparkles = (list, fill = WH, w = 3) => ink(w, list.map(([x, y, r, f]) => P(sparkleD(x, y, r), f || fill)).join(''));
/** Heart with its point at (x, y), about 2.6s wide. */
const heartD = (x, y, s) =>
  `M${n(x)} ${n(y)}C${n(x - 1.6 * s)} ${n(y - 1.4 * s)} ${n(x - 2.4 * s)} ${n(y - 2.4 * s)} ${n(x - 1.4 * s)} ${n(y - 3.2 * s)}` +
  `C${n(x - 0.8 * s)} ${n(y - 3.6 * s)} ${n(x - 0.2 * s)} ${n(y - 3.2 * s)} ${n(x)} ${n(y - 2.8 * s)}` +
  `C${n(x + 0.2 * s)} ${n(y - 3.2 * s)} ${n(x + 0.8 * s)} ${n(y - 3.6 * s)} ${n(x + 1.4 * s)} ${n(y - 3.2 * s)}` +
  `C${n(x + 2.4 * s)} ${n(y - 2.4 * s)} ${n(x + 1.6 * s)} ${n(y - 1.4 * s)} ${n(x)} ${n(y)}Z`;

const CLOUD = 'M-26 27C-38 27 -42 15 -36 7C-40 -5 -28 -15 -16 -9C-12 -23 8 -27 16 -13C28 -17 40 -7 36 5C44 11 42 27 28 27Z';
const cloud = (x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  P(CLOUD, WH, ` stroke="${INK}" stroke-width="${n(4.5 / s)}" stroke-linejoin="round"`) + shine(-10, -4, 12, 4.5, -10, 0.9) +
  `<path d="M-24 21H24" stroke="#E6E1F2" stroke-width="${n(4 / s)}" stroke-linecap="round"/></g>`;

const face = (cx, cy, s) =>
  [-1, 1].map((k) => E(cx + k * 0.34 * s, cy - 0.06 * s, 0.085 * s, 0.11 * s, INK, NS) +
    C(cx + k * 0.34 * s + 0.03 * s, cy - 0.11 * s, 0.035 * s, WH, NS) +
    E(cx + k * 0.58 * s, cy + 0.2 * s, 0.13 * s, 0.08 * s, CORAL, ' opacity=".6" stroke="none"')).join('') +
  `<path d="M${n(cx - 0.2 * s)} ${n(cy + 0.16 * s)}Q${n(cx)} ${n(cy + 0.4 * s)} ${n(cx + 0.2 * s)} ${n(cy + 0.16 * s)}" fill="none" stroke="${INK}" stroke-width="${n(0.07 * s)}" stroke-linecap="round"/>`;

function sun(cx, cy, r) {
  let rays = '';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3, s = 0.17;
    const p = (ang, rr) => `${n(cx + Math.cos(ang) * rr)} ${n(cy + Math.sin(ang) * rr)}`;
    rays += `M${p(a - s, r * 1.12)}L${p(a, r * 1.55)}L${p(a + s, r * 1.12)}Z`;
  }
  return ink(4.5, P(rays, GOLD) + C(cx, cy, r, '#FFD95E')) + shine(cx - r * 0.42, cy - r * 0.5, r * 0.3, r * 0.14, -30, 0.7) + face(cx, cy + r * 0.05, r);
}

const flower = (x, y, r, c) =>
  ink(3, [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return C(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85, r * 0.62, c);
  }).join('') + C(x, y, r * 0.48, GOLD));
const bush = (x, y, s, c1 = MINT, c2 = GREEN) =>
  ink(4.5, C(x - 26 * s, y, 26 * s, c2) + C(x + 26 * s, y + 2 * s, 24 * s, c2) + C(x, y - 14 * s, 32 * s, c1)) + shine(x - 12 * s, y - 28 * s, 10 * s, 5 * s);
const bubble = (x, y, r) => C(x, y, r, WH, ` fill-opacity=".6" stroke="${INK}" stroke-width="${r > 10 ? 3.5 : 2.6}"`) + shine(x - r * 0.35, y - r * 0.38, r * 0.3, r * 0.17, -35, 0.95);
const grass = (list, c = GREEN) =>
  list.map(([x, y]) => soft(`M${x - 10} ${y}L${x - 6} ${y - 12}M${x} ${y}V${y - 16}M${x + 10} ${y}L${x + 6} ${y - 12}`, c, 4)).join('');

/** Wall + floor for the dollhouse rooms. */
const roomBase = (wall, floor, fy, trim = CREAM) =>
  R(0, 0, 1000, 600, wall) + R(-10, fy, 1020, 620 - fy, floor) +
  ink(4.5, R(-10, fy - 16, 1020, 18, trim)) + soft(`M0 ${fy + 3}H1000`, INK, 2.5);
const planks = (fy, color, rows = 3) => {
  let d = '';
  const h = (600 - fy) / rows;
  for (let i = 1; i <= rows; i++) {
    const y = n(fy + h * i);
    if (i < rows) d += `M0 ${y}H1000`;
    for (let x = (i % 2) * 90 + 60; x < 1000; x += 180) d += `M${x} ${n(fy + h * (i - 1) + 4)}V${n(y - 4)}`;
  }
  return soft(d, color, 3);
};

// ------------------------------------------------------------------------------------- worlds

function castle() {
  const tower = (x, w, top, apex, body, roof, flag) => {
    const m = x + w / 2;
    return R(x, top, w, -top, body) +
      L(`M${m} ${apex}V${apex - 36}`) + P(`M${m} ${apex - 36}L${m + 34} ${apex - 26}L${m} ${apex - 16}Z`, flag) +
      P(`M${x - 13} ${top + 4}C${x + w * 0.2} ${top - 16} ${m - 6} ${apex + 30} ${m} ${apex}C${m + 6} ${apex + 30} ${x + w * 0.8} ${top - 16} ${x + w + 13} ${top + 4}Z`, roof) +
      R(m - 11, top + 34, 22, 34, CREAM, 11) + shine(x + 13, top + 50, 5, 20, 0);
  };
  let merl = '';
  for (let i = 0; i < 4; i++) merl += R(-70 + i * 38, -152, 26, 24, PINK, 5);
  return ink(5.5,
    tower(-138, 66, -168, -252, BUBBLE, LILAC, GOLD) + tower(72, 66, -168, -252, BUBBLE, LILAC, GOLD) +
    merl + R(-78, -134, 156, 134, PINK) +
    tower(-38, 76, -212, -306, BUBBLE, LILAC, CORAL) +
    P(heartD(0, -80, 9), WH) +
    R(-62, -112, 20, 30, CREAM, 10) + R(42, -112, 20, 30, CREAM, 10) +
    P('M-27 0V-34A27 27 0 0 1 27 -34V0Z', GOLD) + L('M0 -60V0', 3.5)) +
  shine(-60, -122, 9, 4, 0) + shine(-56, -62, 5, 14, 0);
}

const worldCastle = () => {
  const id = 'world-castle';
  return scene(lin(`${id}-sky`, '#F9C4E1', '#FFE6F2'),
    R(0, 0, 1000, 600, `url(#${id}-sky)`) +
    sun(712, 100, 44) +
    cloud(250, 120, 1.25) + cloud(905, 205, 0.85) + cloud(395, 60, 0.7) +
    sparkles([[160, 230, 13, GOLD], [610, 72, 11], [860, 90, 12, GOLD], [300, 200, 9], [800, 300, 9]]) +
    // far lilac hills, castle hill, front meadow
    ink(5, P('M-10 380C90 330 190 318 300 352C380 318 450 300 520 320C640 290 760 300 860 340C920 320 970 322 1010 335V610H-10Z', '#E3CCFF')) +
    ink(5, P('M-10 430C120 400 290 330 410 318Q500 306 590 318C710 330 880 400 1010 430V610H-10Z', '#A6EFC6')) +
    shine(300, 360, 70, 10, -14, 0.45) +
    `<g transform="translate(500 322) scale(.72)">${castle()}</g>` +
    ink(5, P('M-10 478C170 448 360 492 520 474C690 456 860 446 1010 474V610H-10Z', '#7FE3AA')) +
    ink(4.5, P('M488 322C470 380 552 400 520 446C488 490 424 524 414 610H604C600 540 640 490 602 446C578 410 512 372 512 322Z', SAND)) +
    soft('M505 360q-6 8 2 14M548 430q8 6 0 12M500 520q-8 8 0 16M540 576q8 6 0 12', '#F2CF8E', 4) +
    grass([[210, 520], [330, 560], [690, 548], [800, 512], [372, 594], [660, 588]], '#3CC47C') +
    bush(175, 432, 1, MINT, GREEN) + bush(835, 428, 0.9, MINT, GREEN) +
    flower(165, 535, 13, BUBBLE) + flower(240, 572, 11, WH) + flower(132, 585, 10, LILAC) +
    flower(830, 545, 13, PINK) + flower(770, 582, 11, WH) + flower(890, 578, 10, GOLD) +
    flower(370, 520, 8, CORAL) + flower(650, 520, 8, LILAC));
};

const worldReef = () => {
  const id = 'world-reef';
  const ray = (x, w, lean) => P(`M${x} -10L${x + w} -10L${x + w + lean} 600L${x + lean - w * 0.6} 600Z`, WH, ' opacity=".22"');
  const shell = (x, y, c) => ink(3.5,
    P(`M${x - 20} ${y}C${x - 22} ${y - 28} ${x + 22} ${y - 28} ${x + 20} ${y}Z`, c) +
    L(`M${x} ${y}V${y - 18}M${x - 10} ${y}L${x - 6} ${y - 16}M${x + 10} ${y}L${x + 6} ${y - 16}`, 2.5));
  // Tube coral: a row of rounded pipes with dark openings.
  const pipes = (list, c) => ink(4.5, list.map(([x, top, w]) =>
    P(`M${x - w / 2} 520V${top}A${w / 2} ${w / 2 * 0.5} 0 0 1 ${x + w / 2} ${top}V520Z`, c) +
    E(x, top, w / 2 - 5, w / 4 - 3, '#C2477E', ' stroke-width="3"')).join('')) +
    list.map(([x, top, w]) => shine(x - w / 4, top + 26, 3, 12, 0, 0.55)).join('');
  const fan = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">` +
    ink(n(5 / s), P('M0 0C-40 -18 -66 -64 -56 -110Q-42 -130 -24 -116Q-6 -142 14 -120Q36 -136 50 -112C66 -64 40 -18 0 0Z', c) +
      L('M0 -4L-34 -100M0 -4L-4 -116M0 -4L30 -104M-46 -70Q0 -96 46 -70M-34 -36Q0 -54 34 -36', n(3.5 / s))) +
    shine(-36, -96, 5, 13, 20, 0.5) + `</g>`;
  return scene(lin(`${id}-sea`, '#D6F7FF', AQUA),
    R(0, 0, 1000, 600, `url(#${id}-sea)`) +
    ray(250, 60, -120) + ray(430, 40, -60) + ray(600, 70, 40) + ray(780, 45, 110) +
    soft('M0 34q40 -16 80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0', WH, 5) +
    // faint far reef for depth
    P('M-10 470C30 400 80 430 120 380C160 420 210 400 240 440C290 410 330 440 370 470H-10Z', '#A9E9F6') +
    P('M630 470C670 420 700 440 730 400C770 430 820 380 860 420C900 400 960 410 1010 430V470H630Z', '#A9E9F6') +
    // seaweed behind
    tube('M140 500C112 440 168 400 140 330C124 290 148 262 140 230', 14, MINT) +
    tube('M392 520C412 470 380 440 402 396C414 372 398 352 404 336', 12, GREEN) +
    tube('M612 520C590 470 630 430 606 380', 12, MINT) +
    tube('M890 500C918 440 866 400 894 330C910 296 888 270 896 246', 14, GREEN) +
    // left cluster: rock, branching coral, pink tube coral, small fan
    ink(5, P('M110 506C104 466 140 444 184 450C210 420 262 424 286 452C320 448 346 474 340 506Z', '#C9B8F2')) + shine(170, 462, 18, 6, -10, 0.5) +
    tube('M234 452C232 400 238 370 212 330M234 404C260 382 278 364 276 326M230 422C202 408 188 394 178 362M270 364C292 352 302 342 306 320', 20, CORAL) +
    shine(207, 348, 4, 10, -30, 0.6) + shine(272, 342, 4, 9, 10, 0.6) +
    pipes([[316, 444, 30], [350, 418, 34], [380, 462, 26]], BUBBLE) +
    fan(150, 470, 0.7, LILAC) +
    // right cluster: rock, big lilac fan, coral blob, tube coral
    ink(5, P('M660 506C654 470 690 446 734 452C764 426 820 428 846 456C884 452 906 480 900 506Z', '#C9B8F2')) + shine(712, 466, 18, 6, -10, 0.5) +
    fan(770, 458, 1.25, LILAC) +
    ink(5, E(676, 488, 44, 32, CORAL)) + ink(3, L('M644 486q8 -12 16 0t16 0t16 0t16 0M652 468q8 -10 16 0t16 0t16 0')) + shine(660, 470, 10, 4, -10, 0.5) +
    pipes([[846, 430, 30], [876, 452, 26]], GOLD) +
    // sandy floor, higher at the sides
    ink(5, P('M-10 492C80 484 180 512 300 512C440 516 560 520 700 508C820 500 900 486 1010 494V610H-10Z', SAND)) +
    [[160, 560], [300, 580], [470, 548], [540, 590], [720, 560], [880, 586], [610, 540], [90, 590]].map(([x, y]) => E(x, y, 7, 4, '#F2CF8E')).join('') +
    shell(430, 572, BUBBLE) + shell(815, 562, '#FFD9A8') +
    ink(4, P(starD(600, 566, 22, 10), CORAL)) + shine(594, 556, 4, 2.5, -20, 0.6) +
    ink(3, E(240, 572, 12, 7, '#D9D2E6') + E(256, 582, 9, 6, '#ECE8F3')) +
    // bubbles rising from the reef
    bubble(352, 360, 14) + bubble(336, 318, 9) + bubble(356, 284, 11) + bubble(342, 250, 6) +
    bubble(700, 330, 13) + bubble(684, 290, 8) + bubble(704, 254, 10) + bubble(690, 222, 6) +
    bubble(170, 190, 10) + bubble(860, 150, 10) + bubble(540, 120, 7));
};

// ------------------------------------------------------------------------------------- rooms

const roomKitchen = () => {
  const id = 'room-kitchen';
  const jar = (x, y, w, h, c, lid) => ink(4, R(x, y - h, w, h, c, 10) + R(x - 3, y - h - 10, w + 6, 12, lid, 5)) + shine(x + 8, y - h + 14, 3, 8, 0, 0.6);
  let doors = '';
  for (const x of [30, 180, 330]) doors += R(x, 408, 130, 110, '#FFC4DC', 12) + C(x + 65, 428, 6, GOLD);
  return scene(
    `<pattern id="${id}-stripe" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#FFF3C4"/><rect width="28" height="64" fill="#FFEDAA"/></pattern>` +
    `<pattern id="${id}-tile" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="${CREAM}"/><path d="M0 1H40M1 0V34" stroke="#F4DFA8" stroke-width="3"/></pattern>` +
    `<pattern id="${id}-check" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="${CREAM}"/><path d="M0 0H40V40H0ZM40 40H80V80H40Z" fill="#FFD3E4"/></pattern>`,
    R(0, 0, 1000, 600, `url(#${id}-stripe)`) +
    R(0, 306, 1000, 70, `url(#${id}-tile)`) + soft('M0 306H1000', '#F0D48A', 4) +
    // window with a scalloped valance
    ink(5, R(400, 80, 200, 170, CREAM, 20) + R(416, 96, 168, 138, '#BFE9FF', 10)) +
    cloud(470, 140, 0.55) + ink(4.5, L('M500 96V234M416 165H584')) + shine(440, 120, 14, 5, -30, 0.7) +
    ink(4.5, P('M384 70H616V92Q604 108 587 92Q571 108 558 92Q542 108 529 92Q513 108 500 92Q484 108 471 92Q455 108 442 92Q426 108 413 92Q396 108 384 92Z', BUBBLE) +
      R(386, 246, 228, 16, PINK, 8)) +
    // wall clock and shelf with jars
    ink(5, C(250, 96, 46, CORAL)) + ink(4, C(250, 96, 34, WH)) + shine(226, 66, 10, 4, -30, 0.6) +
    ink(4, L('M250 96V74M250 96L266 104') + C(250, 96, 4, INK)) +
    jar(150, 206, 44, 54, '#DDF7FF', LAGOON) + jar(210, 206, 36, 40, '#FFE6F2', PINK) + jar(262, 206, 50, 64, '#F2E8FF', LILAC) +
    ink(4.5, R(132, 206, 210, 16, '#FFB86B', 8) + P('M160 222L172 246L184 222Z', '#FFB86B') + P('M290 222L302 246L314 222Z', '#FFB86B')) +
    // fridge
    ink(5, R(728, 128, 156, 400, '#BCEFFF', 26) + L('M728 268H884') + R(746, 186, 14, 60, WH, 7) + R(746, 290, 14, 80, WH, 7)) +
    ink(3.5, P(heartD(830, 230, 7), PINK) + C(800, 320, 10, GOLD) + P(starD(840, 344, 14, 6), LILAC)) +
    shine(752, 150, 6, 16, 0, 0.7) + shine(860, 400, 5, 70, 0, 0.35) +
    // pink counter with cabinets and an oven
    R(-10, 392, 738, 136, '#FFB3D1') + ink(4.5, doors) +
    ink(4.5, R(490, 400, 220, 120, '#FFDCEB', 14) + R(510, 440, 180, 66, '#6E5A9A', 12) + R(530, 418, 140, 12, PINK, 6)) +
    shine(540, 460, 18, 5, -10, 0.45) +
    ink(5, L('M-10 392H728V528H-10')) +
    ink(5, R(-20, 368, 760, 28, PINK, 12)) + shine(140, 376, 60, 4, 0, 0.55) +
    // floor
    R(-10, 528, 1020, 82, `url(#${id}-check)`) + ink(5, L('M-10 528H1010')));
};

const roomBedroom = () => {
  const id = 'room-bedroom';
  return scene(
    `<pattern id="${id}-dots" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#F0E4FF"/><circle cx="18" cy="18" r="6" fill="#E3D0FF"/><circle cx="53" cy="53" r="6" fill="#E3D0FF"/></pattern>` +
    lin(`${id}-night`, '#5B4BA8', '#8C74D6'),
    R(0, 0, 1000, 600, `url(#${id}-dots)`) +
    roomBase('none', '#D9C2FF', 476) + planks(476, '#C7A9FA') +
    // arched night window with curtains
    ink(5, P('M392 270V170A108 108 0 0 1 608 170V270Z', CREAM)) +
    ink(4.5, P('M408 256V172A92 92 0 0 1 592 172V256Z', `url(#${id}-night)`)) +
    ink(4, P('M548 120A34 34 0 1 0 572 176A28 28 0 1 1 548 120Z', GOLD)) + shine(548, 140, 4, 9, 10, 0.6) +
    sparkles([[450, 140, 11, GOLD], [500, 210, 8], [460, 226, 6, GOLD], [520, 130, 6]], WH, 2.5) +
    ink(4.5, L('M500 80V256M408 190H592')) +
    ink(5, P('M372 64C352 140 384 210 362 286L408 286C396 220 418 150 400 70Z', BUBBLE) +
      P('M628 64C648 140 616 210 638 286L592 286C604 220 582 150 600 70Z', BUBBLE) + R(380, 266, 240, 18, PINK, 9)) +
    tube('M356 54H644', 8, GOLD) + ink(4, C(352, 54, 11, PINK) + C(648, 54, 11, PINK)) +
    // little framed star above the bed
    ink(5, R(190, 140, 100, 90, GOLD, 14) + R(204, 154, 72, 62, CREAM, 6)) + ink(3.5, P(starD(240, 187, 22, 10), BUBBLE)) +
    // bed
    ink(5, P('M108 470V320Q108 280 148 280Q188 280 188 320V470Z', PINK) +
      R(150, 384, 238, 48, WH, 14) + P('M150 396H388V448Q388 466 370 466H168Q150 466 150 448Z', BUBBLE) +
      P('M360 470V372Q360 348 384 348Q408 348 408 372V470Z', PINK) +
      E(206, 372, 40, 20, WH)) +
    ink(3, L('M190 420q12 10 24 0t24 0t24 0t24 0t24 0t24 0t24 0')) +
    shine(128, 316, 6, 18, 0, 0.6) + shine(196, 364, 14, 5, -10, 0.8) +
    // wardrobe
    ink(5, R(690, 196, 180, 278, '#C9A6FF', 18) + P('M700 196Q780 140 860 196Z', LILAC) + L('M780 210V460') +
      R(700, 470, 22, 20, LILAC, 6) + R(838, 470, 22, 20, LILAC, 6)) +
    ink(4, C(766, 330, 8, GOLD) + C(794, 330, 8, GOLD) + P(heartD(735, 290, 7), BUBBLE) + P(heartD(825, 290, 7), BUBBLE)) +
    shine(712, 230, 6, 26, 0, 0.55) +
    // round rug
    ink(5, E(500, 548, 210, 34, BUBBLE)) + E(500, 548, 172, 22, 'none', ` stroke="${WH}" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round"`));
};

const roomCraft = () => {
  const id = 'room-craft';
  const flags = [PINK, GOLD, LAGOON, LILAC, CORAL, MINT, PINK, GOLD, LAGOON, LILAC, CORAL];
  let bunting = '';
  flags.forEach((c, i) => {
    const x = 90 + i * 82, y = 46 + Math.sin((i / (flags.length - 1)) * Math.PI) * 30;
    bunting += P(`M${x - 24} ${n(y)}L${x + 24} ${n(y)}L${x} ${n(y + 46)}Z`, c);
  });
  const paintCup = (x, c) => ink(4, R(x - 16, 384, 32, 28, c, 8)) + shine(x - 8, 392, 3, 6, 0, 0.6);
  const splat = (x, y, r, c) => P(`M${x - r} ${y}C${x - r} ${y - r * 0.7} ${x + r * 0.2} ${y - r * 0.8} ${x + r * 0.6} ${y - r * 0.5}C${x + r * 1.2} ${y - r * 0.2} ${x + r} ${y + r * 0.5} ${x + r * 0.3} ${y + r * 0.6}C${x - r * 0.4} ${y + r * 0.8} ${x - r} ${y + r * 0.4} ${x - r} ${y}Z`, c, ' opacity=".7"');
  return scene(
    `<pattern id="${id}-stripe" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#E2FAEF"/><rect width="34" height="80" fill="#D5F6E6"/></pattern>`,
    R(0, 0, 1000, 600, `url(#${id}-stripe)`) +
    roomBase('none', '#ABE9CB', 486) + planks(486, '#93DDB8') +
    splat(140, 560, 16, PINK) + splat(860, 540, 14, BLUE) + splat(760, 584, 10, GOLD) + splat(250, 590, 10, LILAC) +
    // bunting
    ink(4.5, L('M40 40Q500 110 960 40') + bunting) +
    // easel with a rainbow painting
    tube('M190 470L240 150M290 470L240 150M240 300V476', 10, '#E9A867') +
    ink(5, R(150, 176, 180, 140, CREAM, 10)) +
    tube('M180 300A60 60 0 0 1 300 300', 12, CORAL) + tube('M196 300A44 44 0 0 1 284 300', 10, GOLD) + tube('M212 300A28 28 0 0 1 268 300', 8, LAGOON) +
    ink(3.5, C(296, 210, 14, GOLD)) +
    ink(4.5, R(140, 314, 200, 18, '#E9A867', 8)) +
    // framed pictures
    ink(5, R(624, 128, 150, 120, GOLD, 16) + R(640, 144, 118, 88, '#DDF7FF', 6) + P('M640 232V206Q670 180 700 204Q726 188 758 206V232Z', MINT) + C(726, 172, 12, CORAL)) +
    ink(5, R(796, 150, 90, 96, BUBBLE, 16) + R(810, 164, 62, 68, CREAM, 6)) + ink(3.5, P(heartD(841, 214, 10), PINK)) +
    ink(5, R(690, 278, 110, 76, LILAC, 14) + R(704, 292, 82, 48, CREAM, 6)) + ink(3, P(starD(745, 318, 16, 7), GOLD)) +
    shine(638, 140, 10, 4, 0, 0.7) +
    // worktable
    tube('M318 432L300 560M682 432L700 560', 12, '#E9A867') +
    ink(5, R(270, 410, 460, 26, GOLD, 13)) + shine(330, 418, 40, 4, 0, 0.55) +
    // crayon cup and paint pots at the table ends
    tube('M300 378L292 344', 7, PINK) + tube('M310 378L314 338', 7, BLUE) + tube('M320 378L332 350', 7, MINT) +
    ink(4.5, R(290, 366, 40, 46, CORAL, 10)) + shine(298, 376, 3, 8, 0, 0.6) +
    paintCup(640, PINK) + paintCup(680, LAGOON) + ink(3.5, C(640, 384, 10, '#FF2E8C') + C(680, 384, 10, '#0FA3BE')));
};

const roomBath = () => {
  const id = 'room-bath';
  let foam = '';
  [[262, 356, 26], [300, 342, 30], [348, 350, 24], [392, 344, 22], [434, 360, 16], [470, 364, 14], [506, 362, 15], [540, 364, 13], [574, 360, 16], [612, 346, 22], [652, 340, 30], [700, 350, 26], [740, 356, 22]]
    .forEach(([x, y, r]) => { foam += C(x, y, r, WH); });
  return scene(
    `<pattern id="${id}-tile" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="#D3ECFF"/><path d="M0 1.5H56M1.5 0V56" stroke="${WH}" stroke-width="4"/></pattern>` +
    `<pattern id="${id}-floor" width="72" height="72" patternUnits="userSpaceOnUse"><rect width="72" height="72" fill="#EAF6FF"/><path d="M0 0H36V36H0ZM36 36H72V72H36Z" fill="#BFE3FF"/></pattern>`,
    R(0, 0, 1000, 600, '#EAF6FF') + R(0, 168, 1000, 340, `url(#${id}-tile)`) +
    ink(4.5, R(-10, 160, 1020, 18, '#A8D8FF')) +
    R(-10, 506, 1020, 104, `url(#${id}-floor)`) + ink(5, L('M-10 506H1010')) +
    // towel rail + towel
    tube('M140 150H300', 8, GOLD) + ink(4, C(136, 150, 9, GOLD) + C(304, 150, 9, GOLD)) +
    ink(5, P('M168 146H272V286Q272 300 258 300H182Q168 300 168 286Z', BUBBLE)) +
    soft('M170 252H270M170 268H270', WH, 7) + shine(186, 176, 5, 16, 0, 0.55) +
    // oval mirror
    ink(5, E(790, 150, 70, 86, BUBBLE) + E(790, 150, 54, 70, '#DDF6FF')) +
    soft('M758 140L792 100M768 170L812 118', WH, 8) +
    // clawfoot tub with foam
    ink(4.5, P('M318 488L300 520L340 520L350 488Z', GOLD) + P('M682 488L700 520L660 520L650 488Z', GOLD)) +
    tube('M736 372V318Q736 290 708 290Q690 290 690 306', 10, GOLD) +
    ink(5, foam) + shine(296, 330, 8, 4, -20, 0.9) + shine(650, 326, 8, 4, -20, 0.9) +
    ink(5, P('M240 372H760C760 450 712 500 626 500H374C288 500 240 450 240 372Z', WH)) +
    P('M262 430C300 486 360 486 400 486H600C660 486 720 470 740 430C740 470 700 496 626 496H374C300 496 262 470 262 430Z', '#CDE9FF') +
    ink(5, R(226, 360, 548, 26, '#BFE3FF', 13)) + shine(300, 372, 50, 4, 0, 0.8) + shine(290, 420, 8, 22, -10, 0.6) +
    // a few floating bubbles
    bubble(470, 288, 14) + bubble(520, 246, 9) + bubble(560, 292, 7) + bubble(420, 230, 7) + bubble(600, 190, 11));
};

const roomTennis = () => {
  const id = 'room-tennis';
  // Court in perspective: far baseline y 268 (x 300..700), near baseline y 600 (x 70..930).
  const at = (y, f) => { const t = (y - 268) / 332, l = 300 - 230 * t, r = 700 + 230 * t; return n(l + (r - l) * f); };
  const netY = 386, nl = at(netY, 0) - 30, nr = at(netY, 1) + 30;
  return scene(lin(`${id}-sky`, '#BDE8FF', '#EAF8FF') +
    `<pattern id="${id}-net" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${WH}" fill-opacity=".3"/><path d="M0 1H14M1 0V14" stroke="${INK}" stroke-width="1.6" stroke-opacity=".5"/></pattern>`,
    R(0, 0, 1000, 600, `url(#${id}-sky)`) +
    sun(730, 110, 44) + cloud(250, 110, 1.15) + cloud(470, 70, 0.7) + cloud(900, 180, 0.8) +
    // hedge, lawn and court
    ink(5, P('M-10 262C10 220 60 224 80 246C100 214 150 214 170 244C196 212 246 214 266 246C290 216 340 214 364 244C390 214 440 214 462 246C486 214 536 214 558 246C582 214 632 214 656 246C680 214 730 214 752 246C776 214 826 214 848 246C872 214 922 214 944 246C964 220 1000 222 1010 240V300H-10Z', GREEN)) +
    ink(5, R(-10, 256, 1020, 360, '#A6E8A0')) +
    ink(5, P(`M300 268H700L930 600H70Z`, '#6FAEFF')) +
    soft(`M${at(268, 0.12)} 268L${at(600, 0.12)} 600M${at(268, 0.88)} 268L${at(600, 0.88)} 600` +
      `M${at(320, 0.12)} 320H${at(320, 0.88)}M${at(500, 0.12)} 500H${at(500, 0.88)}M500 320V500`, WH, 6) +
    soft('M300 268H700', WH, 7) +
    // net
    tube(`M${nl} ${netY}V${netY - 66}M${nr} ${netY}V${netY - 66}`, 8, '#5B4B8A') +
    R(nl, netY - 56, nr - nl, 50, `url(#${id}-net)`) +
    ink(4.5, R(nl, netY - 62, nr - nl, 12, WH, 6)) + ink(3, L(`M${nl} ${netY - 6}H${nr}`)) +
    // spare balls by the side
    ink(3.5, C(150, 560, 16, '#DDF56A') + C(182, 572, 14, '#DDF56A')) +
    soft('M138 552Q150 562 162 552M172 566Q182 574 192 564', WH, 3) +
    flower(890, 290, 10, BUBBLE) + flower(110, 300, 10, WH));
};

const roomPool = () => {
  const id = 'room-pool';
  const ropes = [336, 432].map((y) =>
    R(196, y, 504, 16, `url(#${id}-rope)`) + ink(3.5, C(188, y + 8, 9, GOLD) + C(708, y + 8, 9, GOLD))).join('');
  return scene(lin(`${id}-sky`, '#BDE8FF', '#FFF4D6') + lin(`${id}-water`, '#8FE6F7', '#3CC5E6') +
    `<pattern id="${id}-deck" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${SAND}"/><path d="M0 1.5H60M1.5 0V60" stroke="#F5D597" stroke-width="3"/></pattern>` +
    `<pattern id="${id}-rope" width="28" height="16" patternUnits="userSpaceOnUse"><circle cx="7" cy="8" r="6" fill="${PINK}" stroke="${INK}" stroke-width="2.5"/><circle cx="21" cy="8" r="6" fill="${WH}" stroke="${INK}" stroke-width="2.5"/></pattern>`,
    R(0, 0, 1000, 600, `url(#${id}-sky)`) +
    sun(330, 96, 42) + cloud(580, 80, 0.85) + cloud(720, 130, 0.6) +
    // distant palm-ish bushes
    bush(90, 200, 1, MINT, GREEN) + bush(930, 196, 0.9, MINT, GREEN) +
    ink(5, R(-10, 196, 1020, 420, `url(#${id}-deck)`)) +
    // pool
    ink(5, R(130, 238, 640, 290, CREAM, 44)) +
    ink(5, R(156, 262, 588, 242, `url(#${id}-water)`, 30)) +
    soft('M196 296q20 -10 40 0t40 0M560 300q20 -10 40 0t40 0M300 396q20 -10 40 0t40 0t40 0M520 480q20 -10 40 0t40 0M220 470q20 -10 40 0', WH, 5) +
    shine(220, 286, 40, 6, -6, 0.5) + ropes +
    // ladder
    tube('M620 290V246Q620 224 642 224Q660 224 660 240M660 290V246Q660 224 682 224Q700 224 700 240', 7, '#D9D2E6') +
    soft('M620 270H660', INK, 3) +
    // umbrella + lounger on the right
    tube('M850 550L860 230', 8, WH) +
    ink(5, P('M752 252Q858 140 964 252Q946 268 928 252Q910 268 892 252Q874 268 856 252Q838 268 820 252Q802 268 788 252Q770 268 752 252Z', PINK) +
      P('M820 252Q830 190 858 168Q840 200 856 252Z', WH) + P('M892 252Q900 200 858 168Q882 200 928 252Z', WH) + C(858, 164, 8, GOLD)) +
    shine(800, 222, 14, 5, -30, 0.6) +
    ink(4.5, P('M790 520L900 520L938 468L922 462L894 500L790 500Z', LAGOON) + L('M800 520V546M890 520V546')) +
    ink(4, R(870, 470, 40, 14, WH, 7)) +
    // ring float on the deck
    ink(4.5, E(120, 560, 46, 22, CORAL) + E(120, 556, 20, 9, SAND)) + soft('M84 552l10 10M146 546l10 10', WH, 7));
};

const roomGolf = () => {
  const id = 'room-golf';
  const tree = (x, y, s) => tube(`M${x} ${y}V${y - 36 * s}`, 8 * s, '#B07A4E') + ink(4.5, C(x, y - 52 * s, 28 * s, GREEN)) + shine(x - 10 * s, y - 64 * s, 8 * s, 4 * s);
  return scene(lin(`${id}-sky`, '#BDE8FF', '#EFFAFF'),
    R(0, 0, 1000, 600, `url(#${id}-sky)`) +
    sun(320, 100, 42) + cloud(640, 80, 1) + cloud(820, 150, 0.7) + cloud(110, 210, 0.6) +
    ink(5, P('M-10 300C120 210 260 210 400 290C520 230 640 200 760 250C860 200 950 220 1010 250V420H-10Z', '#8EDC8E')) +
    tree(170, 262, 1) + tree(830, 236, 0.9) + tree(710, 256, 0.7) +
    ink(5, P('M-10 350C200 300 380 330 500 336C680 340 840 300 1010 330V610H-10Z', '#7ED98F')) +
    P('M-10 430C200 390 420 420 560 410C740 396 880 420 1010 410V470C820 480 640 460 480 476C300 494 120 470 -10 486Z', '#8BE09A') +
    // putting green with the hole and flag
    ink(5, E(580, 460, 270, 78, '#B9F2A8')) + shine(440, 434, 60, 8, -4, 0.35) +
    E(640, 466, 24, 9, INK) +
    tube('M640 464V250', 6, CREAM) +
    ink(5, P('M644 252C680 246 700 270 736 262C724 280 724 290 738 304C702 312 680 290 644 296Z', PINK)) + shine(668, 266, 10, 4, 0, 0.6) +
    // bunker, ball, flowers
    ink(5, P('M160 510C170 474 240 470 290 484C340 496 350 530 320 544C270 560 180 552 160 510Z', SAND)) +
    soft('M200 520q20 -8 40 0M250 534q20 -8 40 0', '#F2CF8E', 4) +
    ink(4, C(480, 486, 12, WH)) + E(477, 484, 1.8, 1.8, '#C9C2D8') + E(484, 489, 1.8, 1.8, '#C9C2D8') + E(475, 491, 1.8, 1.8, '#C9C2D8') +
    grass([[120, 590], [380, 566], [820, 560], [900, 590], [700, 584]], GREEN) +
    flower(860, 540, 11, WH) + flower(120, 560, 10, BUBBLE) + flower(900, 470, 9, GOLD));
};

const roomPiano = () => {
  const id = 'room-piano';
  let keys = '', blacks = '';
  for (let i = 1; i < 12; i++) keys += `M${130 + i * 26} 352V384`;
  [0, 1, 3, 4, 5, 7, 8, 10].forEach((i) => { blacks += R(146 + i * 26, 352, 14, 20, INK, 3, NS); });
  const note = (x, y, c) => ink(3.5, E(x, y, 11, 8, c) + L(`M${x + 10} ${y - 2}V${y - 38}Q${x + 18} ${y - 30} ${x + 26} ${y - 26}`));
  return scene(
    `<pattern id="${id}-stripe" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#FFE6F1"/><rect width="30" height="70" fill="#FFDCEC"/></pattern>`,
    R(0, 0, 1000, 600, `url(#${id}-stripe)`) +
    R(0, 330, 1000, 150, '#FFCCE2') + ink(4.5, R(-10, 322, 1020, 14, CREAM, 7)) +
    roomBase('none', '#F3B9D3', 480) + planks(480, '#E6A3C2') +
    // framed picture
    ink(5, R(520, 74, 170, 132, GOLD, 18) + R(538, 92, 134, 96, '#DDF7FF', 6) +
      P('M538 188V160Q570 132 604 158Q636 140 672 160V188Z', MINT)) + ink(3.5, P(heartD(604, 140, 9), PINK)) +
    shine(536, 86, 12, 4, 0, 0.7) +
    // upright piano
    ink(5, R(132, 210, 300, 150, LILAC, 14) + R(122, 196, 320, 22, '#9B6FE8', 11) +
      R(160, 236, 244, 92, '#C9A9FF', 10) + R(120, 342, 324, 46, WH, 8) + R(132, 386, 300, 90, LILAC, 6) +
      R(150, 470, 20, 18, '#9B6FE8', 4) + R(394, 470, 20, 18, '#9B6FE8', 4)) +
    blacks + soft(keys, INK, 2.5) + ink(4.5, L('M120 352H444')) +
    shine(152, 230, 5, 16, 0, 0.55) + shine(160, 400, 5, 20, 0, 0.45) +
    ink(3.5, R(240, 250, 84, 60, CREAM, 6)) + soft('M252 266H312M252 280H312M252 294H300', '#D7B4FF', 3) +
    // vase on the piano
    ink(4, C(380, 162, 12, CORAL) + C(400, 150, 12, GOLD) + C(362, 150, 11, PINK) + C(384, 140, 11, WH) +
      P('M370 196Q362 176 376 168H390Q404 176 396 196Z', LAGOON)) +
    // bench
    ink(4.5, R(200, 428, 160, 20, PINK, 10) + L('M216 448V500M344 448V500')) +
    // notes drifting up
    note(470, 260, BUBBLE) + note(830, 120, LILAC) + note(460, 160, GOLD) +
    // plant on the right
    ink(4.5, P('M820 380C780 340 770 300 790 270C810 300 820 340 820 380ZM826 380C840 320 870 296 900 290C890 330 860 360 826 380ZM822 380C800 300 820 240 846 222C852 280 840 330 822 380Z', GREEN) +
      P('M784 380H866L852 470H798Z', CORAL) + R(778, 374, 94, 18, PINK, 8)) + shine(796, 400, 4, 12, 0, 0.6) +
    // rug
    ink(5, E(560, 548, 230, 34, GOLD)) + E(560, 548, 190, 22, '#FFE28A', ` stroke="${PINK}" stroke-width="5"`));
};

// ------------------------------------------------------------------------------------- house front

const WINDOWS = [
  [115, 285, '#FFE28A'], [370, 285, '#D7B4FF'], [625, 285, '#B7F0D8'], [880, 285, '#BFE6FF'],
  [115, 520, '#C8F58A'], [370, 520, '#8FE0FF'], [625, 520, '#A8E8A0'], [880, 520, '#FFC9E3'],
];

const house = () => {
  const id = 'house';
  const win = ([x, y, c]) =>
    ink(5, R(x - 11, y - 11, 227, 192, CREAM, 26)) + ink(4.5, R(x, y, 205, 170, c, 16)) +
    ink(4.5, R(x - 20, y + 172, 245, 18, PINK, 9)) + shine(x + 40, y + 177, 30, 3, 0, 0.6);
  const earL = 'M318 168C318 110 330 56 352 26Q362 14 376 24C420 58 460 90 486 112Z';
  const earInL = 'M342 148C344 110 352 76 364 52C392 76 420 98 440 116Z';
  const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, a, b) => `${n(1200 - a)} ${b}`);
  return wrap('0 0 1200 760', 'xMidYMid meet',
    lin(`${id}-sky`, '#FFE6F2', '#F1E6FF') +
    `<pattern id="${id}-dots" width="56" height="56" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="5" fill="${BUBBLE}"/><circle cx="40" cy="38" r="4" fill="${LILAC}"/></pattern>`,
    R(0, 0, 1200, 760, `url(#${id}-sky)`) + R(0, 0, 1200, 760, `url(#${id}-dots)`, 0, ' opacity=".3"') +
    cloud(140, 130, 1.3) + cloud(1060, 110, 1.15) + cloud(250, 40, 0.6) + cloud(960, 230, 0.7) +
    sparkles([[60, 60, 12, GOLD], [1150, 200, 11, GOLD], [300, 200, 8], [1110, 40, 8]]) +
    // grass mound
    ink(6, E(600, 800, 800, 120, '#A6EFC6')) +
    bush(54, 690, 1.05, MINT, GREEN) + bush(1146, 694, 1, MINT, GREEN) +
    // ears sit behind the roof
    ink(6, P(earL, PINK) + P(mirror(earL), PINK)) + P(earInL, BUBBLE) + P(mirror(earInL), BUBBLE) +
    // body
    ink(6, R(90, 250, 1020, 470, '#FFC4E0', 24)) +
    P('M93 700H1107V704Q1107 717 1094 717H106Q93 717 93 704Z', '#F7A8CC') +
    ink(5, L('M92 700H1108')) +
    ink(5, R(80, 480, 1040, 22, BUBBLE, 11)) +
    // roof
    ink(6, P('M40 258L560 70Q600 56 640 70L1160 258Q1170 266 1156 268H44Q30 266 40 258Z', PINK)) +
    shine(420, 140, 90, 12, -20, 0.35) +
    ink(5, R(36, 246, 1128, 22, BUBBLE, 11)) +
    ink(4.5, C(600, 132, 30, CREAM) + C(600, 132, 20, '#D7B4FF') + L('M600 112V152M580 132H620', 4)) +
    ink(4, P(heartD(600, 62, 8), GOLD)) +
    // whiskers on the eaves
    ink(4.5, L('M64 222L4 202M60 238L0 238M64 254L8 272M1136 222L1196 202M1140 238L1200 238M1136 254L1192 272')) +
    WINDOWS.map(win).join('') +
    flower(40, 740, 12, BUBBLE) + flower(1160, 742, 12, WH) + flower(20, 700, 9, GOLD) + flower(1186, 706, 9, LILAC));
};

export const BACKDROPS = {
  'world-castle': worldCastle(),
  'world-reef': worldReef(),
  'room-kitchen': roomKitchen(),
  'room-bedroom': roomBedroom(),
  'room-craft': roomCraft(),
  'room-bath': roomBath(),
  'room-tennis': roomTennis(),
  'room-pool': roomPool(),
  'room-golf': roomGolf(),
  'room-piano': roomPiano(),
  house: house(),
};
