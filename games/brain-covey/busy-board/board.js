// The Busy Board's nine toys, drawn as chunky-toy SVG (one viewBox 0 0 240 200 per toy).
// Layout follows the Superdesign "Busy Board (Covey, age 2)" draft; the toys are drawn bigger
// and chunkier than the draft so a two-year-old's whole hand fits on each one.
// Class names (bb-*) are the hooks index.js animates.

const INK = '#2B2340';
const GOLD = '#FFC93C', GOLD_D = '#E0A21A', CORAL = '#FF8A7A', LAGOON = '#22B8CF', MINT = '#4ADE9A';
const PINK = '#FF5FA8', LILAC = '#B78CFF', BLUE = '#4D96FF', RED = '#FF6B6B', WOOD = '#B07A4E';
const HOLE = '#3B2E58', STEEL = '#CFC9DC';

const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200">${body}</svg>`;
const ink = (w, body) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const shine = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const tube = (d, w, color, extra = '') =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"${extra}/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const hit = (x, y, w, h, cls = 'bb-hit') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent"/>`;

/** A round cat face. With `track`, the pupils sit in a .bb-pupils group so they can follow things. */
export function kitty(cx, cy, r, fur = '#fff', track = false) {
  const ex = r * 0.38, ey = cy - r * 0.05;
  const eye = x => track
    ? `<circle cx="${x}" cy="${ey}" r="${r * 0.2}" fill="#fff" stroke-width="2.5"/>`
    : `<ellipse cx="${x}" cy="${ey}" rx="${r * 0.12}" ry="${r * 0.16}" fill="${INK}" stroke="none"/><circle cx="${x + r * 0.04}" cy="${ey - r * 0.06}" r="${r * 0.05}" fill="#fff" stroke="none"/>`;
  const pupils = track
    ? `<g class="bb-pupils">${[cx - ex, cx + ex].map(x => `<circle cx="${x}" cy="${ey}" r="${r * 0.1}" fill="${INK}" stroke="none"/>`).join('')}</g>`
    : '';
  return ink(3.5,
    `<path d="M${cx - r * 0.92} ${cy - r * 0.15} L${cx - r * 0.78} ${cy - r * 1.12} L${cx - r * 0.18} ${cy - r * 0.78} Z" fill="${fur}"/>` +
    `<path d="M${cx + r * 0.92} ${cy - r * 0.15} L${cx + r * 0.78} ${cy - r * 1.12} L${cx + r * 0.18} ${cy - r * 0.78} Z" fill="${fur}"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.86}" fill="${fur}"/>` +
    eye(cx - ex) + eye(cx + ex) + pupils +
    `<ellipse cx="${cx - r * 0.62}" cy="${cy + r * 0.3}" rx="${r * 0.15}" ry="${r * 0.09}" fill="#FF8FB8" opacity=".8" stroke="none"/>` +
    `<ellipse cx="${cx + r * 0.62}" cy="${cy + r * 0.3}" rx="${r * 0.15}" ry="${r * 0.09}" fill="#FF8FB8" opacity=".8" stroke="none"/>` +
    `<path d="M${cx - r * 0.1} ${cy + r * 0.2} H${cx + r * 0.1} L${cx} ${cy + r * 0.31} Z" fill="#FF8FB8" stroke-width="1.8"/>` +
    `<path d="M${cx} ${cy + r * 0.31} Q${cx} ${cy + r * 0.46} ${cx - r * 0.16} ${cy + r * 0.44} M${cx} ${cy + r * 0.31} Q${cx} ${cy + r * 0.46} ${cx + r * 0.16} ${cy + r * 0.44}" fill="none" stroke-width="2.4"/>`);
}

/** 1. Three light switches, each with a bulb above. */
export function switchesSvg() {
  const knobs = [CORAL, MINT, LAGOON];
  let s = ink(4, `<rect x="22" y="90" width="196" height="100" rx="26" fill="#fff"/>`) + shine(52, 102, 18, 5, 0);
  [60, 120, 180].forEach((x, i) => {
    s += `<g class="bb-bulb" data-i="${i}">` +
      `<circle class="bb-glow" cx="${x}" cy="44" r="36" fill="${GOLD}" stroke="none"/>` +
      ink(3.5, `<rect x="${x - 10}" y="60" width="20" height="16" rx="4" fill="${STEEL}"/>` +
        `<circle class="bb-glass" cx="${x}" cy="42" r="24" fill="#EEEAF4"/>`) +
      shine(x - 8, 33, 7, 4) + `</g>`;
    s += `<g class="bb-switch" data-i="${i}">` +
      ink(3.5, `<rect x="${x - 18}" y="104" width="36" height="74" rx="18" fill="#E9E4F2"/>`) +
      `<g class="bb-knob">` + ink(3.5, `<rect x="${x - 15}" y="140" width="30" height="35" rx="13" fill="${knobs[i]}"/>`) +
      shine(x - 5, 148, 6, 3, 0) + `</g>` +
      hit(x - 30, 4, 60, 194) + `</g>`;
  });
  return svg(s);
}

