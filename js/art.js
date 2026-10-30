// Hand-drawn "chunky toy" art as inline SVG: mascots, tool icons, home tiles and scenes.
// Everything shares one thick ink outline so it reads like a set of cartoon stickers.

import { STICKERS as BASE } from '../assets/art/stickers.js';
import { STICKERS_CATS } from '../assets/art/stickers-cats.js';
import { STICKERS_ROOMS_A } from '../assets/art/stickers-rooms-a.js';
import { STICKERS_ROOMS_B } from '../assets/art/stickers-rooms-b.js';

/** Every sticker in the app, by id: stamps, scene stickers, dollhouse items and the cat friends. */
export const STICKERS = { ...BASE, ...STICKERS_CATS, ...STICKERS_ROOMS_A, ...STICKERS_ROOMS_B };

const INK = '#2B2340';
const PINK = '#FF5FA8', BUBBLE = '#FF8FB8', LILAC = '#B78CFF', GOLD = '#FFC93C', GOLD_D = '#E0A21A';
const BLUE = '#4D96FF', BLUE_D = '#2B6BCC', MINT = '#4ADE9A', LAGOON = '#22B8CF', CORAL = '#FF8A7A';
const RED = '#FF6B6B', CREAM = '#FFF8EE', SKIN = '#FFE0C7', WOOD = '#B07A4E';

const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
/** A fat outlined line: ink underneath, colour on top. */
const tube = (d, w, color) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 6}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;

function star(cx, cy, R, r, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
}

const sparkle4 = (cx, cy, r) =>
  `M${cx} ${cy - r}Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy}Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r}` +
  `Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy}Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}Z`;

