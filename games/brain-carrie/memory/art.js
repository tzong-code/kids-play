// Sticker Memory art: the card back (pink with paw prints and a gold crown) and the 1-or-2
// players button, drawn to match the Superdesign "Sticker Memory (Carrie, age 5)" draft.

const INK = '#2B2340';
const GOLD = '#FFC93C';
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const paw = (x, y, r, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${r})" fill="#fff" opacity=".35">` +
  `<ellipse cx="0" cy="4" rx="6" ry="5"/><circle cx="-6" cy="-4" r="2.6"/><circle cx="-2" cy="-7.5" r="2.6"/><circle cx="2" cy="-7.5" r="2.6"/><circle cx="6" cy="-4" r="2.6"/></g>`;

/** The back of every card (viewBox 0 0 100 100): paw prints and a gold crown. */
export const cardBackSvg = () => svg('0 0 100 100',
  paw(18, 20, 1, -20) + paw(82, 22, 0.9, 25) + paw(16, 80, 0.9, 15) + paw(84, 82, 1, -15) +
  ink(3.5, `<path d="M30 64 L26 34 L40 46 L50 26 L60 46 L74 34 L70 64 Z" fill="${GOLD}"/><rect x="29" y="62" width="42" height="9" rx="4.5" fill="${GOLD}"/>`) +
  ink(2.5, `<circle cx="50" cy="52" r="5" fill="#FF8FB8"/><circle cx="38" cy="54" r="3" fill="#4D96FF"/><circle cx="62" cy="54" r="3" fill="#4ADE9A"/>`) +
  shine(38, 42, 4, 8, 20));

/** The players button: one face, or two faces side by side (viewBox 0 0 80 60). */
export function playersSvg(two) {
  const face = (x, c) => ink(3, `<circle cx="${x}" cy="26" r="13" fill="${c}"/><path d="M${x - 20} 56 C${x - 18} 40 ${x + 18} 40 ${x + 20} 56 Z" fill="${c}"/>`) +
    `<circle cx="${x - 4}" cy="25" r="2" fill="${INK}"/><circle cx="${x + 4}" cy="25" r="2" fill="${INK}"/>`;
  return svg('0 0 80 60', two ? face(24, '#FF8FB8') + face(56, '#7FD8F0') : face(40, '#FF8FB8'));
}
