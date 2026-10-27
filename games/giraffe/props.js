// Props for Gigi's action scenes, drawn in the chunky-toy style (thick ink outlines, glossy blobs).
// Each returns an SVG string with its own viewBox; scenes size and place them around Gigi.

const INK = '#2B2340';
const svg = (vb, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ${extra}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const gloss = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const eyes = (x1, x2, y, r = 3.4) => [x1, x2].map(x =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.38}" fill="#fff" stroke="none"/>`).join('');
const cheeks = (x1, x2, y) => [x1, x2].map(x => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="2.8" fill="#FF8FB8" opacity=".8" stroke="none"/>`).join('');

// ---------- drink ----------

export const pondSvg = () => svg('0 0 320 120', ink(5,
  `<ellipse cx="160" cy="64" rx="150" ry="46" fill="#4DB8E8"/>` +
  `<ellipse cx="160" cy="58" rx="122" ry="30" fill="#7FD8F0" stroke="none"/>`) +
  gloss(110, 52, 30, 6, 0) +
  ink(4, `<path d="M236 62 C236 48 268 46 272 58 C276 70 250 76 240 70 L254 62 Z" fill="#4ADE9A"/>` +
    `<circle cx="66" cy="74" r="8" fill="#FF8FB8"/><circle cx="60" cy="68" r="6" fill="#FFB4C6"/><circle cx="72" cy="68" r="6" fill="#FFB4C6"/>`),
  'preserveAspectRatio="none" class="gg-pond-svg"');

export const dropSvg = () => svg('0 0 40 52', ink(3.5, `<path d="M20 4 C20 4 6 22 6 32 C6 42 13 48 20 48 C27 48 34 42 34 32 C34 22 20 4 20 4 Z" fill="#7FD8F0"/>`) + gloss(14, 30, 3, 6, 10));

// ---------- shower ----------

export const showerHeadSvg = () => svg('0 0 200 220', ink(6,
  `<path d="M100 -20 V40 C100 70 120 80 140 80" fill="none" stroke="${INK}" stroke-width="26"/>` +
  `<path d="M100 -20 V40 C100 70 120 80 140 80" fill="none" stroke="#B9AFCC" stroke-width="16"/>` +
  `<path d="M104 92 C104 70 176 70 176 92 L184 118 H96 Z" fill="#D9D2E6"/>` +
  `<rect x="128" y="74" width="24" height="20" rx="6" fill="#B9AFCC"/>`) +
  ink(3, [108, 124, 140, 156, 172].map(x => `<circle cx="${x}" cy="112" r="3" fill="#4D96FF"/>`).join('')) + gloss(124, 88, 14, 4, 0));

export const towelSvg = () => svg('0 0 180 110', ink(5,
  `<path d="M14 18 C40 8 140 8 166 18 L160 96 C130 104 50 104 20 96 Z" fill="#FF8FB8"/>` +
  `<path d="M18 40 C50 34 130 34 162 40 M19 74 C50 80 130 80 161 74" fill="none" stroke="#fff" stroke-width="8"/>`) + gloss(50, 26, 18, 5, 0));

// ---------- doctor ----------

/** A white doctor's coat to wear over a cat sticker (same 100×100 box as the sticker). */
export const coatSvg = () => svg('0 0 100 100', ink(3.5,
  `<path d="M28 62 C26 76 26 88 28 96 H72 C74 88 74 76 72 62 C64 58 36 58 28 62 Z" fill="#fff"/>` +
  `<path d="M42 60 L50 76 L58 60" fill="#B7E3FF"/><path d="M50 76 V96" fill="none"/>` +
  `<rect x="58" y="80" width="10" height="10" rx="2" fill="#fff"/>`) +
  ink(2, `<path d="M63 82 V88 M60 85 H66" fill="none" stroke="#FF6B6B" stroke-width="2.6"/>`));

export const torchSvg = () => svg('0 0 140 60', `<path d="M60 30 L140 4 V56 Z" fill="#FFE08A" opacity=".75"/>` + ink(4,
  `<rect x="6" y="20" width="46" height="20" rx="8" fill="#B78CFF"/><path d="M52 16 H64 V44 H52 Z" fill="#FFC93C"/>`) + gloss(18, 24, 8, 2.5, 0));

// ---------- birthday ----------

/** A two-tier cake with `n` candles; each flame is a .gg-flame group so it can flicker and go out. */
export function cakeSvg(n) {
  const candles = [];
  const span = Math.min(120, 26 * n);
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 100 : 100 - span / 2 + (span / (n - 1)) * i;
    candles.push(ink(3.5, `<rect x="${x - 5}" y="38" width="10" height="30" rx="3" fill="${['#4D96FF', '#FF6B6B', '#4ADE9A', '#B78CFF', '#FFC93C'][i % 5]}"/>`) +
      `<g class="gg-flame" style="transform-origin:${x}px 36px">` + ink(3, `<path d="M${x} 14 C${x + 9} 26 ${x + 8} 36 ${x} 37 C${x - 8} 36 ${x - 9} 26 ${x} 14 Z" fill="#FFC93C"/>`) +
      `<path d="M${x} 24 C${x + 4} 30 ${x + 3} 34 ${x} 35 C${x - 3} 34 ${x - 4} 30 ${x} 24 Z" fill="#FF8A3C"/></g>`);
  }
  return svg('0 0 200 200', ink(5,
    `<ellipse cx="100" cy="182" rx="92" ry="14" fill="#D9D2E6"/>` +
    `<path d="M22 120 H178 V176 C178 182 22 182 22 176 Z" fill="#FFB4C6"/>` +
    `<path d="M22 120 H178 V136 C164 146 150 132 138 142 C124 152 112 134 100 144 C88 154 74 134 62 144 C50 152 36 136 22 142 Z" fill="#FFF8EE"/>` +
    `<path d="M44 70 H156 V122 H44 Z" fill="#FF5FA8"/>` +
    `<path d="M44 70 H156 V84 C144 92 132 80 120 88 C108 96 96 82 84 90 C72 98 58 84 44 90 Z" fill="#FFF8EE"/>`) +
    ['#FFC93C', '#4D96FF', '#4ADE9A', '#fff', '#B78CFF'].map((c, i) => `<rect x="${56 + i * 20}" y="${104 - (i % 2) * 8}" width="8" height="3.5" rx="1.75" fill="${c}" transform="rotate(${i * 37} ${60 + i * 20} ${106 - (i % 2) * 8})"/>`).join('') +
    candles.join('') + gloss(60, 128, 12, 3, 0));
}

/** Party hat in Gigi's own coordinates (her viewBox), to be placed inside her #head group. */
export const partyHatSvgGroup = () => `<g id="hat">` + ink(4,
  `<path d="M246 60 L282 -6 L298 58 C284 66 258 66 246 60 Z" fill="#FF5FA8"/>` +
  `<path d="M262 30 L292 30 M254 46 L296 46" fill="none" stroke="#FFC93C" stroke-width="6"/>` +
  `<circle cx="282" cy="-8" r="9" fill="#FFC93C"/>`) + gloss(262, 40, 4, 10, 25) + `</g>`;

export const balloonSvg = (color = '#FF6B6B') => svg('0 0 100 150', ink(4.5,
  `<path d="M50 112 C50 124 42 130 46 146" fill="none" stroke-width="3"/>` +
  `<path d="M50 6 C78 6 92 30 90 56 C88 86 66 108 50 110 C34 108 12 86 10 56 C8 30 22 6 50 6 Z" fill="${color}"/>` +
  `<path d="M44 108 L50 118 L56 108 Z" fill="${color}"/>`) + gloss(32, 34, 10, 16, 20));

export const RAINBOW = () => svg('0 0 400 220', ink(5, ['#FF6B6B', '#FFC93C', '#4ADE9A', '#4D96FF', '#B78CFF'].map((c, i) => {
  const ro = 190 - i * 24, ri = ro - 24;
  return `<path d="M${200 - ro} 210 A${ro} ${ro} 0 0 1 ${200 + ro} 210 L${200 + ri} 210 A${ri} ${ri} 0 0 0 ${200 - ri} 210 Z" fill="${c}"/>`;
}).join('')));

// ---------- jungle (Walk) ----------

/** Static far backdrop: misty green sky, distant waterfall, dappled light, ground. */
export const jungleBackSvg = () => svg('0 0 1000 600', `<defs><linearGradient id="gg-jsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B2F0E6"/><stop offset="1" stop-color="#DDF8EE"/></linearGradient></defs>` +
  `<rect width="1000" height="600" fill="url(#gg-jsky)"/>` + ink(5,
    `<path d="M440 150 C470 142 520 142 548 150 L566 330 C520 344 470 344 424 330 Z" fill="#D6F7FF"/>` +
    `<path d="M458 170 V300 M490 160 V312 M524 176 V300" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 12"/>` +
    `<path d="M-20 430 C200 404 420 424 600 414 C780 404 900 420 1020 410 V620 H-20 Z" fill="#5FC46A"/>` +
    `<path d="M-20 480 C240 462 520 486 760 470 C860 464 940 472 1020 468 V620 H-20 Z" fill="#8ED16F" stroke="none"/>`) +
  `<g fill="#FFE08A" opacity=".45"><ellipse cx="280" cy="500" rx="46" ry="14"/><ellipse cx="700" cy="530" rx="62" ry="18"/><ellipse cx="520" cy="470" rx="30" ry="9"/></g>`,
  'preserveAspectRatio="xMidYMid slice"');