function eyes(x1, x2, y, rx, ry) {
  return [x1, x2].map(x =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${INK}" stroke="none"/>` +
    `<circle cx="${x + rx * 0.35}" cy="${y - ry * 0.4}" r="${rx * 0.38}" fill="#fff" stroke="none"/>`).join('');
}
const cheeks = (x1, x2, y, rx = 5.5, ry = 3.4) =>
  [x1, x2].map(x => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${BUBBLE}" opacity=".75" stroke="none"/>`).join('');

// ---------- mascots ----------

/** Carrie's white kitten with a little gold crown (viewBox 0 0 100 100). */
function catHead() {
  return ink(3.5,
    // ears
    `<path d="M19 46 L17 9 L46 27 Z" fill="#fff"/><path d="M81 46 L83 9 L54 27 Z" fill="#fff"/>` +
    `<path d="M24 37 L23 19 L38 28 Z" fill="${BUBBLE}" stroke="none"/><path d="M76 37 L77 19 L62 28 Z" fill="${BUBBLE}" stroke="none"/>` +
    // head
    `<ellipse cx="50" cy="58" rx="37" ry="31" fill="#fff"/>` +
    `<path d="M24 74 C34 86 66 86 76 74 C66 81 34 81 24 74 Z" fill="#EFE9F7" stroke="none"/>` +
    // crown
    `<path d="M37 31 L35 15 L44 22 L50 10 L56 22 L65 15 L63 31 Z" fill="${GOLD}"/>` +
    `<circle cx="50" cy="25" r="2.6" fill="${PINK}" stroke-width="1.5"/>` +
    shine(42, 19, 3, 1.6) +
    eyes(36, 64, 58, 4.6, 5.8) + cheeks(29, 71, 68) +
    // nose, mouth, whiskers
    `<path d="M46.5 66 H53.5 L50 70 Z" fill="${BUBBLE}" stroke-width="1.8"/>` +
    `<path d="M50 70 Q50 75 44.5 74.5 M50 70 Q50 75 55.5 74.5" fill="none" stroke-width="2.4"/>` +
    `<path d="M22 66 L8 63 M22 71 L9 74 M78 66 L92 63 M78 71 L91 74" fill="none" stroke-width="2.2"/>`);
}

/** Covey's mermaid girl: red-orange hair and a starfish clip (viewBox 0 0 100 100). */
function mermaidHead() {
  const hair = '#FF7A45';
  return ink(3.5,
    `<path d="M14 60 C10 30 28 13 50 13 C72 13 90 30 86 60 C88 72 93 83 85 91 C79 85 71 89 66 83 L34 83 C29 89 21 85 15 91 C7 83 12 72 14 60 Z" fill="${hair}"/>` +
    `<ellipse cx="50" cy="57" rx="26" ry="25" fill="${SKIN}"/>` +
    `<path d="M23 55 C21 34 36 24 52 26 C67 26 79 36 77 52 C70 41 60 36 50 38 C44 47 33 51 23 55 Z" fill="${hair}"/>` +
    shine(36, 30, 6, 2.5) +
    `<path d="${star(73, 27, 10, 4.6)}" fill="${GOLD}" stroke-width="2.6"/>` +
    eyes(40, 60, 60, 3.8, 4.8) + cheeks(33, 67, 68, 5, 3.2) +
    `<path d="M44 69 Q50 75 56 69" fill="none" stroke-width="2.8"/>`);
}

export const catFace = () => svg('0 0 100 100', catHead());
export const mermaidFace = () => svg('0 0 100 100', mermaidHead());

/** Full-length characters for the picker cards (viewBox 0 0 200 240). */
export function catFull() {
  return svg('0 0 200 240',
    tube('M138 200 C178 204 188 160 170 140 C162 131 150 136 156 146', 12, '#fff') +
    ink(3.5,
      `<path d="M62 100 C42 132 44 188 62 216 H138 C156 188 158 132 138 100 Z" fill="#fff"/>` +
      `<ellipse cx="100" cy="174" rx="22" ry="28" fill="#FFF7FB" stroke="none"/>` +
      `<path d="M130 112 C142 140 144 182 134 212 L138 216 C156 188 158 132 138 100 Z" fill="#EFE9F7" stroke="none"/>`) +
    tube('M72 122 C64 140 64 158 70 172', 11, '#fff') +
    ink(3.5,
      `<ellipse cx="72" cy="176" rx="11" ry="9" fill="#fff"/>` +
      `<ellipse cx="80" cy="216" rx="17" ry="10" fill="#fff"/><ellipse cx="120" cy="216" rx="17" ry="10" fill="#fff"/>` +
      `<path d="M76 210 V219 M84 210 V219 M116 210 V219 M124 210 V219" fill="none" stroke-width="2"/>`) +
    tube('M130 118 C146 108 156 96 162 82', 11, '#fff') +
    ink(3.5, `<circle cx="164" cy="76" r="12" fill="#fff"/><circle cx="164" cy="79" r="4" fill="${BUBBLE}" stroke="none"/>` +
      `<circle cx="157" cy="71" r="2.2" fill="${BUBBLE}" stroke="none"/><circle cx="164" cy="68" r="2.2" fill="${BUBBLE}" stroke="none"/><circle cx="171" cy="71" r="2.2" fill="${BUBBLE}" stroke="none"/>`) +
    `<g transform="translate(38 0) scale(1.24)">${catHead()}</g>` +
    ink(3, `<path d="M100 112 L80 101 L80 123 Z" fill="${PINK}"/><path d="M100 112 L120 101 L120 123 Z" fill="${PINK}"/><circle cx="100" cy="112" r="6" fill="${BUBBLE}"/>`));
}

export function mermaidFull() {
  const hair = '#FF7A45';
  return svg('0 0 200 240',
    ink(3.5,
      // long hair behind the body
      `<path d="M58 70 C40 110 44 150 62 176 C68 150 72 130 80 104 Z" fill="${hair}"/>` +
      `<path d="M142 70 C160 110 156 150 138 176 C132 150 128 130 120 104 Z" fill="${hair}"/>` +
      // tail
      `<path d="M76 140 C66 184 92 212 132 210 C146 209 156 202 162 192 L150 182 C144 192 136 196 126 194 C106 190 108 166 124 140 Z" fill="${LAGOON}"/>` +
      `<path d="M158 192 C166 170 188 164 194 172 C186 180 178 188 170 196 C182 196 194 206 190 216 C178 218 162 210 156 198 Z" fill="${MINT}"/>` +
      `<path d="M84 160 Q92 166 100 160 Q108 166 116 160 M88 178 Q96 184 104 178 Q112 184 118 180 M100 196 Q108 201 116 196" fill="none" stroke-width="2.4" opacity=".6"/>` +
      shine(90, 152, 6, 3, -60) +
      // torso and waist band
      `<path d="M76 98 C70 116 72 132 76 142 H124 C128 132 130 116 124 98 Z" fill="${SKIN}"/>` +
      `<path d="M74 136 Q100 148 126 136 L125 146 Q100 158 75 146 Z" fill="${MINT}"/>`) +
    tube('M78 108 C70 122 68 136 72 146', 10, SKIN) +
    tube('M122 108 C136 100 146 90 152 76', 10, SKIN) +
    ink(3.5,
      `<circle cx="72" cy="150" r="8" fill="${SKIN}"/><circle cx="154" cy="72" r="9" fill="${SKIN}"/>` +
      // shell top
      `<path d="M78 120 C78 106 98 106 98 120 Z" fill="${LILAC}"/><path d="M102 120 C102 106 122 106 122 120 Z" fill="${LILAC}"/>` +
      `<path d="M88 120 V110 M112 120 V110" fill="none" stroke-width="2"/>`) +
    `<g transform="translate(38 0) scale(1.24)">${mermaidHead()}</g>`);
}

/** A sticker as an image URL, sized large so it stays crisp when stamped big. */
export function stickerUrl(id) {
  const s = STICKERS[id]?.svg || '';
  const sized = /<svg[^>]*\swidth=/.test(s) ? s : s.replace('<svg ', '<svg width="512" height="512" ');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized);
}

/** Mascot or sticker drawn inside the round corner badge. */
export function avatarSvg(id) {
  if (id === 'cat') return catFace();
  if (id === 'mermaid-girl') return mermaidFace();
  return STICKERS[id]?.svg || catFace();
}

// ---------- tool and action icons (viewBox 0 0 64 64) ----------

