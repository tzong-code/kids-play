// Pattern Parade art: a side-on marching cat (with a hat, bow or crown), its dashed "ghost" for the
// gap, the drum, the bunting and the sky over the street with a castle, drawn to match the Superdesign
// "Pattern Parade (Carrie, age 5)" draft.

const INK = '#2B2340';
const PINK = '#FF5FA8', LILAC = '#B78CFF', GOLD = '#FFC93C', MINT = '#4ADE9A', BLUE = '#4D96FF', CORAL = '#FF8A7A';
const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const tube = (d, w, color) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

/** What a cat can wear on its head. `name` is what the voice says. */
export const HATS = {
  hat: { name: 'hat', svg: ink(4, `<rect x="130" y="-14" width="38" height="40" rx="5" fill="#5B3F8C"/><ellipse cx="149" cy="28" rx="32" ry="7" fill="#5B3F8C"/>`) +
    `<rect x="132" y="12" width="34" height="9" fill="${PINK}"/>` + shine(140, -4, 3, 8, 0) },
  bow: { name: 'bow', svg: ink(4, `<path d="M149 22 L118 4 L120 40 Z" fill="${PINK}"/><path d="M149 22 L180 4 L178 40 Z" fill="${PINK}"/><circle cx="149" cy="22" r="9" fill="#FF8FB8"/>`) +
    shine(128, 16, 4, 7, 20) },
  crown: { name: 'crown', svg: ink(4, `<path d="M126 32 L122 2 L138 14 L149 -6 L160 14 L176 2 L172 32 Z" fill="${GOLD}"/><circle cx="149" cy="22" r="4" fill="${PINK}"/>`) +
    shine(134, 12, 3, 6, 10) },
};

/**
 * A cat marching to the right (viewBox 0 -40 200 210; feet at y 162). Legs are in .pp-legs-a and
 * .pp-legs-b so they can step in turn. `hat` is a key of HATS; `drum` hangs a drum at its chest.
 */
export function marcherSvg({ fur, dark }, { hat = null, drum = false } = {}) {
  const leg = x => `<rect x="${x}" y="110" width="20" height="50" rx="10" fill="${fur}"/><ellipse cx="${x + 12}" cy="160" rx="14" ry="7" fill="${fur}"/>`;
  return svg('0 -40 200 210',
    `<ellipse cx="100" cy="164" rx="76" ry="8" fill="${INK}" opacity=".12"/>` +
    tube('M46 96 C20 92 12 64 26 40', 14, fur) +
    `<g class="pp-legs-b">${ink(4, leg(70) + leg(124))}</g>` +
    ink(4, `<ellipse cx="98" cy="100" rx="60" ry="34" fill="${fur}"/>`) +
    `<ellipse cx="100" cy="116" rx="34" ry="12" fill="#fff" opacity=".3"/>` + shine(72, 82, 18, 6, -8) +
    `<g class="pp-legs-a">${ink(4, leg(54) + leg(108))}</g>` +
    `<g class="pp-head">` + ink(4,
      `<path d="M120 52 L124 10 L146 34 Z" fill="${fur}"/><path d="M164 32 L182 6 L184 52 Z" fill="${fur}"/>` +
      `<path d="M126 38 L128 20 L138 32 Z M170 34 L178 20 L178 42 Z" fill="${dark}" stroke="none"/>` +
      `<ellipse cx="152" cy="66" rx="40" ry="34" fill="${fur}"/>`) +
    `<ellipse cx="164" cy="78" rx="18" ry="11" fill="#fff" opacity=".4"/>` +
    `<ellipse cx="160" cy="60" rx="6" ry="7.5" fill="${INK}"/><circle cx="162.5" cy="56.5" r="2.4" fill="#fff"/>` +
    `<ellipse cx="146" cy="76" rx="8" ry="4.5" fill="#FF8FB8" opacity=".8"/>` +
    ink(2.5, `<path d="M184 68 L192 70 L186 76 Z" fill="#FF8FB8"/><path d="M184 76 Q178 84 170 80" fill="none" stroke-width="3"/>`) +
    (hat ? HATS[hat].svg : '') + `</g>` +
    (drum ? ink(4, `<path d="M108 76 L140 112" fill="none" stroke-width="3"/><ellipse cx="128" cy="112" rx="22" ry="8" fill="#fff"/>` +
      `<path d="M106 112 V134 A22 8 0 0 0 150 134 V112 A22 8 0 0 1 106 112 Z" fill="${CORAL}"/>` +
      `<path d="M110 116 L120 132 L130 117 L140 132 L146 117" fill="none" stroke="#fff" stroke-width="3"/>`) : ''));
}

/** The bunting strung across the top (viewBox 0 0 1000 90, fitted to the width). */
export function buntingSvg() {
  const flags = [GOLD, BLUE, CORAL, MINT, LILAC, GOLD, PINK, BLUE];
  let body = ink(4, `<path d="M-10 14 Q120 54 250 14 Q380 54 510 14 Q640 54 770 14 Q900 54 1010 14" fill="none"/>`);
  flags.forEach((c, i) => {
    const x = 60 + i * 125, y = 30 + (i % 2 ? -4 : 4);
    body += ink(3.5, `<path d="M${x - 22} ${y} L${x + 22} ${y} L${x} ${y + 44} Z" fill="${c}"/>`);
  });
  return svg('0 0 1000 90', body, 'xMidYMin meet');
}

/** The sky over the street (viewBox 0 0 1000 400, sliced from the bottom) with a far castle. */
export function skySvg() {
  return svg('0 0 1000 400',
    `<rect width="1000" height="400" fill="#FFE1EF"/>` +
    ink(3, `<rect x="420" y="280" width="44" height="124" fill="#D9C2FF"/><rect x="536" y="280" width="44" height="124" fill="#D9C2FF"/>` +
      `<path d="M412 282 L442 240 L472 282 Z M528 282 L558 240 L588 282 Z" fill="#FFD27A"/>` +
      `<path d="M464 330 V312 H478 V324 H492 V312 H508 V324 H522 V312 H536 V404 H464 Z" fill="#FBD3E8"/>` +
      `<path d="M486 404 V378 A14 14 0 0 1 514 378 V404 Z" fill="#FF8FB8"/>`), 'xMidYMax slice');
}