/** Far trees layer tile (scrolls slowly). */
export const jungleFarTile = () => svg('0 0 1000 600', ink(5,
  [[60, 300, 120], [260, 270, 140], [470, 310, 110], [660, 260, 150], [880, 290, 130]].map(([x, y, r]) =>
    `<path d="M${x - 14} 440 V${y}" stroke="#4E3420" stroke-width="18" fill="none"/>` +
    `<path d="M${x - r} ${y + 20} C${x - r} ${y - r * 0.8} ${x + r} ${y - r * 0.8} ${x + r} ${y + 20} C${x + r * 0.5} ${y + 46} ${x - r * 0.5} ${y + 46} ${x - r} ${y + 20} Z" fill="#2F7A4B"/>`).join('')),
  'preserveAspectRatio="xMinYMax slice"');

/** Middle layer tile: trunks with hanging vines and hibiscus (scrolls at medium speed). */
export const jungleMidTile = () => svg('0 0 1000 600', ink(5,
  `<path d="M140 -10 V440 M720 -10 V430" stroke="#7A4E2B" stroke-width="34" fill="none"/>` +
  `<path d="M140 -10 V440 M720 -10 V430" stroke="#9A6A3A" stroke-width="10" fill="none" opacity=".6"/>` +
  `<path d="M-10 40 C120 160 260 160 400 40 M400 40 C520 150 640 150 760 40 M760 40 C860 140 940 140 1010 40" fill="none" stroke="#49A35F" stroke-width="9"/>` +
  [[200, 120], [330, 110], [480, 112], [600, 124], [830, 108], [930, 100]].map(([x, y]) =>
    `<path d="M${x} ${y} C${x + 14} ${y + 10} ${x + 12} ${y + 30} ${x} ${y + 34} C${x - 12} ${y + 30} ${x - 14} ${y + 10} ${x} ${y} Z" fill="#8ED16F"/>`).join('') +
  [[270, 140, '#FF5FA8'], [690, 136, '#FF8A3C'], [900, 128, '#FF5FA8']].map(([x, y, c]) =>
    [0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - 11}" rx="7" ry="12" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('') +
    `<circle cx="${x}" cy="${y}" r="5" fill="#FFC93C"/>`).join('')),
  'preserveAspectRatio="xMinYMax slice"');

