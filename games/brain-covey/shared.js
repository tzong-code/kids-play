// Shared helpers for Covey's toddler toys (GAME-05): sparkles, drag-to-a-target with a generous
// snap and a soft bounce back, and celebrate-then-reset. Nothing here can end in a "wrong" state.

export { say } from '../../js/voice.js';
export { sparkles, sparklesAt, confetti } from '../../js/fx.js';
import { confetti } from '../../js/fx.js';

const centre = r => [r.left + r.width / 2, r.top + r.height / 2];

/**
 * Make `node` draggable onto one of `targets` (elements). Dropping within `tolerance` px of a
 * target's edge calls onDrop(target); if that returns true the node glides onto the target,
 * otherwise (or when nothing is near) it bounces home with onMiss(). A tap without a drag calls onTap.
 * `node` is moved with CSS translate, so it should sit in its home spot with no transform of its own.
 * Returns { home() } to send it back at any time.
 */
export function dragToTarget(node, { targets, tolerance = 60, onPick, onDrop, onMiss, onTap }) {
  let start = null, dx = 0, dy = 0;
  node.style.touchAction = 'none';
  const place = (x, y, ms = 0) => {
    node.style.transition = ms ? `transform ${ms}ms var(--spring)` : 'none';
    node.style.transform = x || y ? `translate(${x}px, ${y}px)` : '';
  };
  node.addEventListener('pointerdown', e => {
    if (start) return;
    e.preventDefault();
    try { node.setPointerCapture(e.pointerId); } catch {}
    start = { x: e.clientX - dx, y: e.clientY - dy, id: e.pointerId, moved: false, at: [e.clientX, e.clientY] };
    node.classList.add('dragging');
    onPick?.();
  });
  node.addEventListener('pointermove', e => {
    if (!start || e.pointerId !== start.id) return;
    if (Math.hypot(e.clientX - start.at[0], e.clientY - start.at[1]) > 8) start.moved = true;
    dx = e.clientX - start.x;
    dy = e.clientY - start.y;
    place(dx, dy);
  });
  const up = e => {
    if (!start || e.pointerId !== start.id) return;
    const moved = start.moved;
    start = null;
    node.classList.remove('dragging');
    if (!moved) { home(); onTap?.(); return; }
    const [nx, ny] = centre(node.getBoundingClientRect());
    let best = null, bestGap = Infinity;
    for (const t of targets()) {
      const r = t.getBoundingClientRect();
      const gx = Math.max(r.left - nx, 0, nx - r.right), gy = Math.max(r.top - ny, 0, ny - r.bottom);
      const gap = Math.hypot(gx, gy);
      if (gap <= tolerance && gap < bestGap) { best = t; bestGap = gap; }
    }
    if (best && onDrop(best)) {
      const [tx, ty] = centre(best.getBoundingClientRect());
      dx += tx - nx;
      dy += ty - ny;
      place(dx, dy, 260);
    } else {
      home();
      onMiss?.();
    }
  };
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', up);
  function home() { dx = dy = 0; place(0, 0, 420); }
  return { home };
}

/** Big reward, then quietly put the toy back to its start after `ms`. */
export function celebrateThenReset({ layer, sound, ms = 2000, reset }) {
  sound.tada();
  confetti(layer);
  return setTimeout(reset, ms);
}
