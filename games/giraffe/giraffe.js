// Gigi the giraffe (our own character) and her savanna, as inline SVG in the chunky-toy style.
// Parts are named groups so they can animate on their own; pivots live in giraffe CSS
// (transform-box: view-box, so transform-origin uses these viewBox coordinates).

export const GIRAFFE_NAME = 'Gigi';

const INK = '#2B2340';
const YELLOW = '#F7C948', YELLOW_FAR = '#E9B93A', SPOT = '#E0A83A', BROWN = '#8A5A2B', CHEEK = '#FFD9E8', MUZZLE = '#FFE6A3';

const leg = (id, x, fill) =>
  `<g id="${id}" class="gg-leg">` +
  `<rect x="${x}" y="322" width="24" height="76" rx="11" fill="${fill}"/>` +
  `<rect x="${x - 2}" y="388" width="28" height="18" rx="8" fill="${BROWN}"/></g>`;

const eye = (x, y, rx, ry) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${INK}" stroke="none"/>` +
  `<circle cx="${x + 3}" cy="${y - 4}" r="3.2" fill="#fff" stroke="none"/><circle cx="${x - 2.5}" cy="${y + 3}" r="1.4" fill="#fff" stroke="none"/>`;

const lid = (x, y, rx, ry) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx + 1.5}" ry="${ry + 1.5}" fill="${YELLOW}" stroke="none"/>` +
  `<path d="M${x - rx} ${y} Q${x} ${y + ry * 0.8} ${x + rx} ${y}" fill="none" stroke-width="3"/>`;

/** Gigi standing, facing right (viewBox 0 0 360 420). */
export function gigiSvg() {
  return `<svg class="gg-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420" overflow="visible">
  <g id="gigi" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    ${leg('legBL', 98, YELLOW_FAR)}${leg('legFL', 198, YELLOW_FAR)}
    <g id="torso">
    <g id="tail">
      <path d="M80 290 C62 302 56 324 60 342" fill="none"/>
      <path d="M52 340 C54 330 66 330 68 340 C70 352 62 362 58 362 C52 360 50 350 52 340 Z" fill="${BROWN}"/>
    </g>
    <g id="body">
      <ellipse cx="166" cy="300" rx="94" ry="60" fill="${YELLOW}"/>
      <g fill="${SPOT}" stroke="none">
        <ellipse cx="128" cy="282" rx="15" ry="11" transform="rotate(-14 128 282)"/>
        <ellipse cx="172" cy="268" rx="12" ry="9"/>
        <ellipse cx="206" cy="300" rx="14" ry="10" transform="rotate(10 206 300)"/>
        <ellipse cx="104" cy="318" rx="9" ry="7"/>
        <ellipse cx="146" cy="318" rx="10" ry="7"/>
      </g>
      <ellipse id="tummy" cx="178" cy="336" rx="48" ry="16" fill="#FFE08A" stroke="none"/>
      <ellipse cx="128" cy="266" rx="26" ry="9" fill="#fff" opacity=".35" stroke="none" transform="rotate(-12 128 266)"/>
    </g>
    <g id="neck">
      <path d="M238 116 C228 170 216 232 210 292" fill="none" stroke="${BROWN}" stroke-width="12" stroke-dasharray="1 15"/>
      <path d="M206 304 C208 232 222 172 236 116 L274 122 C266 176 258 236 258 304 Z" fill="${YELLOW}" stroke="none"/>
      <path d="M207 296 C209 232 222 172 236 116 L274 122 C266 176 258 236 258 290" fill="none"/>
      <g fill="${SPOT}" stroke="none">
        <ellipse cx="240" cy="168" rx="9" ry="7"/><ellipse cx="236" cy="222" rx="10" ry="8"/><ellipse cx="248" cy="266" rx="9" ry="7"/>
      </g>
      <ellipse id="throat" cx="262" cy="160" rx="6" ry="11" fill="#FFE08A" stroke="none"/>
      <g id="head">
        <g id="ears">
          <path id="earBack" d="M232 70 C222 50 206 48 206 60 C206 72 222 78 234 78 Z" fill="${YELLOW_FAR}"/>
          <path id="earFront" d="M226 86 C206 78 192 86 196 96 C200 106 218 104 230 96 Z" fill="${YELLOW}"/>
          <path d="M222 88 C210 86 204 90 205 95 C208 99 218 98 224 94 Z" fill="${CHEEK}" stroke="none"/>
        </g>
        <path d="M250 62 L246 38 M272 60 L274 36" fill="none" stroke="${BROWN}" stroke-width="8"/>
        <circle cx="245" cy="34" r="7.5" fill="${BROWN}"/><circle cx="275" cy="32" r="7.5" fill="${BROWN}"/>
        <ellipse cx="262" cy="88" rx="44" ry="36" fill="${YELLOW}"/>
        <ellipse cx="250" cy="66" rx="9" ry="6" fill="${SPOT}" stroke="none"/>
        <ellipse cx="244" cy="66" rx="12" ry="5" fill="#fff" opacity=".4" stroke="none"/>
        <g id="nose">
          <ellipse cx="296" cy="104" rx="29" ry="22" fill="${MUZZLE}"/>
          <ellipse cx="304" cy="97" rx="2.6" ry="3.6" fill="${INK}" stroke="none"/><ellipse cx="316" cy="100" rx="2.4" ry="3.4" fill="${INK}" stroke="none"/>
        </g>
        <g id="eyes">${eye(250, 88, 8.5, 10)}${eye(276, 84, 8, 9.5)}</g>
        <g id="eyelids">${lid(250, 88, 8.5, 10)}${lid(276, 84, 8, 9.5)}</g>
        <ellipse cx="236" cy="106" rx="9" ry="5.5" fill="${CHEEK}" stroke="none"/>
        <g id="mouth"><path d="M286 116 Q295 124 305 114" fill="none" stroke-width="3.2"/></g>
        <g id="mouthOpen"><ellipse cx="295" cy="117" rx="7" ry="6.5" fill="#C8406F" stroke-width="3"/></g>
      </g>
    </g>
    </g>
    ${leg('legBR', 128, YELLOW)}${leg('legFR', 228, YELLOW)}
  </g>
</svg>`;
}

