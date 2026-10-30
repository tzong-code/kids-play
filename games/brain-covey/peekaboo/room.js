// Peekaboo Cats art: the cosy room and its four hiding places, laid out like the Superdesign
// "Peekaboo Cats (Covey, age 2)" draft. Each hiding place is two SVG layers (back and front) with
// the cat sliding up between them, so the front can open: box flaps, curtain panels, the duvet
// lifts, the leaves part. Class names (pb-*) are the hooks the CSS animates.

const INK = '#2B2340';
const GOLD = '#FFC93C', GOLD_D = '#E0A21A', CORAL = '#FF8A7A', LAGOON = '#22B8CF', MINT = '#4ADE9A', MINT_D = '#22A86C';
const LILAC = '#B78CFF', LILAC_D = '#9B6FE8', RED = '#E8605A', CARD = '#E8B575', CARD_D = '#C98F55';

const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const tube = (d, w, color) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** The room behind everything: dotty wallpaper, skirting, wooden floor, a rug (slice to fill). */
export function roomSvg() {
  let planks = '';
  for (let y = 450; y < 600; y += 38) planks += `<path d="M-10 ${y} H1010" stroke="#E9BE86" stroke-width="4"/>`;
  return svg('0 0 1000 600',
    `<defs><pattern id="pb-dots" width="56" height="56" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="6" fill="#FFD3E6"/><circle cx="42" cy="42" r="6" fill="#FFD3E6"/></pattern></defs>` +
    `<rect width="1000" height="600" fill="#FFF1F7"/><rect width="1000" height="420" fill="url(#pb-dots)"/>` +
    ink(4, `<rect x="-10" y="404" width="1020" height="22" fill="#fff"/>`) +
    ink(4, `<rect x="-10" y="426" width="1020" height="190" fill="#FADDB0"/>`) + planks +
    ink(4, `<ellipse cx="520" cy="540" rx="300" ry="44" fill="#CFF3F8"/>`) +
    `<ellipse cx="520" cy="540" rx="250" ry="30" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 12"/>`, 'xMidYMid slice');
}

// ---------- the four hiding places ----------

const box = {
  vb: '0 0 240 220',
  back: () => ink(4, `<path d="M38 104 L58 80 H186 L206 104 Z" fill="${CARD_D}"/>`),
  front: () => ink(4,
    `<g class="pb-flapL"><path d="M38 104 L58 80 H124 L120 104 Z" fill="${CARD}"/></g>` +
    `<g class="pb-flapR"><path d="M206 104 L186 80 H124 L120 104 Z" fill="${CARD}"/></g>` +
    `<rect x="26" y="102" width="192" height="112" rx="10" fill="${CARD}"/>` +
    `<rect x="104" y="102" width="36" height="34" fill="#F5D6A4" stroke="none"/>` +
    `<path d="M70 168 C78 156 92 156 100 168 C108 156 122 156 130 168 M150 168 a12 12 0 1 0 24 0" fill="none" stroke="${CARD_D}" stroke-width="5"/>`) +
    shine(52, 120, 14, 5, 0),
  win: { l: 18, t: -38, w: 64, h: 85 },     // the opening, in % of the place
  open: '30%',                              // how far up the cat comes (translateY of its own height)
  tail: { l: 84, t: 52, r: 30 },
};

