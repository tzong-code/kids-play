// Opposite Day art: the crowned cat conductor (baton, bow tie and party hat), her rule sign, the
// pond and the fish bucket, drawn to match the Superdesign "Opposite Day (Carrie, age 5)" draft.
// The fish are shared with Colour Match.

import { catFace } from '../../../js/art.js';
import { fishSvg } from '../../brain-covey/colours/art.js';

const INK = '#2B2340';
const PINK = '#FF5FA8', LILAC = '#B78CFF', GOLD = '#FFC93C';
const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const tube = (d, w, color) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
/** Place a whole <svg> inside another at x, y, w × h. */
const nest = (s, x, y, w, h) => s.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

/**
 * The conductor (viewBox -110 -50 350 280): Carrie's white crowned cat on a pink podium, holding
 * up the rule sign (.od-sign, filled by signInner). The baton arm (.od-baton) waves, the head
 * (.od-head) shakes, and the party hat (.od-hat) shows on .hat.
 */
export function conductorSvg(c) {
  return svg('-110 -50 350 280',
    ink(4, `<path d="M52 212 V196 H188 V212 Z" fill="#D63E86"/><ellipse cx="120" cy="196" rx="68" ry="14" fill="${PINK}"/>`) +
    shine(90, 192, 18, 4, 0) +
    `<g class="od-body">` +
    tube('M150 194 C190 196 198 156 178 140', 12, '#fff') +
    ink(4, `<path d="M90 116 C72 146 74 178 84 196 H156 C166 178 168 146 150 116 Z" fill="#fff"/>`) +
    `<path d="M146 126 C158 150 160 176 152 194 H156 C166 178 168 146 150 116 Z" fill="#EFE9F7"/>` +
    // the sign, held up in the left paw
    `<g class="od-sign">${signInner(c)}</g>` +
    tube('M96 132 C60 142 0 142 -34 128', 11, '#fff') + ink(3.5, `<circle cx="-42" cy="126" r="12" fill="#fff"/>`) +
    // baton arm
    `<g class="od-baton">` + tube('M146 132 C160 124 172 112 180 98', 11, '#fff') +
    ink(3, `<path d="M184 92 L214 46" fill="none" stroke-width="10"/>`) + `<path d="M184 92 L214 46" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` +
    ink(3, `<circle cx="215" cy="44" r="6" fill="${GOLD}"/><circle cx="182" cy="95" r="11" fill="#fff"/>`) + `</g>` +
    ink(3, `<path d="M120 122 L100 110 L100 134 Z" fill="${PINK}"/><path d="M120 122 L140 110 L140 134 Z" fill="${PINK}"/><circle cx="120" cy="122" r="6.5" fill="#FF8FB8"/>`) +
    `<g class="od-head">` + nest(catFace(), 60, 0, 120, 120) +
    `<g class="od-hat">` + ink(4, `<path d="M96 30 L124 -40 L148 26 Z" fill="${LILAC}"/>`) +
    `<path d="M104 10 L136 2 M112 -12 L130 -16" stroke="#fff" stroke-width="7" stroke-linecap="round"/>` +
    ink(3.5, `<circle cx="124" cy="-42" r="10" fill="${GOLD}"/>`) + shine(112, 0, 4, 9, 20) + `</g>` +
    `</g></g>`);
}

/** The rule sign's content for the conductor: a lollipop sign on a stick showing one fish. */
export const signInner = c => nest(signSvg(c), -104, -40, 124, 186);
const signSvg = c => svg('0 0 100 150',
  ink(4, `<rect x="44" y="84" width="12" height="62" rx="6" fill="#C98F55"/><circle cx="50" cy="48" r="44" fill="#fff"/>`) +
  `<circle cx="50" cy="48" r="36" fill="${c.water}"/>` +
  nest(fishSvg(c), 16, 24, 70, 48) + shine(28, 24, 10, 5));

/** The pond (viewBox 0 0 1000 600, sliced from the top): wave lines, lily pads and a flower. */
export function pondSvg() {
  const wave = (x, y) => `<path d="M${x} ${y} q40 -18 80 0 t80 0 t80 0" fill="none" stroke="#1E9FB4" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
  const pad = (x, y, r) => ink(4, `<path d="M${x} ${y} L${x + r} ${y - r * 0.18} A${r} ${r * 0.62} 0 1 0 ${x + r} ${y + r * 0.18} Z" fill="#4ADE9A"/>`) +
    `<path d="M${x - r * 0.6} ${y - r * 0.1} Q${x - r * 0.2} ${y - r * 0.35} ${x + r * 0.3} ${y - r * 0.15}" fill="none" stroke="#2FBF7E" stroke-width="4" stroke-linecap="round"/>`;
  return svg('0 0 1000 600',
    wave(120, 120) + wave(620, 230) + wave(260, 380) + wave(700, 500) + wave(60, 560) +
    pad(90, 470, 46) + pad(900, 330, 40) + pad(560, 580, 52) +
    ink(3, `<path d="M900 316 l-12 -20 l14 6 l6 -18 l8 18 l14 -6 l-10 20 Z" fill="#FF8FB8"/>`), 'xMidYMin slice');
}

/**
 * A wooden bucket (viewBox 0 0 160 170) holding `n` caught fish whose heads peek over the rim as
 * the pile grows. `colours` are the fish colours, in the order they were caught.
 */
export function bucketSvg(colours) {
  const spots = [[58, 40, -20], [100, 40, 20], [80, 36, 0], [46, 30, -35], [114, 30, 30], [66, 24, -10], [96, 22, 14], [80, 14, 0], [54, 12, -25], [106, 10, 22]];
  const fish = colours.slice(0, spots.length).map((c, i) => {
    const [x, y, r] = spots[i];
    return `<g transform="translate(${x} ${y}) rotate(${r - 90})">` + ink(3,
      `<path d="M-22 0 L-34 -10 L-34 10 Z" fill="${c.dark}"/><ellipse cx="0" cy="0" rx="22" ry="14" fill="${c.fill}"/>`) +
      `<circle cx="11" cy="-4" r="3.2" fill="${INK}"/></g>`;
  }).join('');
  return svg('0 -30 160 200',
    ink(4, `<ellipse cx="80" cy="44" rx="62" ry="16" fill="#5B3F8C"/>`) + fish +
    ink(4, `<path d="M18 44 L30 156 Q80 170 130 156 L142 44 Q80 62 18 44 Z" fill="${LILAC}"/>`) +
    `<path d="M50 60 L56 156 M80 64 V162 M110 60 L104 156" stroke="#8C62DB" stroke-width="4" stroke-linecap="round"/>` +
    ink(4, `<path d="M21 74 Q80 92 139 74 L137 90 Q80 108 23 90 Z" fill="${INK}"/><path d="M27 126 Q80 142 133 126 L131 140 Q80 156 29 140 Z" fill="${INK}"/>`) +
    ink(4, `<path d="M18 44 Q80 62 142 44" fill="none"/>`) + shine(36, 100, 6, 16, 6));
}