/** Foreground layer tile: big leaves and ferns along the bottom (scrolls fast). */
export const jungleFrontTile = () => svg('0 0 1000 600', ink(5,
  [[40, 0], [330, 1], [600, 0], [860, 1]].map(([x, flip]) => {
    const s = flip ? -1 : 1;
    return `<path d="M${x} 620 C${x + 30 * s} 540 ${x + 110 * s} 500 ${x + 170 * s} 520 C${x + 130 * s} 560 ${x + 70 * s} 590 ${x} 620 Z" fill="#8ED16F"/>` +
      `<path d="M${x} 620 C${x + 60 * s} 570 ${x + 110 * s} 540 ${x + 160 * s} 524" fill="none" stroke-width="3.5"/>`;
  }).join('') +
  [[200, '#5FC46A'], [470, '#49A35F'], [760, '#5FC46A']].map(([x, c]) =>
    `<path d="M${x} 620 C${x - 30} 560 ${x - 70} 540 ${x - 90} 548 M${x} 620 C${x} 550 ${x + 10} 520 ${x + 20} 500 M${x} 620 C${x + 40} 566 ${x + 80} 552 ${x + 100} 556" fill="none" stroke="${c}" stroke-width="14"/>`).join('')),
  'preserveAspectRatio="xMinYMax slice"');