const ICONS = {
  home: () => ink(3,
    `<rect x="40" y="13" width="8" height="14" rx="1.5" fill="${PINK}"/>` +
    `<rect x="15" y="29" width="34" height="25" rx="4" fill="${CREAM}"/>` +
    `<path d="M27 54 V43 a5 5 0 0 1 10 0 V54 Z" fill="${LILAC}"/>` +
    `<path d="M8 32 L32 11 L56 32 Z" fill="${PINK}"/>` + shine(26, 22, 6, 2.4, -38)),

  crayon: () => `<g transform="rotate(-45 32 32)">` + ink(3,
    `<path d="M18 24 H52 a4 4 0 0 1 4 4 V36 a4 4 0 0 1 -4 4 H18 Z" fill="${GOLD}"/>` +
    `<rect x="26" y="24" width="20" height="16" fill="${CREAM}"/>` +
    `<path d="M30.5 26 V38 M41.5 26 V38" stroke="${GOLD_D}" stroke-width="3"/>` +
    `<path d="M18 24 L5 32 L18 40 Z" fill="${GOLD}"/>` +
    `<path d="M9.6 29.2 L5 32 L9.6 34.8 Z" fill="${GOLD_D}" stroke-width="2"/>`) +
    shine(40, 28.5, 10, 1.5, 0) + `</g>`,

  marker: () => `<g transform="rotate(-45 32 32)">` + ink(3,
    `<path d="M15 25 H38 V39 H15 a4 4 0 0 1 -4 -4 V29 a4 4 0 0 1 4 -4 Z" fill="${CREAM}"/>` +
    `<path d="M38 23 H54 a4 4 0 0 1 4 4 V37 a4 4 0 0 1 -4 4 H38 Z" fill="${PINK}"/>` +
    `<path d="M11 28 L5 30 V34 L11 36 Z" fill="${PINK}" stroke-width="2.5"/>`) +
    shine(24, 28.5, 8, 1.5, 0) + shine(47, 27, 6, 1.5, 0) + `</g>`,

  glitter: () => tube('M12 53 L33 32', 5, CREAM) + ink(3,
    `<path d="${star(39, 25, 15, 7)}" fill="${GOLD}"/>` +
    `<path d="${sparkle4(53, 46, 6)}" fill="#fff" stroke-width="2"/>` +
    `<path d="${sparkle4(15, 18, 5)}" fill="#fff" stroke-width="2"/>` +
    `<path d="${sparkle4(56, 11, 4)}" fill="#fff" stroke-width="2"/>`) + shine(34, 21, 3, 1.6),

  rainbow: () => {
    const band = (ro, ri, c) => `<path d="M${32 - ro} 44 A${ro} ${ro} 0 0 1 ${32 + ro} 44 L${32 + ri} 44 A${ri} ${ri} 0 0 0 ${32 - ri} 44 Z" fill="${c}"/>`;
    const cloud = cx => `<path d="M${cx - 11} 50 a5 5 0 0 1 1 -9 a7 7 0 0 1 13 -2 a5.5 5.5 0 0 1 8 7 a4 4 0 0 1 -2 4 Z" fill="#fff"/>`;
    return ink(3, band(25, 18.5, RED) + band(18.5, 12, GOLD) + band(12, 6, BLUE) + cloud(9) + cloud(55));
  },

  eraser: () => `<g transform="rotate(-28 32 32)">` + ink(3,
    `<rect x="12" y="21" width="40" height="22" rx="6" fill="${CREAM}"/>` +
    `<path d="M12 27 a6 6 0 0 1 6 -6 H31 V43 H18 a6 6 0 0 1 -6 -6 Z" fill="${BLUE}"/>`) +
    shine(41, 26, 7, 2, 0) + `</g>` +
    ink(2, `<circle cx="49" cy="52" r="2.6" fill="${CREAM}"/><circle cx="56" cy="46" r="2" fill="${CREAM}"/>`),

  fill: () => ink(3,
    `<path d="M5 34 C2 42 6 54 13 52 C18 51 14 58 20 59 C26 60 26 50 23 44 L15 32 Z" fill="${PINK}"/>`) +
    `<g transform="rotate(-38 34 34)">` + ink(3,
      `<path d="M20 22 C20 6 46 6 46 22" fill="none"/>` +
      `<path d="M18 22 H48 L44 52 H22 Z" fill="${BLUE}"/>` +
      `<ellipse cx="33" cy="22" rx="15" ry="4.5" fill="${BLUE_D}"/>` +
      `<ellipse cx="33" cy="22" rx="10" ry="2.6" fill="${PINK}" stroke="none"/>`) +
    shine(26, 34, 2.4, 9, 0) + `</g>`,

  stamp: () => ink(3, `<path d="${star(32, 34, 26, 12.5)}" fill="${GOLD}"/>`) +
    eyes(26.5, 37.5, 33, 2.4, 3) + ink(2.4, `<path d="M28.5 40 Q32 43.5 35.5 40" fill="none"/>`) +
    cheeks(22.5, 41.5, 39, 3, 1.8) + shine(25, 22, 4, 2),

  undo: () => tube('M22 27 H38 a12 12 0 0 1 0 24 H28', 6, LILAC) +
    ink(3, `<path d="M25 13 L9 27 L25 41 Z" fill="${LILAC}"/>`),

  redo: () => `<g transform="translate(64 0) scale(-1 1)">${ICONS.undo()}</g>`,

  clear: () => `<g transform="rotate(22 32 32)">` + tube('M32 4 V28', 4, WOOD) + ink(3,
    `<rect x="21" y="26" width="22" height="8" rx="2.5" fill="${PINK}"/>` +
    `<path d="M22 34 H42 L51 58 H13 Z" fill="${GOLD}"/>` +
    `<path d="M27 39 L23 54 M32 39 V55 M37 39 L41 54" fill="none" stroke-width="2.2"/>`) + `</g>` +
    ink(2, `<circle cx="9" cy="54" r="3" fill="#fff"/><circle cx="4" cy="47" r="2" fill="#fff"/>`),

  photos: () => ink(3,
    `<path d="M20 21 L24 13 H40 L44 21" fill="${PINK}"/>` +
    `<rect x="7" y="20" width="50" height="34" rx="9" fill="${PINK}"/>` +
    `<rect x="44" y="25" width="7" height="5" rx="1.5" fill="${GOLD}" stroke-width="2"/>` +
    `<circle cx="32" cy="37" r="11.5" fill="${CREAM}"/><circle cx="32" cy="37" r="6" fill="${BLUE}"/>`) +
    shine(29, 34, 2.4, 1.6) + shine(15, 25, 4, 1.6, 0),

  close: () => tube('M18 18 L46 46 M46 18 L18 46', 8, RED),

  keep: () => `<g transform="rotate(-45 32 32)">` + ink(3,
    `<path d="M18 24 H48 V40 H18 Z" fill="${GOLD}"/>` +
    `<path d="M48 24 H54 a4 4 0 0 1 4 4 V36 a4 4 0 0 1 -4 4 H48 Z" fill="${BUBBLE}"/>` +
    `<path d="M18 24 L6 32 L18 40 Z" fill="${SKIN}"/>` +
    `<path d="M10 29.6 L6 32 L10 34.4 Z" fill="${INK}" stroke-width="1.5"/>`) + shine(32, 28.5, 10, 1.5, 0) + `</g>`,

  trash: () => ink(3,
    `<path d="M17 22 H47 L43 55 H21 Z" fill="${PINK}"/>` +
    `<rect x="12" y="15" width="40" height="8" rx="4" fill="${BUBBLE}"/>` +
    `<path d="M26 15 V11 H38 V15" fill="none"/>` +
    `<path d="M27 30 L28.5 47 M37 30 L35.5 47" fill="none" stroke-width="2.4"/>`) + shine(23, 30, 2.4, 7, 0),

  moon: () => ink(3, `<path d="M40 8 a26 26 0 1 0 18 38 a20 20 0 1 1 -18 -38 Z" fill="${GOLD}"/>`) +
    ink(2.5, `<path d="M10 14 h7 l-7 8 h7" fill="none"/>`) + shine(28, 24, 4, 2),

  dollhouse: () => ink(3,
    `<path d="M16 26 L15 9 L26 18 Z" fill="${PINK}"/><path d="M48 26 L49 9 L38 18 Z" fill="${PINK}"/>` +
    `<path d="M6 32 L32 12 L58 32 Z" fill="${PINK}"/>` +
    `<rect x="12" y="30" width="40" height="26" rx="4" fill="${BUBBLE}"/>` +
    `<rect x="17" y="35" width="11" height="9" rx="2.5" fill="${GOLD}"/><rect x="36" y="35" width="11" height="9" rx="2.5" fill="${LILAC}"/>` +
    `<path d="M27 56 V49 a5 5 0 0 1 10 0 V56 Z" fill="${CREAM}"/>`) + shine(22, 24, 5, 2, -36),

  gear: () => {
    let teeth = '';
    for (let i = 0; i < 8; i++) teeth += `<rect x="28" y="6" width="8" height="12" rx="2.5" fill="#D9D2E6" transform="rotate(${i * 45} 32 32)"/>`;
    return ink(3, teeth + `<circle cx="32" cy="32" r="17" fill="#D9D2E6"/><circle cx="32" cy="32" r="6.5" fill="#fff"/>`);
  },
};

