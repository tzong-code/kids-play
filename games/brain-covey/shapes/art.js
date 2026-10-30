// Shape Sorter art: the cat-shaped toy box, its holes and the chunky blocks, drawn to match the
// Superdesign "Shape Sorter (Covey, age 2)" draft.

const INK = '#2B2340';
const HOLE = '#2A2140';
const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;

function starPath(cx, cy, R, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
}

/** The shapes (viewBox 0 0 100 100), in the order they appear. `name` is what the voice says. */
export const SHAPES = [
  { id: 'circle', name: 'circle', colour: '#FF6B6B', d: 'M50 6 a44 44 0 1 1 0 88 a44 44 0 1 1 0 -88 Z', gloss: [34, 30] },
  { id: 'square', name: 'square', colour: '#FFC93C', d: 'M20 8 H80 a12 12 0 0 1 12 12 V80 a12 12 0 0 1 -12 12 H20 a12 12 0 0 1 -12 -12 V20 a12 12 0 0 1 12 -12 Z', gloss: [28, 26] },
  { id: 'triangle', name: 'triangle', colour: '#4ADE9A', d: 'M50 6 L96 90 H4 Z', gloss: [44, 40] },
  { id: 'star', name: 'star', colour: '#B78CFF', d: starPath(50, 54, 48, 21), gloss: [42, 36] },
  { id: 'heart', name: 'heart', colour: '#FF5FA8', d: 'M50 92 C20 70 4 54 4 34 C4 18 16 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C84 8 96 18 96 34 C96 54 80 70 50 92 Z', gloss: [24, 26] },
  { id: 'rectangle', name: 'rectangle', colour: '#22B8CF', d: 'M14 26 H86 a10 10 0 0 1 10 10 V64 a10 10 0 0 1 -10 10 H14 a10 10 0 0 1 -10 -10 V36 a10 10 0 0 1 10 -10 Z', gloss: [22, 36] },
];

/** A chunky block: the shape in its colour with a thick outline, a darker base and gloss. */
export const blockSvg = s => svg('0 0 100 100',
  `<path d="${s.d}" fill="${INK}" transform="translate(0 5)"/>` +
  ink(5, `<path d="${s.d}" fill="${s.colour}"/>`) +
  shine(s.gloss[0], s.gloss[1], 10, 5));

/** A hole in the box: a dark recess of the same shape, with a little lip of light at the bottom. */
export const holeSvg = s => svg('0 0 100 100',
  `<path d="${s.d}" fill="#178C9E" transform="translate(0 4)"/>` +
  ink(4, `<path d="${s.d}" fill="${HOLE}"/>`) +
  `<g class="ss-fill"><path d="${s.d}" fill="${s.colour}" stroke="${INK}" stroke-width="4"/></g>`);

/** The cat-shaped toy box (viewBox 0 0 600 440). Eyes are in .ss-eyes so they can blink and squint. */
export const boxSvg = () => svg('0 0 600 440',
  ink(5,
    `<path d="M92 120 L118 6 L208 92 Z" fill="#22B8CF"/><path d="M508 120 L482 6 L392 92 Z" fill="#22B8CF"/>` +
    `<path d="M112 92 L126 34 L172 80 Z" fill="#7FD8F0" stroke="none"/><path d="M488 92 L474 34 L428 80 Z" fill="#7FD8F0" stroke="none"/>` +
    `<rect x="20" y="80" width="560" height="320" rx="60" fill="#22B8CF"/>` +
    `<ellipse cx="150" cy="404" rx="56" ry="30" fill="#22B8CF"/><ellipse cx="450" cy="404" rx="56" ry="30" fill="#22B8CF"/>` +
    `<path d="M134 392 V414 M150 390 V418 M166 392 V414 M434 392 V414 M450 390 V418 M466 392 V414" fill="none" stroke-width="4"/>`) +
  `<rect x="20" y="380" width="560" height="20" rx="10" fill="#138A9C" opacity=".35"/>` +
  shine(80, 122, 30, 10, -10) +
  `<g class="ss-eyes">` +
  `<g class="ss-open"><circle cx="240" cy="170" r="13" fill="${INK}"/><circle cx="245" cy="164" r="4.5" fill="#fff"/>` +
  `<circle cx="360" cy="170" r="13" fill="${INK}"/><circle cx="365" cy="164" r="4.5" fill="#fff"/></g>` +
  `<g class="ss-happy">` + ink(6, `<path d="M226 174 Q240 156 254 174 M346 174 Q360 156 374 174" fill="none"/>`) + `</g></g>` +
  ink(4, `<path d="M290 186 H310 L300 198 Z" fill="#FF8FB8"/>`) +
  `<g class="ss-shut">` + ink(4, `<path d="M300 198 Q300 214 282 212 M300 198 Q300 214 318 212" fill="none"/>`) + `</g>` +
  `<g class="ss-mouth"><ellipse cx="300" cy="214" rx="18" ry="16" fill="${INK}"/><ellipse cx="300" cy="222" rx="10" ry="6" fill="#FF8FB8"/></g>` +
  `<ellipse cx="206" cy="204" rx="16" ry="9" fill="#FF8FB8" opacity=".6"/><ellipse cx="394" cy="204" rx="16" ry="9" fill="#FF8FB8" opacity=".6"/>` +
  ink(4, `<path d="M196 170 L136 160 M196 184 L132 188 M404 170 L464 160 M404 184 L468 188" fill="none"/>`));