/** The savanna: soft sky, one sun, two round trees, a yellow-green ground band (viewBox 0 0 1000 600, slice). */
export function savannaSvg() {
  const tree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-10 0 C-8 -40 -6 -70 0 -100 C6 -70 8 -40 10 0 Z" fill="#9A6A3A"/>
      <circle cx="-34" cy="-110" r="40" fill="#5FC46A"/><circle cx="30" cy="-116" r="44" fill="#5FC46A"/><circle cx="0" cy="-148" r="46" fill="#6ED178"/>
      <ellipse cx="-14" cy="-166" rx="20" ry="9" fill="#fff" opacity=".35" stroke="none"/>
    </g>`;
  let rays = '';
  for (let i = 0; i < 8; i++) rays += `<path d="M0 -62 L9 -46 L-9 -46 Z" fill="#FFC93C" transform="rotate(${i * 45})"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="gg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE6FF"/><stop offset="1" stop-color="#EAF7FF"/></linearGradient></defs>
  <rect width="1000" height="600" fill="url(#gg-sky)"/>
  <g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <g transform="translate(820 120)">${rays}<circle r="40" fill="#FFE08A"/>
      <circle cx="-13" cy="-4" r="4" fill="${INK}" stroke="none"/><circle cx="13" cy="-4" r="4" fill="${INK}" stroke="none"/>
      <path d="M-11 10 Q0 19 11 10" fill="none" stroke-width="4"/>
      <ellipse cx="-22" cy="8" rx="6" ry="3.5" fill="${CHEEK}" stroke="none"/><ellipse cx="22" cy="8" rx="6" ry="3.5" fill="${CHEEK}" stroke="none"/></g>
    <g fill="#fff"><path d="M150 140 a26 26 0 0 1 8 -48 a36 36 0 0 1 66 -12 a28 28 0 0 1 42 30 a20 20 0 0 1 -8 30 Z"/>
      <path d="M520 96 a18 18 0 0 1 6 -34 a26 26 0 0 1 48 -8 a20 20 0 0 1 30 22 a14 14 0 0 1 -6 20 Z"/></g>
    <path d="M-10 420 C200 392 420 410 600 400 C780 390 900 404 1010 396 V610 H-10 Z" fill="#C8E07A"/>
    <path d="M-10 470 C240 450 520 476 760 458 C860 452 940 460 1010 456 V610 H-10 Z" fill="#B5D468" stroke="none"/>
    ${tree(180, 420, 1)}${tree(850, 412, 0.85)}
    <g fill="none" stroke="#7FA53E" stroke-width="4">
      <path d="M90 520 l6 -16 l6 16 M110 522 l5 -12 M400 540 l6 -16 l6 16 M690 516 l6 -14 l6 14 M920 540 l6 -16 l6 16"/></g>
  </g>
</svg>`;
}

// ---------- action button pictures (viewBox 0 0 100 100) ----------

const ink = body => `<g stroke="${INK}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const gloss = (cx, cy, rx, ry, rot = -20) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".5" stroke="none" transform="rotate(${rot} ${cx} ${cy})"/>`;
const face = (x, y, gap = 12) =>
  `<circle cx="${x - gap / 2}" cy="${y}" r="3.2" fill="${INK}" stroke="none"/><circle cx="${x + gap / 2}" cy="${y}" r="3.2" fill="${INK}" stroke="none"/>` +
  `<circle cx="${x - gap / 2 + 1}" cy="${y - 1.2}" r="1.1" fill="#fff" stroke="none"/><circle cx="${x + gap / 2 + 1}" cy="${y - 1.2}" r="1.1" fill="#fff" stroke="none"/>` +
  `<path d="M${x - 4} ${y + 6} Q${x} ${y + 10} ${x + 4} ${y + 6}" fill="none" stroke-width="3"/>` +
  `<ellipse cx="${x - gap / 2 - 5}" cy="${y + 6}" rx="4" ry="2.4" fill="#FF8FB8" opacity=".75" stroke="none"/><ellipse cx="${x + gap / 2 + 5}" cy="${y + 6}" rx="4" ry="2.4" fill="#FF8FB8" opacity=".75" stroke="none"/>`;
const svg100 = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;

export const ACTION_ART = {
  drink: () => svg100(ink(
    `<path d="M50 10 C50 10 22 44 22 64 C22 80 35 90 50 90 C65 90 78 80 78 64 C78 44 50 10 50 10 Z" fill="#4D96FF"/>`) +
    `<path d="M50 10 C62 26 78 46 78 64 C78 80 65 90 50 90 C62 84 68 74 68 62 C68 46 58 28 50 10 Z" fill="#2B6BCC" opacity=".35"/>` +
    gloss(36, 52, 6, 11, 20) + face(50, 64)),
  walk: () => svg100(ink(
    `<path d="M50 92 C18 86 10 50 28 26 C36 16 48 10 50 8 C52 10 64 16 72 26 C90 50 82 86 50 92 Z" fill="#4ADE9A"/>` +
    `<path d="M50 88 V30" fill="none" stroke="#22A86C" stroke-width="4"/>` +
    `<path d="M30 46 C30 38 36 34 40 36 C44 38 44 46 42 52 C40 56 32 56 30 46 Z" fill="${BROWN}" stroke-width="3.5"/>` +
    `<path d="M70 46 C70 38 64 34 60 36 C56 38 56 46 58 52 C60 56 68 56 70 46 Z" fill="${BROWN}" stroke-width="3.5"/>` +
    `<path d="M36 72 C36 64 42 60 46 62 C50 64 50 72 48 78 C46 82 38 82 36 72 Z" fill="${BROWN}" stroke-width="3.5"/>` +
    `<path d="M64 72 C64 64 58 60 54 62 C50 64 50 72 52 78 C54 82 62 82 64 72 Z" fill="${BROWN}" stroke-width="3.5"/>`) +
    gloss(30, 30, 8, 4, -40)),
  doctor: () => svg100(ink(
    `<path d="M26 14 V40 C26 54 36 62 48 62 C60 62 70 54 70 40 V14" fill="none" stroke-width="6"/>` +
    `<circle cx="26" cy="12" r="5" fill="#B78CFF"/><circle cx="70" cy="12" r="5" fill="#B78CFF"/>` +
    `<path d="M48 62 V72 C48 82 56 88 66 86" fill="none" stroke-width="6"/>` +
    `<circle cx="74" cy="84" r="11" fill="#D9D2E6"/><circle cx="74" cy="84" r="5" fill="#fff"/>`) +
    ink(`<path d="M30 74 C20 66 12 60 14 50 C16 44 24 42 30 48 C36 42 44 44 46 50 C48 60 40 66 30 74 Z" fill="#FF6B6B" stroke-width="4"/>`) +
    gloss(22, 52, 4, 2.4)),
};