export function icon(name) {
  return svg('0 0 64 64', (ICONS[name] || ICONS.stamp)());
}

// ---------- home tile pictures (viewBox 0 0 120 120) ----------

export const TILE_ART = {
  draw: () => {
    const crayon = (x, top, c) => ink(3,
      `<path d="M${x} ${top + 12} L${x + 7} ${top} L${x + 14} ${top + 12} Z" fill="${c}"/>` +
      `<rect x="${x}" y="${top + 12}" width="14" height="${64 - top}" fill="${c}"/>`) + shine(x + 4, top + 26, 1.6, 6, 0);
    return svg('0 0 120 120',
      crayon(25, 14, RED) + crayon(41, 4, GOLD) + crayon(57, 12, MINT) + crayon(73, 20, PINK) + ink(3.5,
        `<path d="M16 58 H104 L98 104 a7 7 0 0 1 -7 6 H29 a7 7 0 0 1 -7 -6 Z" fill="${BLUE}"/>` +
        `<rect x="34" y="70" width="52" height="24" rx="12" fill="${GOLD}"/>` +
        `<path d="M53 80 Q60 87 67 80" fill="none" stroke-width="3"/>`) +
      eyes(50, 70, 79, 2.2, 2.8) + shine(28, 66, 6, 2.6, 0));
  },
  colour: () => svg('0 0 120 120', ink(3.5,
    `<path d="M60 14 C91 14 111 34 108 60 C106 80 90 79 82 84 C74 89 83 105 65 107 C35 110 11 92 12 62 C12 34 31 14 60 14 Z" fill="#FFE7C2"/>` +
    `<circle cx="82" cy="66" r="8" fill="#fff"/>` +
    [[38, 40, RED], [61, 31, GOLD], [85, 42, BLUE], [31, 64, MINT], [46, 87, PINK]].map(([x, y, c]) =>
      `<circle cx="${x}" cy="${y}" r="9.5" fill="${c}"/>` + shine(x - 3, y - 3.5, 3, 1.8)).join('')) +
    tube('M108 110 L84 80', 5, WOOD) + ink(3,
      `<path d="M80 86 L74 76 L84 70 L90 80 Z" fill="#D9D2E6"/><path d="M76 74 C66 66 64 56 68 52 C76 54 84 62 82 70 Z" fill="${PINK}"/>`) +
    shine(30, 30, 9, 4)),
  stickers: () => svg('0 0 120 120',
    ink(3.5, `<rect x="16" y="20" width="84" height="84" rx="12" fill="${CREAM}" transform="rotate(-6 58 62)"/>`) +
    ink(3.5, `<path d="${star(46, 52, 24, 11)}" fill="${GOLD}"/>`) + eyes(41, 51, 52, 2.2, 2.8) +
    ink(3.5, `<path d="M82 92 C70 82 62 74 66 66 C69 61 76 62 82 68 C88 62 95 61 98 66 C102 74 94 82 82 92 Z" fill="${PINK}"/>`) +
    ink(3.5, `<path d="M70 26 a10 10 0 0 1 20 0 a10 10 0 0 1 -20 0 Z" fill="${MINT}"/>`) +
    // a sticker peeling up at the corner
    ink(3, `<path d="M84 104 L100 88 L104 104 Z" fill="#fff"/>`) + shine(38, 42, 5, 2.4) + shine(78, 22, 3, 1.6)),
  dollhouse: () => svg('0 0 120 120', ink(3.5,
    `<path d="M30 40 L28 14 L46 28 Z" fill="${PINK}"/><path d="M90 40 L92 14 L74 28 Z" fill="${PINK}"/>` +
    `<path d="M10 52 L60 18 L110 52 Z" fill="${PINK}"/>` +
    `<rect x="20" y="50" width="80" height="58" rx="6" fill="${BUBBLE}"/>` +
    `<rect x="28" y="58" width="26" height="20" rx="5" fill="${GOLD}"/><rect x="66" y="58" width="26" height="20" rx="5" fill="${LILAC}"/>` +
    `<rect x="28" y="84" width="26" height="18" rx="5" fill="${MINT}"/>` +
    `<path d="M68 108 V90 a10 10 0 0 1 20 0 V108 Z" fill="${CREAM}"/>`) +
    eyes(52, 68, 38, 2.4, 3) + ink(2.4, `<path d="M56 44 Q60 47 64 44" fill="none"/>`) + shine(36, 32, 7, 2.5, -30)),
  giraffe: () => svg('0 0 120 120', ink(3.5,
    `<path d="M44 118 C46 96 50 78 54 62 L74 64 C72 82 72 100 74 118 Z" fill="#F7C948"/>` +
    `<ellipse cx="58" cy="90" rx="5" ry="4" fill="#E0A83A" stroke="none"/><ellipse cx="66" cy="106" rx="5" ry="4" fill="#E0A83A" stroke="none"/>` +
    `<path d="M40 40 C30 30 20 32 22 40 C24 48 34 48 42 46 Z" fill="#E9B93A"/>` +
    `<path d="M54 22 L52 8 M70 20 L72 6" fill="none" stroke="#8A5A2B" stroke-width="6"/>` +
    `<circle cx="51" cy="6" r="5.5" fill="#8A5A2B"/><circle cx="73" cy="4" r="5.5" fill="#8A5A2B"/>` +
    `<ellipse cx="62" cy="42" rx="26" ry="23" fill="#F7C948"/>` +
    `<ellipse cx="80" cy="54" rx="19" ry="14" fill="#FFE6A3"/>` +
    `<circle cx="84" cy="50" r="2" fill="${INK}" stroke="none"/><circle cx="92" cy="52" r="2" fill="${INK}" stroke="none"/>` +
    `<path d="M76 61 Q82 66 88 60" fill="none" stroke-width="2.6"/>`) +
    eyes(55, 70, 42, 4.6, 5.6) + `<ellipse cx="46" cy="54" rx="5" ry="3" fill="#FFD9E8"/>` + shine(52, 28, 6, 2.4)),
  busy: () => svg('0 0 120 120', ink(3.5,
    `<rect x="10" y="14" width="100" height="94" rx="18" fill="#F7D9A6"/>` +
    `<circle cx="38" cy="34" r="11" fill="${GOLD}"/><rect x="31" y="50" width="14" height="26" rx="7" fill="#fff"/><rect x="31" y="50" width="14" height="13" rx="6" fill="${CORAL}"/>` +
    [0, 1, 2, 3, 4, 5].map(i => {
      const a0 = (i / 6) * Math.PI * 2, a1 = ((i + 1) / 6) * Math.PI * 2;
      const p = a => `${(80 + Math.cos(a) * 20).toFixed(1)} ${(42 + Math.sin(a) * 20).toFixed(1)}`;
      return `<path d="M80 42 L${p(a0)} A20 20 0 0 1 ${p(a1)} Z" fill="${[RED, GOLD, MINT, LAGOON, LILAC, PINK][i]}"/>`;
    }).join('') +
    `<rect x="24" y="86" width="72" height="12" rx="6" fill="${LAGOON}"/><circle cx="70" cy="92" r="10" fill="#fff"/>`) +
    `<circle cx="38" cy="34" r="17" fill="${GOLD}" opacity=".3"/>` + shine(26, 24, 7, 2.5, 0)),
  kittySays: () => {
    const cat = (cx, cy, c, open) => ink(3,
      `<path d="M${cx - 21} ${cy - 2} L${cx - 18} ${cy - 25} L${cx - 5} ${cy - 16} Z" fill="${c}"/><path d="M${cx + 21} ${cy - 2} L${cx + 18} ${cy - 25} L${cx + 5} ${cy - 16} Z" fill="${c}"/>` +
      `<ellipse cx="${cx}" cy="${cy}" rx="23" ry="19" fill="${c}"/>` +
      (open ? `<ellipse cx="${cx}" cy="${cy + 8}" rx="4" ry="5" fill="${INK}"/>` : `<path d="M${cx - 5} ${cy + 6} Q${cx} ${cy + 10} ${cx + 5} ${cy + 6}" fill="none" stroke-width="2.2"/>`)) +
      eyes(cx - 8, cx + 8, cy - 2, 2.2, 2.8);
    return svg('0 0 120 120',
      `<circle cx="88" cy="88" r="28" fill="${GOLD}" opacity=".35"/>` +
      cat(32, 36, PINK) + cat(88, 36, BLUE) + cat(32, 90, MINT) + cat(88, 88, GOLD, true) +
      ink(2.5, `<path d="M104 54 V40 L112 38 V50" fill="none"/>`) + `<circle cx="102" cy="55" r="3.5" fill="${INK}"/>`);
  },
  peekaboo: () => svg('0 0 120 120',
    ink(3.5, `<path d="M26 26 L24 4 L44 16 Z" fill="${PINK}"/><path d="M78 26 L80 4 L60 16 Z" fill="${PINK}"/><ellipse cx="52" cy="38" rx="30" ry="25" fill="${PINK}"/>`) +
    eyes(41, 63, 36, 3.6, 4.6) + `<ellipse cx="52" cy="50" rx="5" ry="6" fill="${INK}"/>` +
    ink(3.5, `<path d="M8 58 L20 44 H100 L112 58 Z" fill="#C98F55"/><rect x="12" y="56" width="96" height="56" rx="8" fill="#E8B575"/>` +
      `<path d="M8 58 L-2 40 L20 44 Z M112 58 L120 38 L100 44 Z" fill="#E8B575"/>`) +
    `<path d="M40 86 a12 12 0 0 0 24 0" fill="none" stroke="#C98F55" stroke-width="5"/>` + shine(26, 70, 8, 3, 0)),
  colourMatch: () => svg('0 0 120 120',
    `<circle cx="60" cy="68" r="44" fill="#D3E6FF"/>` + ink(3.5, `<circle cx="60" cy="68" r="44" fill="none"/><rect x="32" y="16" width="56" height="14" rx="7" fill="${BLUE}"/>`) +
    ink(3, `<path d="M40 72 L26 60 V84 Z" fill="${RED}"/><ellipse cx="62" cy="72" rx="24" ry="17" fill="${RED}"/>`) +
    `<circle cx="74" cy="67" r="3.4" fill="${INK}"/>` + shine(40, 46, 9, 4) +
    ink(2.5, `<circle cx="88" cy="44" r="5" fill="#fff"/><circle cx="96" cy="32" r="3.5" fill="#fff"/>`)),
  shapes: () => svg('0 0 120 120', ink(3.5,
    `<path d="M22 36 L26 10 L44 28 Z" fill="${LAGOON}"/><path d="M98 36 L94 10 L76 28 Z" fill="${LAGOON}"/>` +
    `<rect x="12" y="26" width="96" height="66" rx="16" fill="${LAGOON}"/>` +
    `<circle cx="34" cy="70" r="10" fill="${INK}"/><path d="M60 60 L72 80 H48 Z" fill="${INK}"/><rect x="78" y="60" width="20" height="20" rx="4" fill="${INK}"/>`) +
    eyes(48, 72, 44, 2.6, 3.2) +
    ink(3.5, `<path d="${star(84, 100, 16, 7)}" fill="${LILAC}"/><circle cx="30" cy="104" r="12" fill="${RED}"/>`) + shine(26, 36, 8, 3, 0)),
  gallery: () => svg('0 0 120 120',
    ink(3, `<path d="M26 32 L60 10 L94 32" fill="none"/><circle cx="60" cy="10" r="4.5" fill="${PINK}"/>`) + ink(3.5,
      `<rect x="14" y="30" width="92" height="78" rx="12" fill="${GOLD}"/>` +
      `<rect x="25" y="41" width="70" height="56" rx="5" fill="${CREAM}"/>` +
      `<path d="M25 97 V84 C38 70 52 70 64 82 C72 74 86 74 95 84 V97 Z" fill="${MINT}"/>` +
      `<circle cx="44" cy="58" r="8" fill="${GOLD}"/>` +
      `<path d="M44 44 V47 M30 58 H33 M55 58 H58 M34 48 L36 50 M54 48 L52 50" fill="none" stroke-width="2.5"/>`) +
    shine(26, 36, 6, 2.4, 0)),
};

