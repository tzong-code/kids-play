// Celebration effects shared by the games: sparkles that float up and falling confetti.

import { el } from './ui.js';
import { sparkleSvg } from './art.js';

const SPARK = {};
const sparkSrc = color => (SPARK[color] ||= 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sparkleSvg(color)));

/** Five sparkles floating up from (x, y), in `layer`'s own pixel space. */
export function sparkles(layer, x, y, { n = 5, color = '#FFC93C', spread = 70 } = {}) {
  for (let i = 0; i < n; i++) {
    const p = el('img.st-spark', { src: sparkSrc(color), alt: '' });
    p.style.left = `${x + Math.round(Math.random() * spread - spread / 2)}px`;
    p.style.top = `${y + Math.round(Math.random() * spread * 0.6 - spread * 0.3)}px`;
    p.style.animationDelay = i * 40 + 'ms';
    layer.append(p);
    setTimeout(() => p.remove(), 900);
  }
}

/** Sparkles at the centre of `node`, measured against `layer`. */
export function sparklesAt(layer, node, opts) {
  const a = layer.getBoundingClientRect(), b = node.getBoundingClientRect();
  sparkles(layer, b.left - a.left + b.width / 2, b.top - a.top + b.height / 2, opts);
}

/** Falling confetti across `layer` for about two seconds. */
export function confetti(layer, n = 28) {
  const colours = ['#FF5FA8', '#FFC93C', '#4ADE9A', '#22B8CF', '#B78CFF', '#FF8A7A'];
  for (let i = 0; i < n; i++) {
    const c = el('span.fx-confetti');
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colours[i % colours.length];
    c.style.animationDelay = Math.random() * 0.5 + 's';
    c.style.animationDuration = 1.4 + Math.random() * 0.8 + 's';
    layer.append(c);
    setTimeout(() => c.remove(), 3000);
  }
}
