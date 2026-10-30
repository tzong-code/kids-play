// Big and Small art: cat beds (with a curled-up sleeper), knit hats, tall and short houses and the
// night-time bedroom, drawn to match the Superdesign "Big and Small (Covey, age 2)" draft.
// Sitting cats, fish and bowls are shared with Kitty Says and Colour Match.

const INK = '#2B2340';
const GOLD = '#FFC93C';
const svg = (vb, body, fit = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ''}>${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const tube = (d, w, color) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
function starPath(cx, cy, R, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
}

/** Small, medium and big cats (fur for the sitting cat and its sleeping twin). */
export const CAT_FURS = [
  { fur: '#FFFFFF', dark: '#E3DCEF' },
  { fur: '#FFB259', dark: '#E08A2E' },
  { fur: '#B8B3C7', dark: '#8F89A3' },
];

/** A padded cat bed (viewBox 0 0 300 170). The sleeping cat inside shows when the bed is .home. */
export function bedSvg(colour, cat) {
  const rim = 'M10 100 A140 52 0 0 1 290 100 A140 52 0 0 1 10 100 Z';
  return svg('0 0 300 170',
    ink(5, `<path d="${rim}" fill="${colour}" transform="translate(0 10)"/><path d="${rim}" fill="${colour}"/>`) +
    ink(4, `<ellipse cx="150" cy="98" rx="112" ry="34" fill="#FFF8EE"/>`) +
    `<g class="bs-sleeper">` +
    tube('M214 104 C250 104 252 78 228 72', 12, cat.fur) +
    ink(4, `<ellipse cx="160" cy="92" rx="66" ry="30" fill="${cat.fur}"/>`) +
    ink(4, `<path d="M74 70 L70 40 L94 56 Z M122 66 L126 38 L104 54 Z" fill="${cat.fur}"/><ellipse cx="98" cy="80" rx="34" ry="28" fill="${cat.fur}"/>`) +
    ink(3, `<path d="M82 80 Q88 86 94 80 M102 80 Q108 86 114 80" fill="none"/>`) +
    `<ellipse cx="78" cy="90" rx="6" ry="3.5" fill="#FF8FB8" opacity=".7"/><ellipse cx="118" cy="90" rx="6" ry="3.5" fill="#FF8FB8" opacity=".7"/>` +
    `<g class="bs-zzz">` + ink(3, `<path d="M130 34 h14 l-14 15 h14 M152 14 h10 l-10 11 h10" fill="none"/>`) + `</g></g>` +
    // the front lip of the bed, drawn over the sleeper so it nestles in
    ink(4, `<path d="M10 100 A140 52 0 0 0 290 100 L272 100 A124 38 0 0 1 28 100 Z" fill="${colour}"/>`) +
    shine(60, 74, 22, 6, -12));
}

/** A knit bobble hat (viewBox 0 0 120 100). */
export const hatSvg = (colour, band) => svg('0 0 120 100',
  ink(4, `<path d="M16 76 C14 36 36 18 60 18 C84 18 106 36 104 76 Z" fill="${colour}"/>`) +
  `<path d="M40 30 C36 46 36 60 38 74 M60 22 V74 M80 30 C84 46 84 60 82 74" fill="none" stroke="${band}" stroke-width="4" opacity=".6"/>` +
  ink(4, `<rect x="8" y="70" width="104" height="22" rx="11" fill="${band}"/><circle cx="60" cy="14" r="12" fill="#fff"/>`) +
  shine(36, 40, 8, 4));

/** A little house with a doorway: tall (viewBox 0 0 200 360) or short (viewBox 0 0 200 220). */
export function houseSvg(tall) {
  const h = tall ? 360 : 220, door = tall ? 250 : 120;
  return svg(`0 0 200 ${h}`,
    ink(5, `<path d="M6 70 L100 6 L194 70 Z" fill="${tall ? '#FF8A7A' : '#B78CFF'}"/>`) +
    ink(5, `<rect x="16" y="64" width="168" height="${h - 70}" rx="12" fill="${tall ? '#FFE3A6' : '#CFF3F8'}"/>`) +
    ink(4, `<path d="M40 ${h - 6} V${h - door + 40} a60 60 0 0 1 120 0 V${h - 6} Z" fill="#3B2E58"/>`) +
    shine(40, 90, 10, 5, 0));
}

/** The bedroom at night: lilac wall, window with moon and stars, wooden floor (slice). */
export function bedroomSvg() {
  let planks = '';
  for (let x = 0; x <= 1000; x += 160) planks += `<path d="M${x} 410 V610" stroke="#C99A62" stroke-width="4"/>`;
  return svg('0 0 1000 600',
    `<rect width="1000" height="600" fill="#E9E5FB"/>` +
    ink(3, `<path d="${starPath(130, 110, 22, 9)}" fill="${GOLD}"/><path d="${starPath(840, 190, 16, 7)}" fill="${GOLD}"/><path d="${starPath(760, 70, 11, 5)}" fill="#fff"/>`) +
    ink(5, `<rect x="400" y="40" width="200" height="220" rx="16" fill="#2E2752"/><path d="M500 40 V260 M400 150 H600" fill="none" stroke-width="7"/>`) +
    ink(3, `<path d="M548 70 a24 24 0 1 0 22 32 a18 18 0 1 1 -22 -32 Z" fill="${GOLD}"/><path d="${starPath(440, 200, 8, 3.5)}" fill="#fff"/>`) +
    ink(5, `<path d="M384 36 Q450 70 500 36 Q550 70 616 36" fill="#B78CFF"/>`) +
    ink(5, `<rect x="-10" y="404" width="1020" height="220" fill="#E8B575"/>`) + planks, 'xMidYMax slice');
}