/** 2. A big dial; the cat beside it watches the pointer go round. */
export function dialSvg() {
  let notches = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    notches += `<circle cx="${(88 + Math.cos(a) * 54).toFixed(1)}" cy="${(110 + Math.sin(a) * 54).toFixed(1)}" r="6" fill="${GOLD_D}" stroke="none"/>`;
  }
  return svg(
    `<g class="bb-dial">` + ink(4, `<circle cx="88" cy="110" r="68" fill="${GOLD}"/>`) + notches +
    ink(4, `<circle cx="88" cy="110" r="30" fill="#fff"/><path d="M88 50 L77 72 H99 Z" fill="${CORAL}"/>`) +
    shine(62, 74, 16, 7) + hit(18, 40, 140, 140) + `</g>` +
    `<g class="bb-cat">` + kitty(196, 86, 34, '#fff', true) + hit(158, 40, 80, 90) + `</g>`);
}

/** 3. A zip on a fabric patch; open it to find the hidden cat. */
export function zipSvg() {
  const stitches = `<rect x="30" y="46" width="180" height="118" rx="18" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 7" opacity=".7"/>`;
  return svg(
    `<defs><clipPath id="bb-zipclip"><path class="bb-zip-clip" d="M40 105 Z"/></clipPath></defs>` +
    ink(4, `<rect x="16" y="32" width="208" height="146" rx="28" fill="${LILAC}"/>`) + stitches + shine(46, 48, 16, 5, 0) +
    `<path class="bb-zip-hole" d="M40 105 Z" fill="${HOLE}" stroke="${INK}" stroke-width="3.5"/>` +
    `<g clip-path="url(#bb-zipclip)"><g class="bb-zip-cat">` + kitty(120, 112, 40, '#fff') + `</g></g>` +
    `<line class="bb-zip-teeth" x1="40" y1="105" x2="202" y2="105" stroke="${INK}" stroke-width="9" stroke-dasharray="4 4"/>` +
    `<g class="bb-zip-tab" transform="translate(40 105)">` +
    ink(3.5, `<rect x="-13" y="-9" width="26" height="20" rx="7" fill="${GOLD}"/><rect x="-11" y="10" width="22" height="34" rx="11" fill="${GOLD}"/>`) +
    `<circle cx="0" cy="30" r="4.5" fill="${INK}"/>` + shine(-4, 18, 3, 6, 0) + `</g>` +
    hit(10, 56, 222, 120));
}

/** 4. A spring with a ball on top. */
export function springSvg() {
  return svg(
    ink(4, `<rect x="58" y="172" width="124" height="20" rx="10" fill="${WOOD}"/>`) +
    `<g class="bb-spring">` + tube('M120 172 L94 160 L146 146 L94 132 L146 118 L94 104 L120 96', 8, BLUE) + `</g>` +
    `<g class="bb-ball">` + ink(4, `<circle cx="120" cy="60" r="36" fill="${RED}"/>`) +
    ink(3, `<path d="M98 64 Q120 80 142 64" fill="none"/>`) + shine(106, 44, 11, 6) + `</g>` +
    hit(0, 0, 240, 200));
}

/** Where the eight bubbles sit (two rows of four). */
export const BUBBLES = Array.from({ length: 8 }, (_, i) => [54 + (i % 4) * 44, i < 4 ? 82 : 130]);

/** 5. A strip of bubble wrap. */
export function bubblesSvg() {
  let s = ink(4, `<rect x="16" y="36" width="208" height="140" rx="26" fill="#D9F5FA"/>`) + shine(44, 50, 16, 5, 0);
  BUBBLES.forEach(([x, y], i) => {
    s += `<g class="bb-bubble" data-i="${i}">` +
      `<path class="bb-bub-flat" d="M${x - 15} ${y + 3} Q${x - 8} ${y - 4} ${x} ${y + 3} T${x + 15} ${y + 3}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".55"/>` +
      `<g class="bb-bub-full">` + ink(3, `<circle cx="${x}" cy="${y}" r="19" fill="#fff" fill-opacity=".92"/>`) + shine(x - 6, y - 7, 6, 3.5) + `</g></g>`;
  });
  return svg(s + hit(10, 30, 220, 152));
}