const curtain = {
  vb: '0 0 200 300',
  back: () => ink(4,
    `<rect x="26" y="44" width="148" height="150" rx="12" fill="#BDEBFF"/>` +
    `<circle cx="128" cy="96" r="22" fill="${GOLD}"/>` +
    `<path d="M100 44 V194 M26 118 H174" fill="none" stroke-width="6"/>` +
    `<rect x="18" y="190" width="164" height="16" rx="6" fill="#fff"/>`) + shine(50, 70, 12, 5),
  front: () => {
    const folds = x => `<path d="M${x} 32 C${x - 4} 120 ${x + 4} 200 ${x} 276" fill="none" stroke="${LILAC_D}" stroke-width="4"/>`;
    return ink(4,
      `<g class="pb-panelL"><path d="M14 26 H102 V282 C78 292 40 292 14 282 Z" fill="${LILAC}"/>${folds(40)}${folds(72)}</g>` +
      `<g class="pb-panelR"><path d="M186 26 H98 V282 C122 292 160 292 186 282 Z" fill="${LILAC}"/>${folds(128)}${folds(160)}</g>`) +
      tube('M6 24 H194', 6, '#D9D2E6') + ink(3.5, `<circle cx="8" cy="24" r="9" fill="${CORAL}"/><circle cx="192" cy="24" r="9" fill="${CORAL}"/>`) +
      shine(34, 60, 6, 22, 0);
  },
  win: { l: 18, t: 28, w: 64, h: 68 },
  open: '0%',
  tail: { l: 58, t: 88, r: -10 },
};

const bed = {
  vb: '0 0 240 200',
  back: () => ink(4,
    `<rect x="186" y="36" width="44" height="134" rx="22" fill="${CORAL}"/>` +
    `<rect x="30" y="170" width="16" height="24" rx="6" fill="${RED}"/><rect x="200" y="170" width="16" height="24" rx="6" fill="${RED}"/>`) +
    shine(200, 56, 5, 14, 0),
  front: () => ink(4,
    `<rect x="14" y="146" width="216" height="30" rx="12" fill="${RED}"/>` +
    `<rect x="18" y="120" width="190" height="34" rx="14" fill="#D6F2FF"/>` +
    `<path d="M150 118 C146 98 160 90 182 92 C200 94 206 106 202 122 Z" fill="#fff"/>` +
    `<g class="pb-duvet"><path d="M12 158 C8 116 30 104 66 104 H150 C162 104 168 124 166 158 Z" fill="${MINT}"/>` +
    `<path d="M40 122 Q70 112 100 122 T156 120 M34 142 Q64 132 96 142 T160 140" fill="none" stroke="${MINT_D}" stroke-width="4"/></g>`) +
    shine(44, 116, 14, 5, -8),
  win: { l: 8, t: -30, w: 62, h: 86 },
  open: '28%',
  tail: { l: 4, t: 64, r: -40 },
};

const plant = {
  vb: '0 0 200 300',
  // the stems sit behind the cat so they never cross her face
  back: () => ink(4, `<path d="M100 200 V120 M100 160 L66 120 M100 150 L136 110" fill="none" stroke="${MINT_D}" stroke-width="7"/>`),
  front: () => {
    const leaf = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>` + shine(cx - r * 0.35, cy - r * 0.4, r * 0.28, r * 0.14);
    return ink(4,
      `<g class="pb-leavesL">${leaf(58, 112, 40, MINT_D)}${leaf(46, 168, 30, MINT)}${leaf(86, 64, 40, MINT)}</g>` +
      `<g class="pb-leavesR">${leaf(142, 106, 42, MINT)}${leaf(156, 164, 30, MINT_D)}${leaf(118, 58, 34, MINT_D)}</g>` +
      `<path d="M40 214 H160 L148 292 H52 Z" fill="${GOLD}"/><rect x="32" y="196" width="136" height="24" rx="8" fill="${GOLD_D}"/>`) +
      shine(56, 236, 6, 16, 8);
  },
  win: { l: 12, t: 4, w: 76, h: 62 },
  open: '18%',
  tail: { l: 4, t: 70, r: -30 },
};

/** The hiding places in room order, left to right. `name` is what the voice says. */
export const PLACES = [
  { id: 'box', name: 'box', ...box },
  { id: 'curtain', name: 'curtain', ...curtain },
  { id: 'bed', name: 'bed', ...bed },
  { id: 'plant', name: 'plant', ...plant },
];

export const placeSvg = (p, layer) => svg(p.vb, p[layer]());

/** A cat's tail poking out as a hint (viewBox 0 0 60 90). */
export const tailSvg = color => svg('0 0 60 90',
  tube('M16 86 C10 50 48 56 40 14', 13, color));
