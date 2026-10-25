// Shared sticker-scene engine (GAME-01 Sticker Scenes, GAME-02 Kitty Dollhouse rooms).
// A drawn scene on a board, a tray of sticker toys along the bottom and a bin.
// Drag a sticker up out of the tray (or tap it to drop one in), drag stickers around,
// tap one to make it wiggle, sparkle and sing, drag it onto the bin to take it away.

import { el, play } from './ui.js';
import { icon, stickerUrl, sparkleSvg, STICKERS } from './art.js';

const TAP_SLOP = 6;          // px: less movement than this is a tap
const LIFT_SLOP = 10;        // px: how far a finger moves on a tray chip before we decide drag vs scroll
const SAVE_DELAY = 400;

/**
 * @param opts {
 *   key        storage key for this scene's stickers
 *   title      pill text (shown only to readers)
 *   backdrop   SVG string (viewBox 0 0 1000 600, slice)
 *   items      sticker ids for the tray
 *   sound      'chime' | 'bubble' | 'bounce' | 'piano'
 *   sparks     sticker ids (or 'sparkle') for the tap burst
 *   back       optional { art, label, onClick } replacing the Home button
 *   onOpen     optional sound on open
 * }
 * @returns async cleanup that saves the scene
 */
export async function mountStickerScene(container, profile, app, opts) {
  const { sound, speak, storage } = app;
  const big = profile.age <= 2;

  const layer = el('div.st-layer');
  const stage = el('div.st-stage', { innerHTML: opts.backdrop }, layer);
  const chips = el('div.st-chips');
  const bin = el('button.tool.gloss.st-bin', { 'aria-label': 'Bin', dataset: { tool: 'delete' } }, el('span.tool-icon', { innerHTML: icon('trash') }));
  const backBtn = opts.back
    ? el('button.tool.gloss', { 'aria-label': opts.back.label, dataset: { tool: opts.back.art }, onclick: () => { sound.door(); opts.back.onClick(); } },
      el('span.tool-icon', { innerHTML: icon(opts.back.art) }))
    : app.homeButton();
  const screen = el(`div.st-game.age-${profile.age}`, {},
    el('div.st-top', {}, app.exitButton(), backBtn,
      profile.showText && opts.title ? el('div.st-title', {}, opts.title) : el('span')),
    el('div.st-board', {}, stage),
    el('div.st-tray', {}, el('div.st-scroll', {}, chips), bin));
  container.append(screen);

  // ---------- stickers ----------
  const urls = new Map();
  const urlFor = id => urls.get(id) || (urls.set(id, stickerUrl(id)), urls.get(id));

  for (const id of opts.items) {
    chips.append(el('button.st-chip', { 'aria-label': STICKERS[id]?.label || id, dataset: { id } },
      el('img', { src: urlFor(id), alt: '', draggable: false })));
  }

  let z = 1;
  function place(id, fx, fy) {
    const img = el('img.st', { src: urlFor(id), alt: '', draggable: false, dataset: { id } });
    img.style.left = fx * 100 + '%';
    img.style.top = fy * 100 + '%';
    img.style.zIndex = z++;
    layer.append(img);
    return img;
  }

  const frac = e => {
    const r = stage.getBoundingClientRect();
    return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height };
  };
  const clamp01 = v => Math.max(0.02, Math.min(0.98, v));

  // ---------- saving ----------
  const storeKey = `stickers:${opts.key}`;
  let saveTimer = null;
  function snapshot() {
    return [...layer.querySelectorAll('.st')].map(s => ({
      id: s.dataset.id, x: parseFloat(s.style.left) / 100, y: parseFloat(s.style.top) / 100,
    }));
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, SAVE_DELAY);
  }
  function save() {
    clearTimeout(saveTimer);
    return storage.setSetting(storeKey, snapshot()).catch(err => console.error('Scene save failed', err));
  }
  const saved = await storage.getSetting(storeKey).catch(() => null);
  for (const s of saved || []) if (STICKERS[s.id]) place(s.id, s.x, s.y);

  // ---------- feedback ----------
  function burst(fx, fy) {
    const sparks = opts.sparks?.length ? opts.sparks : ['sparkle'];
    for (let i = 0; i < 5; i++) {
      const id = sparks[i % sparks.length];
      const src = id === 'sparkle'
        ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sparkleSvg('#FFC93C'))
        : urlFor(id);
      const p = el('img.st-spark', { src, alt: '' });
      p.style.left = `calc(${fx * 100}% + ${Math.round(Math.random() * 80 - 40)}px)`;
      p.style.top = `calc(${fy * 100}% + ${Math.round(Math.random() * 40 - 20)}px)`;
      p.style.animationDelay = i * 40 + 'ms';
      layer.append(p);
      setTimeout(() => p.remove(), 900);
    }
  }
  function cheer(s) {
    play(s, 'st-wiggle');
    sound[opts.sound]?.();
    burst(parseFloat(s.style.left) / 100, parseFloat(s.style.top) / 100);
    if (big) speak(STICKERS[s.dataset.id]?.label);
  }
  const overBin = e => {
    const r = bin.getBoundingClientRect();
    return e.clientX > r.left - 24 && e.clientX < r.right + 24 && e.clientY > r.top - 24 && e.clientY < r.bottom + 24;
  };

  // ---------- pointer handling ----------
  let drag = null;   // { el, id, fresh, moved, sx, sy, pid, chip? }

  function onDown(e) {
    if (drag) return;                        // one finger at a time
    const chip = e.target.closest('.st-chip');
    const st = e.target.closest('.st');
    if (chip) {
      // Wait to see whether the finger lifts the sticker out (up) or scrolls the tray (sideways).
      drag = { chip, id: chip.dataset.id, sx: e.clientX, sy: e.clientY, pid: e.pointerId, pending: true };
    } else if (st) {
      e.preventDefault();
      st.style.zIndex = z++;
      drag = { el: st, sx: e.clientX, sy: e.clientY, pid: e.pointerId, moved: false };
    }
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (drag.pending) {
      if (Math.abs(dy) > LIFT_SLOP && Math.abs(dy) > Math.abs(dx)) {
        // Lift a new sticker out of the tray and carry it.
        drag.pending = false;
        const { fx, fy } = frac(e);
        drag.el = place(drag.id, fx, fy);
        drag.el.classList.add('st-carried');
        drag.fresh = true;
        drag.moved = true;
        sound.pop();
      } else if (Math.abs(dx) > LIFT_SLOP) {
        drag = null;                          // sideways: let the tray scroll
      }
      return;
    }
    if (!drag.moved && Math.hypot(dx, dy) < TAP_SLOP) return;
    drag.moved = true;
    drag.el.classList.add('st-carried');
    const { fx, fy } = frac(e);
    drag.el.style.left = fx * 100 + '%';
    drag.el.style.top = fy * 100 + '%';
    bin.classList.toggle('hot', overBin(e));
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag;
    drag = null;
    if (d.pending) {
      // A plain tap on a chip drops the sticker somewhere in the middle of the scene.
      const s = place(d.id, 0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.4);
      s.classList.add('st-pop');
      sound.pop();
      if (big) speak(STICKERS[d.id]?.label);
      scheduleSave();
      return;
    }
    d.el.classList.remove('st-carried');
    if (bin.classList.contains('hot')) {
      bin.classList.remove('hot');
      d.el.classList.add('st-gone');
      setTimeout(() => d.el.remove(), 250);
      play(bin, 'wiggle');
      sound.whoosh();
    } else if (!d.moved) {
      cheer(d.el);
    } else {
      d.el.style.left = clamp01(parseFloat(d.el.style.left) / 100) * 100 + '%';
      d.el.style.top = clamp01(parseFloat(d.el.style.top) / 100) * 100 + '%';
      sound.pop();
    }
    scheduleSave();
  }

  function onCancel(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    if (drag.el) drag.el.classList.remove('st-carried');
    drag = null;
    bin.classList.remove('hot');
    scheduleSave();
  }

  screen.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
  opts.onOpen?.();

  return async () => {
    screen.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    await save();
  };
}