// ---------- scenes ----------

const castle = () => {
  const tower = (x, w, top, roofTop, body, roof) =>
    `<rect x="${x}" y="${top}" width="${w}" height="${330 - top}" fill="${body}"/>` +
    `<path d="M${x + w / 2} ${roofTop} V${roofTop - 32}" fill="none"/><path d="M${x + w / 2} ${roofTop - 32} L${x + w / 2 + 30} ${roofTop - 24} L${x + w / 2} ${roofTop - 16} Z" fill="${GOLD}"/>` +
    `<path d="M${x - 10} ${top + 2} L${x + w / 2} ${roofTop} L${x + w + 10} ${top + 2} Z" fill="${roof}"/>` +
    `<rect x="${x + w / 2 - 10}" y="${top + 40}" width="20" height="30" rx="10" fill="${CREAM}"/>`;
  let merlons = '';
  for (let i = 0; i < 4; i++) merlons += `<rect x="${538 + i * 36}" y="176" width="22" height="20" rx="3" fill="${PINK}"/>`;
  return ink(4,
    tower(470, 70, 150, 70, BUBBLE, LILAC) + tower(660, 70, 150, 70, BUBBLE, LILAC) +
    merlons + `<rect x="530" y="192" width="140" height="138" fill="${PINK}"/>` +
    tower(565, 70, 108, 28, BUBBLE, LILAC) +
    `<path d="M600 262 C584 248 576 238 586 230 C592 226 598 230 600 234 C602 230 608 226 614 230 C624 238 616 248 600 262 Z" fill="#fff"/>` +
    `<path d="M576 330 V300 a24 24 0 0 1 48 0 V330 Z" fill="${GOLD}"/>`) + shine(560, 210, 14, 5, 0);
};

