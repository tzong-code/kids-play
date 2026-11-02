// Word Fishing art: Carrie's crowned cat in a little lilac rowing boat with a bamboo fishing rod,
// the hook, the speaker button and the lake, drawn to match the Superdesign "Word Fishing
// (Carrie, age 5)" draft. The fish are shared with Colour Match.

import { catFace } from '../../../js/art.js';

const INK = '#2B2340';
const PINK = '#FF5FA8', LILAC = '#B78CFF', GOLD = '#FFC93C';
const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const tube = (d, w, color) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
const nest = (s, x, y, w, h) => s.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

/** Where the rod tip is, as fractions of the boat's box (viewBox 0 0 300 220). */
export const ROD_TIP = [292 / 300, 14 / 220];
/** Where the boat's rim is, as a fraction of its height: cargo sits on it. */
export const RIM = 150 / 220;

/**
 * The back of the boat (viewBox 0 0 300 220): the inside of the hull, the cat (.wf-cat, with
 * its head in .wf-head) and the rod. The front of the hull is boatFrontSvg, drawn over the cargo.
 */
export function boatBackSvg() {
  return svg('0 0 300 220',
    ink(4, `<ellipse cx="140" cy="150" rx="124" ry="15" fill="#8C62DB"/>`) +
    `<g class="wf-cat">` +
    tube('M96 150 C70 150 64 124 78 112', 11, '#fff') +
    ink(4, `<path d="M92 158 C86 132 96 108 125 106 C154 108 164 132 158 158 Z" fill="#fff"/>`) +
    `<path d="M146 116 C156 128 158 146 154 158 H158 C164 132 154 108 132 106 Z" fill="#EFE9F7"/>` +
    // the rod, held in both paws
    ink(3, `<path d="M150 136 L292 14" fill="none" stroke-width="11"/>`) +
    `<path d="M150 136 L292 14" stroke="#E8B575" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M186 105 l6 7 M222 74 l6 7 M258 43 l6 7" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
    ink(3, `<circle cx="292" cy="14" r="5" fill="${GOLD}"/><circle cx="170" cy="120" r="10" fill="#C98F55"/><circle cx="170" cy="120" r="3" fill="${INK}"/>`) +
    ink(3.5, `<circle cx="146" cy="136" r="11" fill="#fff"/><circle cx="160" cy="126" r="11" fill="#fff"/>`) +
    `<g class="wf-head">${nest(catFace(), 72, 14, 106, 106)}</g>` +
    `</g>`);
}

/** The front of the hull (viewBox 0 0 300 220): lilac with a pink stripe. */
export function boatFrontSvg() {
  return svg('0 0 300 220',
    ink(4, `<path d="M14 148 Q140 172 266 148 L244 202 Q140 218 38 202 Z" fill="${LILAC}"/>`) +
    `<path d="M22 166 Q140 188 260 166 L256 176 Q140 198 26 176 Z" fill="${PINK}"/>` +
    `<path d="M70 168 L76 206 M140 176 V212 M210 168 L204 206" stroke="#8C62DB" stroke-width="4" stroke-linecap="round" opacity=".6"/>` +
    ink(4, `<path d="M14 148 Q140 172 266 148" fill="none"/>`) + shine(48, 162, 14, 4, 6));
}

/** The hook (viewBox 0 0 30 44): hangs from its top centre. */
export const hookSvg = () => svg('0 0 30 44',
  ink(3, `<circle cx="15" cy="6" r="4" fill="${GOLD}"/>`) +
  `<path d="M15 10 V30 A8 8 0 0 1 1 30 L5 25" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M15 10 V30 A8 8 0 0 1 1 30 L5 25" fill="none" stroke="${GOLD}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`);

/** The "say it again" speaker (viewBox 0 0 60 60). */
export const speakerSvg = () => svg('0 0 60 60',
  ink(3, `<path d="M12 24 H22 L34 14 V46 L22 36 H12 Z" fill="#fff"/>`) +
  `<path d="M40 22 Q46 30 40 38 M45 16 Q56 30 45 44" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>`);

/** The lake (viewBox 0 0 1000 600, sliced from the top): waves, bubbles, lily pads and weed. */
export function lakeSvg() {
  const wave = (x, y) => `<path d="M${x} ${y} q40 -16 80 0 t80 0 t80 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>`;
  const weed = (x, h, c) => tube(`M${x} 600 C${x - 20} ${600 - h * 0.35} ${x + 24} ${600 - h * 0.65} ${x} ${600 - h}`, 10, c);
  const pad = (x, y, r) => ink(4, `<path d="M${x} ${y} L${x + r} ${y - r * 0.18} A${r} ${r * 0.62} 0 1 0 ${x + r} ${y + r * 0.18} Z" fill="#4ADE9A"/>`);
  return svg('0 0 1000 600',
    wave(80, 60) + wave(560, 40) + wave(300, 200) + wave(720, 300) + wave(60, 420) + wave(520, 520) +
    ink(2.5, `<circle cx="880" cy="160" r="9" fill="#fff" fill-opacity=".5"/><circle cx="900" cy="128" r="6" fill="#fff" fill-opacity=".5"/>` +
      `<circle cx="140" cy="300" r="7" fill="#fff" fill-opacity=".5"/>`) +
    weed(40, 170, '#2FBF7E') + weed(76, 120, '#4ADE9A') + weed(950, 190, '#2FBF7E') + weed(916, 110, '#4ADE9A') +
    pad(940, 14, 44), 'xMidYMax slice');
}