/** 6. A doorbell and a little door with a cat behind it. */
export function doorSvg() {
  const arch = 'M122 186 V76 a46 46 0 0 1 92 0 V186 Z';
  return svg(
    `<defs><clipPath id="bb-doorclip"><path d="${arch}"/></clipPath></defs>` +
    `<g class="bb-bell">` + ink(4, `<circle cx="58" cy="116" r="38" fill="${GOLD}"/><circle cx="58" cy="116" r="22" fill="${CORAL}"/>`) +
    shine(48, 104, 8, 4) + `</g>` +
    `<path d="${arch}" fill="${HOLE}"/>` +
    `<g clip-path="url(#bb-doorclip)"><g class="bb-peek">` + kitty(168, 130, 34, '#fff') + `</g></g>` +
    `<g class="bb-door">` + ink(4, `<path d="${arch}" fill="${LAGOON}"/><circle cx="168" cy="80" r="14" fill="#BFF1F7"/><circle cx="200" cy="134" r="6.5" fill="${GOLD}"/>`) +
    shine(140, 94, 5, 16, 0) + `</g>` +
    `<path d="${arch}" fill="none" stroke="${INK}" stroke-width="4"/>` +
    hit(0, 40, 240, 160));
}

/** 7. A rainbow slider. */
export function sliderSvg() {
  const stops = [RED, CORAL, GOLD, MINT, LAGOON, BLUE, LILAC]
    .map((c, i, a) => `<stop offset="${i / (a.length - 1)}" stop-color="${c}"/>`).join('');
  const note = (x, y) => ink(3, `<path d="M${x} ${y} V${y - 26} L${x + 14} ${y - 30} V${y - 6}" fill="none"/>`) +
    `<ellipse cx="${x - 5}" cy="${y}" rx="7" ry="5.5" fill="${INK}"/><ellipse cx="${x + 9}" cy="${y - 6}" rx="7" ry="5.5" fill="${INK}"/>`;
  return svg(
    `<defs><linearGradient id="bb-rainbow">${stops}</linearGradient></defs>` +
    `<g opacity=".35">${note(52, 58)}${note(170, 48)}</g>` +
    ink(4, `<rect x="20" y="96" width="200" height="30" rx="15" fill="url(#bb-rainbow)"/>`) + shine(44, 104, 14, 3, 0) +
    `<g class="bb-knob2" transform="translate(40 0)">` +
    ink(4, `<circle cx="0" cy="111" r="30" fill="#fff"/>`) + `<circle cx="0" cy="111" r="12" fill="${LAGOON}"/>` + shine(-9, 99, 7, 4) + `</g>` +
    hit(0, 50, 240, 130));
}

/** 8. A rainbow spinner. */
export function spinnerSvg() {
  const colours = [RED, GOLD, MINT, LAGOON, LILAC, PINK];
  const cx = 120, cy = 104, r = 76;
  let wedges = '';
  colours.forEach((c, i) => {
    const a0 = (i / 6) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
    wedges += `<path d="M${cx} ${cy} L${(cx + Math.cos(a0) * r).toFixed(1)} ${(cy + Math.sin(a0) * r).toFixed(1)} A${r} ${r} 0 0 1 ${(cx + Math.cos(a1) * r).toFixed(1)} ${(cy + Math.sin(a1) * r).toFixed(1)} Z" fill="${c}"/>`;
  });
  return svg(
    `<g class="bb-wheel">` + ink(4, wedges + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"/><circle cx="${cx}" cy="${cy}" r="13" fill="#fff"/>`) +
    shine(96, 60, 16, 6) + `</g>` + hit(20, 0, 200, 200));
}

/** 9. A padlock. The key is a separate piece (keySvg) so it can be dragged. */
export function lockSvg() {
  return svg(
    `<g class="bb-shackle">` + tube('M68 106 V76 a28 28 0 0 1 56 0 V106', 13, STEEL) + `</g>` +
    `<g class="bb-lock">` + ink(4, `<rect x="46" y="98" width="100" height="84" rx="20" fill="${GOLD}"/>`) +
    `<circle cx="96" cy="130" r="10" fill="${INK}"/><path d="M91 134 L86 158 H106 L101 134 Z" fill="${INK}"/>` +
    shine(64, 112, 10, 5) + hit(40, 40, 112, 150, 'bb-hit bb-lock-target') + `</g>`);
}

export const keySvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 70">` +
  tube('M50 35 H112 M98 35 V52 M112 35 V48', 10, LAGOON) +
  ink(4, `<circle cx="30" cy="35" r="24" fill="${LAGOON}"/><circle cx="30" cy="35" r="9" fill="#F7D9A6"/>`) + shine(22, 22, 7, 4) + `</svg>`;

export const screwSvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">` +
  ink(3, `<circle cx="15" cy="15" r="11" fill="#E8E2F0"/><path d="M9 9 L21 21 M21 9 L9 21" fill="none"/>`) + `</svg>`;