export const SCENES = {
  // Three layers so the hills stretch to any screen while the castle keeps its shape.
  princess: () =>
    svg('0 0 1200 400', ink(4, `<path d="M-10 300 C200 226 400 250 600 286 C800 244 1000 206 1210 262 V410 H-10 Z" fill="${LILAC}"/>`), 'none') +
    svg('430 0 340 340', castle(), 'xMidYMax meet') +
    svg('0 0 1200 400',
      ink(4, `<path d="M-10 334 C250 290 450 344 700 322 C900 304 1050 300 1210 332 V410 H-10 Z" fill="${PINK}"/>`) +
      [[80, 370], [210, 352], [330, 378], [880, 360], [1010, 380], [1130, 356], [470, 384], [760, 372]]
        .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="8" fill="${BUBBLE}"/>`).join('') +
      ink(3.5, [[150, 318], [1060, 306]].map(([x, y]) =>
        `<ellipse cx="${x}" cy="${y}" rx="20" ry="19" fill="${MINT}"/><ellipse cx="${x + 24}" cy="${y + 6}" rx="16" ry="15" fill="${MINT}"/>`).join('')), 'none'),

  mermaid: () => {
    const weed = (x, flip = 1) => [0, 1, 2].map(i => {
      const bx = x + i * 26 * flip, h = 210 - i * 50;
      return tube(`M${bx} 400 C${bx - 30 * flip} ${400 - h * 0.3} ${bx + 30 * flip} ${400 - h * 0.6} ${bx} ${400 - h}`, 12, i === 1 ? '#3CC47C' : MINT);
    }).join('');
    const shell = (x, y) => ink(3.5,
      `<path d="M${x - 22} ${y} C${x - 24} ${y - 30} ${x + 24} ${y - 30} ${x + 22} ${y} Z" fill="${BUBBLE}"/>` +
      `<path d="M${x} ${y} V${y - 22} M${x - 11} ${y} L${x - 7} ${y - 19} M${x + 11} ${y} L${x + 7} ${y - 19}" fill="none" stroke-width="2.5"/>`);
    return svg('0 0 1200 400',
      weed(70) + weed(1130, -1) +
      tube('M260 360 C258 320 262 300 250 270 M258 318 C280 300 288 290 286 270 M256 336 C236 320 228 312 226 296', 12, CORAL) +
      ink(4, `<path d="M-10 334 C200 312 400 344 600 326 C800 308 1000 330 1210 318 V410 H-10 Z" fill="#FFE7B8"/>`) +
      [[180, 372], [520, 380], [720, 364], [990, 384], [1080, 360]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#F2CF8E"/>`).join('') +
      shell(420, 368) + shell(1000, 360) +
      ink(3.5, `<path d="${star(840, 360, 26, 12)}" fill="${CORAL}"/>`) + eyes(834, 846, 360, 2.2, 2.8) +
      ink(3.5, `<ellipse cx="620" cy="352" rx="40" ry="20" fill="${LILAC}"/><ellipse cx="664" cy="360" rx="24" ry="14" fill="#9B74E8"/>`), 'xMidYMax slice');
  },
};