export const monkeySvg = () => svg('0 0 120 160', ink(4.5,
  `<path d="M60 0 V40" fill="none" stroke="#49A35F" stroke-width="7"/>` +
  `<path d="M60 40 C66 56 70 66 66 76" fill="none" stroke="#8A5A2B" stroke-width="10"/>` +
  `<path d="M40 110 C30 130 34 150 50 150" fill="none" stroke="#8A5A2B" stroke-width="7"/>` +
  `<ellipse cx="58" cy="112" rx="22" ry="26" fill="#A0703F"/><ellipse cx="58" cy="118" rx="13" ry="16" fill="#F4C58F" stroke="none"/>` +
  `<circle cx="30" cy="70" r="12" fill="#A0703F"/><circle cx="86" cy="70" r="12" fill="#A0703F"/>` +
  `<circle cx="30" cy="70" r="6" fill="#F4C58F" stroke="none"/><circle cx="86" cy="70" r="6" fill="#F4C58F" stroke="none"/>` +
  `<circle cx="58" cy="76" r="28" fill="#A0703F"/>` +
  `<path d="M38 82 C38 66 50 64 58 70 C66 64 78 66 78 82 C78 96 38 96 38 82 Z" fill="#F4C58F"/>`) +
  eyes(50, 66, 76) + cheeks(42, 74, 86) + ink(3, `<path d="M52 88 Q58 93 64 88" fill="none"/>`) + gloss(46, 60, 7, 3));

export const parrotSvg = () => svg('0 0 140 120', ink(4.5,
  `<path d="M40 70 C10 76 0 100 6 112 C26 104 40 94 50 80 Z" fill="#4D96FF"/>` +
  `<g class="gg-wing"><path d="M58 52 C40 20 64 4 92 10 C82 30 76 46 70 62 Z" fill="#4D96FF"/><path d="M66 46 C60 30 70 20 84 18" fill="none" stroke="#FFC93C" stroke-width="5"/></g>` +
  `<ellipse cx="70" cy="70" rx="34" ry="24" fill="#FF6B6B"/>` +
  `<circle cx="104" cy="54" r="20" fill="#FF6B6B"/>` +
  `<path d="M118 50 C134 52 136 66 124 72 C122 64 118 60 114 58 Z" fill="#FFC93C"/>`) +
  `<circle cx="104" cy="50" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/>` + eyes(105, 105, 50, 3.2) + gloss(62, 60, 12, 5));

export const frogLogSvg = () => svg('0 0 200 140', ink(5,
  `<rect x="10" y="92" width="180" height="44" rx="22" fill="#8A5A2B"/><ellipse cx="32" cy="114" rx="14" ry="22" fill="#B07A4E"/>` +
  `<path d="M80 104 Q94 114 80 124 M124 104 Q138 114 124 124" fill="none" stroke="#5E3B1B" stroke-width="4"/>`) +
  `<g class="gg-frog">` + ink(4.5,
    `<ellipse cx="104" cy="70" rx="40" ry="28" fill="#4ADE9A"/>` +
    `<circle cx="84" cy="46" r="15" fill="#4ADE9A"/><circle cx="124" cy="46" r="15" fill="#4ADE9A"/>` +
    `<ellipse cx="78" cy="94" rx="15" ry="7" fill="#22A86C"/><ellipse cx="130" cy="94" rx="15" ry="7" fill="#22A86C"/>` +
    `<circle cx="84" cy="46" r="8" fill="#fff"/><circle cx="124" cy="46" r="8" fill="#fff"/>`) +
  eyes(85, 125, 47, 3.6) + cheeks(80, 128, 72) + ink(3.2, `<path d="M90 76 Q104 86 118 76" fill="none"/>`) + gloss(92, 56, 12, 5) + `</g>`);

export const butterflySvg = () => svg('0 0 100 80', `<g class="gg-wings">` + ink(4,
  `<path d="M48 40 C30 6 6 8 8 30 C10 46 30 48 48 44 Z" fill="#FF8A3C"/><path d="M52 40 C70 6 94 8 92 30 C90 46 70 48 52 44 Z" fill="#FF8A3C"/>` +
  `<path d="M48 46 C34 50 20 66 30 74 C40 78 48 62 48 50 Z" fill="#FFC93C"/><path d="M52 46 C66 50 80 66 70 74 C60 78 52 62 52 50 Z" fill="#FFC93C"/>`) +
  `<circle cx="26" cy="26" r="6" fill="#fff" opacity=".8"/><circle cx="74" cy="26" r="6" fill="#fff" opacity=".8"/></g>` +
  ink(4, `<ellipse cx="50" cy="44" rx="5" ry="20" fill="${INK}"/><path d="M48 26 C44 14 40 10 36 10 M52 26 C56 14 60 10 64 10" fill="none" stroke-width="3"/>`));
