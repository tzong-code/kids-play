// Kitty Says art: four sitting cats on cushions and a little theatre stage, drawn to match the
// Superdesign "Kitty Says (Carrie, age 5)" draft.

const INK = '#2B2340';
const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;

/** The four cats, in grid order. `note` is the meow pitch: together they play C E G C. */
export const CATS = [
  { id: 'pink', name: 'pink', fur: '#FF5FA8', dark: '#D63E86', note: 523.3 },
  { id: 'blue', name: 'blue', fur: '#4D96FF', dark: '#2B6BCC', note: 659.3 },
  { id: 'yellow', name: 'yellow', fur: '#FFC93C', dark: '#E0A21A', note: 784 },
  { id: 'green', name: 'green', fur: '#4ADE9A', dark: '#22A86C', note: 1046.5 },
];

/** A cat sitting on a cushion (viewBox 0 0 200 220). Mouth shut by default; `.meow` opens it. */
export function sittingCatSvg({ fur, dark }) {
  const eye = x => `<ellipse cx="${x}" cy="84" rx="6" ry="7.5" fill="${INK}" stroke="none"/><circle cx="${x + 2.2}" cy="80.5" r="2.4" fill="#fff" stroke="none"/>`;
  return svg('0 0 200 220',
    `<g class="ks-halo"><circle cx="100" cy="118" r="98" fill="#fff" opacity=".6"/><circle cx="100" cy="118" r="80" fill="${fur}" opacity=".28"/></g>` +
    ink(4, `<ellipse cx="100" cy="204" rx="80" ry="14" fill="#EFE8FF"/>`) +
    `<g class="ks-body">` +
    `<path d="M128 194 C182 194 186 140 160 116" fill="none" stroke="${INK}" stroke-width="21" stroke-linecap="round"/>` +
    `<path d="M128 194 C182 194 186 140 160 116" fill="none" stroke="${fur}" stroke-width="14" stroke-linecap="round"/>` +
    ink(4, `<path d="M60 200 C56 152 70 124 100 124 C130 124 144 152 140 200 Z" fill="${fur}"/>`) +
    `<ellipse cx="100" cy="170" rx="22" ry="22" fill="#fff" opacity=".35"/>` +
    ink(3.5, `<ellipse cx="82" cy="199" rx="13" ry="7" fill="${fur}"/><ellipse cx="118" cy="199" rx="13" ry="7" fill="${fur}"/>`) +
    `<g class="ks-head">` + ink(4,
      `<path d="M52 94 L46 30 L90 58 Z" fill="${fur}"/><path d="M148 94 L154 30 L110 58 Z" fill="${fur}"/>` +
      `<path d="M58 72 L56 44 L76 58 Z" fill="${dark}" stroke="none"/><path d="M142 72 L144 44 L124 58 Z" fill="${dark}" stroke="none"/>` +
      `<ellipse cx="100" cy="90" rx="54" ry="45" fill="${fur}"/>`) +
    `<ellipse cx="100" cy="106" rx="24" ry="15" fill="#fff" opacity=".45"/>` +
    eye(80) + eye(120) +
    `<ellipse cx="66" cy="102" rx="8" ry="4.5" fill="#FF8FB8" opacity=".8"/><ellipse cx="134" cy="102" rx="8" ry="4.5" fill="#FF8FB8" opacity=".8"/>` +
    ink(2, `<path d="M95 98 H105 L100 104 Z" fill="#FF8FB8"/>`) +
    ink(2.8, `<g class="ks-shut"><path d="M100 104 Q100 112 92 111 M100 104 Q100 112 108 111" fill="none"/></g>` +
      `<g class="ks-open"><ellipse cx="100" cy="114" rx="9" ry="11" fill="${INK}"/><ellipse cx="100" cy="119" rx="5" ry="4" fill="#FF8FB8" stroke="none"/></g>` +
      `<path d="M58 98 L38 94 M58 106 L40 110 M142 98 L162 94 M142 106 L160 110" fill="none" stroke-width="2.4"/>`) +
    shine(78, 62, 12, 5) + `</g></g>`);
}

/** The theatre: pink wall, warm floor, lilac curtains (viewBox 0 0 1000 600, slice). */
export function stageSvg() {
  let scallops = 'M-10 0 H1010 V64';
  for (let x = 1010; x > -10; x -= 84) scallops += ` Q${x - 42} 112 ${x - 84} 64`;
  return svg('0 0 1000 600',
    `<rect width="1000" height="600" fill="#FFE6F2"/>` +
    `<path d="M200 0 C190 150 210 300 260 420 H740 C790 300 810 150 800 0 Z" fill="#FFF3F9"/>` +
    ink(4, `<path d="M-10 400 C300 370 700 370 1010 400 V610 H-10 Z" fill="#FFC98A"/>`) +
    `<path d="M-10 432 C300 404 700 404 1010 432" fill="none" stroke="#FFDDB0" stroke-width="10"/>` +
    `<ellipse cx="500" cy="500" rx="320" ry="60" fill="#FFE2B8" opacity=".7"/>` +
    ink(4,
      `<path d="M-10 0 H190 C170 160 140 330 80 610 H-10 Z" fill="#B78CFF"/>` +
      `<path d="M1010 0 H810 C830 160 860 330 920 610 H1010 Z" fill="#B78CFF"/>` +
      `<path d="M60 40 C70 200 50 380 30 600 M940 40 C930 200 950 380 970 600" fill="none" stroke="#9B6FE8" stroke-width="5"/>` +
      `<path d="${scallops} V0 Z" fill="#B78CFF"/>`) +
    shine(120, 160, 14, 60, 8) + shine(880, 160, 14, 60, -8), 'xMidYMid slice');
}

/** A small paw print for the sequence dots (viewBox 0 0 40 40). */
export const pawSvg = () => svg('0 0 40 40', ink(2.5,
  `<ellipse cx="20" cy="26" rx="10" ry="8.5"/><circle cx="9" cy="15" r="4.5"/><circle cx="17" cy="9" r="4.5"/><circle cx="25" cy="9" r="4.5"/><circle cx="32" cy="15" r="4.5"/>`));

export const starSvg = () => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? 7.5 : 17;
    d += `${i ? 'L' : 'M'}${(20 + Math.cos(a) * r).toFixed(1)} ${(21 + Math.sin(a) * r).toFixed(1)}`;
  }
  return svg('0 0 40 40', ink(2.5, `<path d="${d}Z"/>`));
};

export const noteSvg = (color = '#B78CFF') => svg('0 0 40 48', ink(3,
  `<path d="M16 38 V8 L32 4 V30" fill="none"/><ellipse cx="11" cy="38" rx="8" ry="6" fill="${color}"/><ellipse cx="27" cy="31" rx="8" ry="6" fill="${color}"/>`));