export const cloudSvg = () => svg('0 0 140 74', ink(4,
  `<path d="M28 66 a20 20 0 0 1 6 -38 a28 28 0 0 1 52 -10 a22 22 0 0 1 34 22 a14 14 0 0 1 -6 26 Z" fill="#fff"/>`) + shine(52, 34, 12, 5));

export const sparkleSvg = (color = '#fff') => svg('0 0 40 40', ink(2.5, `<path d="${sparkle4(20, 20, 17)}" fill="${color}"/>`));

export function fishSvg(body = GOLD, fin = CORAL) {
  return svg('0 0 120 80', ink(3.5,
    `<path d="M88 40 L114 20 L110 40 L114 60 Z" fill="${fin}"/>` +
    `<ellipse cx="56" cy="40" rx="38" ry="26" fill="${body}"/>` +
    `<path d="M50 16 C58 4 74 8 76 20" fill="${fin}"/>` +
    `<path d="M64 26 Q72 40 64 54" fill="none" stroke-width="2.6"/>`) +
    eyes(36, 36, 36, 4.4, 5.4) + ink(2.6, `<path d="M24 48 Q30 52 34 48" fill="none"/>`) + shine(46, 24, 10, 4));
}

// ---------- play timer ----------

/** The little timer cat: its eyes close as `sleepy` goes 0 → 1; `yawn` opens its mouth. */
export function sleepyCat(sleepy = 0, yawn = false) {
  // Eyes get smaller as she gets sleepy, then close into soft curves (never a grumpy half-lid).
  const ry = 6.2 - sleepy * 5;
  const eye = x => sleepy > 0.75
    ? `<path d="M${x - 6} 57 Q${x} 62 ${x + 6} 57" fill="none" stroke-width="3"/>`
    : `<ellipse cx="${x}" cy="${58 + sleepy * 2}" rx="${5 - sleepy}" ry="${ry}" fill="${INK}" stroke="none"/>` +
      (ry > 3 ? `<circle cx="${x + 1.6}" cy="${56 + sleepy * 2}" r="1.7" fill="#fff" stroke="none"/>` : '');
  return svg('0 0 100 100', ink(3.5,
    `<path d="M19 46 L17 9 L46 27 Z" fill="#fff"/><path d="M81 46 L83 9 L54 27 Z" fill="#fff"/>` +
    `<path d="M24 37 L23 19 L38 28 Z" fill="${BUBBLE}" stroke="none"/><path d="M76 37 L77 19 L62 28 Z" fill="${BUBBLE}" stroke="none"/>` +
    `<ellipse cx="50" cy="58" rx="37" ry="31" fill="#fff"/>` +
    eye(36) + eye(64) + cheeks(28, 72, 68) +
    `<path d="M46.5 65 H53.5 L50 68.5 Z" fill="${BUBBLE}" stroke-width="1.8"/>` +
    (yawn ? `<ellipse cx="50" cy="76" rx="6" ry="7" fill="#C8406F" stroke-width="2.4"/>`
      : `<path d="M50 68.5 Q50 73 45 72.5 M50 68.5 Q50 73 55 72.5" fill="none" stroke-width="2.4"/>`) +
    (sleepy > 0.85 ? `<path d="M84 20 h8 l-8 9 h8" fill="none" stroke-width="2.6"/>` : '')));
}

