// Colour Match art: round cartoon fish, glass bowls and the tank floor, drawn to match the
// Superdesign "Colour Match (Covey, age 2)" draft.

const INK = '#2B2340';
const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;

/** The six colours, in the order they are introduced. `name` is what the voice says. */
export const COLOURS = [
  { id: 'red', name: 'red', fill: '#FF6B6B', dark: '#D94848', water: '#FFD6D6' },
  { id: 'blue', name: 'blue', fill: '#4D96FF', dark: '#2B6BCC', water: '#D3E6FF' },
  { id: 'yellow', name: 'yellow', fill: '#FFC93C', dark: '#E0A21A', water: '#FFF0BF' },
  { id: 'green', name: 'green', fill: '#4ADE9A', dark: '#22A86C', water: '#CFF7E4' },
  { id: 'purple', name: 'purple', fill: '#B78CFF', dark: '#8C62DB', water: '#E9DDFF' },
  { id: 'orange', name: 'orange', fill: '#FF9F43', dark: '#DB7A1F', water: '#FFE3C7' },
];

/** A round fish facing right (viewBox 0 0 160 110). */
export const fishSvg = c => svg('0 0 160 110', ink(4,
  `<path d="M34 55 L6 30 L12 55 L6 80 Z" fill="${c.dark}"/>` +
  `<path d="M70 22 L84 4 L104 20 Z" fill="${c.dark}"/><path d="M76 88 L88 104 L102 88 Z" fill="${c.dark}"/>` +
  `<ellipse cx="88" cy="55" rx="58" ry="38" fill="${c.fill}"/>`) +
  `<path d="M84 40 Q92 47 84 54 M84 56 Q92 63 84 70" fill="none" stroke="${c.dark}" stroke-width="4" stroke-linecap="round"/>` +
  ink(3, `<circle cx="120" cy="46" r="11" fill="#fff"/><path d="M110 70 Q120 78 132 68" fill="none"/>`) +
  `<circle cx="123" cy="46" r="5.5" fill="${INK}"/><circle cx="125" cy="43.5" r="2" fill="#fff"/>` +
  shine(70, 34, 14, 6));

/** A round glass bowl with coloured water and rim (viewBox 0 0 200 200). */
export const bowlSvg = c => svg('0 0 200 200',
  `<defs><clipPath id="cm-water-${c.id}"><circle cx="100" cy="112" r="80"/></clipPath></defs>` +
  `<circle cx="100" cy="112" r="80" fill="#F2FBFF" opacity=".85"/>` +
  `<rect x="10" y="74" width="180" height="130" fill="${c.water}" clip-path="url(#cm-water-${c.id})"/>` +
  `<path d="M24 82 Q100 70 176 82" fill="none" stroke="#fff" stroke-width="4" opacity=".8" clip-path="url(#cm-water-${c.id})"/>` +
  ink(4, `<circle cx="100" cy="112" r="80" fill="none"/>`) +
  ink(4, `<rect x="44" y="24" width="112" height="22" rx="11" fill="${c.fill}"/>`) +
  `<path d="M42 118 C40 92 52 74 68 66" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".7"/>` +
  shine(70, 30, 12, 3, 0));

/** Sand, pebbles and seaweed along the bottom of the tank (viewBox 0 0 1000 200, slice). */
export const tankFloorSvg = () => {
  const weed = x => `<path d="M${x} 196 C${x - 30} 140 ${x + 30} 110 ${x} 40 M${x + 18} 196 C${x + 48} 140 ${x - 12} 100 ${x + 22} 50" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>` +
    `<path d="M${x} 196 C${x - 30} 140 ${x + 30} 110 ${x} 40 M${x + 18} 196 C${x + 48} 140 ${x - 12} 100 ${x + 22} 50" fill="none" stroke="#4ADE9A" stroke-width="14" stroke-linecap="round"/>`;
  return svg('0 0 1000 200', weed(120) + weed(860) + weed(520) +
    ink(4, `<path d="M-10 150 C200 120 420 150 600 140 C780 130 900 110 1010 128 V210 H-10 Z" fill="#FBE2B0"/>` +
      `<ellipse cx="260" cy="160" rx="26" ry="15" fill="#B78CFF"/><ellipse cx="300" cy="166" rx="14" ry="10" fill="#FFC93C"/>` +
      `<ellipse cx="740" cy="150" rx="28" ry="16" fill="#FF8A7A"/>`), 'xMidYMax slice');
};