/** Lock screen: a white kitten fast asleep on a pillow, with a moon and stars (viewBox 0 0 300 220). */
export function sleepingCatSvg() {
  return svg('0 0 300 220',
    ink(4, `<path d="M30 168 C20 140 40 122 70 124 H230 C262 122 282 140 270 168 C262 190 240 196 150 196 C60 196 38 190 30 168 Z" fill="${LILAC}"/>`) +
    shine(80, 140, 26, 7, 0) +
    tube('M214 170 C246 170 254 146 238 136', 10, '#fff') +
    ink(4, `<path d="M96 172 C90 140 118 120 150 120 C186 120 216 136 214 170 Z" fill="#fff"/>`) +
    `<g transform="translate(78 64) scale(.95)">` + ink(3.5,
      `<path d="M19 46 L17 9 L46 27 Z" fill="#fff"/><path d="M81 46 L83 9 L54 27 Z" fill="#fff"/>` +
      `<path d="M24 37 L23 19 L38 28 Z" fill="${BUBBLE}" stroke="none"/><path d="M76 37 L77 19 L62 28 Z" fill="${BUBBLE}" stroke="none"/>` +
      `<ellipse cx="50" cy="58" rx="37" ry="31" fill="#fff"/>` +
      `<path d="M29 58 Q36 64 43 58 M57 58 Q64 64 71 58" fill="none" stroke-width="3"/>` + cheeks(29, 71, 68) +
      `<path d="M46.5 66 H53.5 L50 69.5 Z" fill="${BUBBLE}" stroke-width="1.8"/>`) + `</g>` +
    ink(3, `<path d="M236 30 a26 26 0 1 0 26 34 a20 20 0 1 1 -26 -34 Z" fill="${GOLD}"/>`) +
    ink(2.5, `<path d="${star(40, 40, 10, 4.5)}" fill="${GOLD}"/><path d="${star(70, 18, 7, 3)}" fill="#fff"/><path d="${star(196, 22, 7, 3)}" fill="#fff"/>`) +
    ink(3, `<path d="M182 76 h12 l-12 13 h12 M200 52 h9 l-9 10 h9" fill="none"/>`));
}
