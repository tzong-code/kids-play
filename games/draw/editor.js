// The drawing screen shared by free draw, colouring pages and re-opened gallery drawings.
// Toolbars are built from the profile, so Covey and Carrie get different tools on one engine.
// Layout: tools on a toy shelf, the paper on its board, colours on a paint tray.

import { Surface } from '../../js/canvas.js';
import { stampsFor } from '../../js/profiles.js';
import { icon, stickerUrl } from '../../js/art.js';
import { el, play, shareFile } from '../../js/ui.js';
import { PAGES } from '../../assets/pages/pages.js';
import { STICKERS } from '../../assets/art/stickers.js';

const SAVE_DELAY = 1200;

/**
 * @param params { pageId?, drawingId? }
 * @returns async cleanup that flushes the autosave
 */
export async function mountEditor(container, profile, app, params = {}) {
  const { sound, speak, storage } = app;
  let record = params.drawingId ? await storage.getDrawing(params.drawingId) : null;
  const pageId = record ? record.pageId : params.pageId || null;
  const page = pageId ? PAGES.find(p => p.id === pageId) : null;

  // ---------- layout ----------
  const stage = el('div.stage');
  const shelf = el('div.bar-scroll');
  const paints = el('div.bar-scroll');
  const tools = el('div.bar.tools', {}, shelf);
  const palette = el('div.bar.palette', {}, paints);
  const tray = el('div.stamp-tray');
  const editor = el(`div.editor.age-${profile.age}`, {}, tools, el('div.board', {}, stage), palette, tray);
  container.append(editor);   // in the DOM now, so the stage has its size for setPage()

  let lastBubble = 0;
  let dirty = false;
  const surface = new Surface(stage, {
    pressure: profile.pressure,
    multiTouch: profile.pinchStamps,
    fillMode: profile.fillMode,
    onCommit: () => { dirty = true; refreshUndo(); scheduleSave(); },
    onStroke: (kind, info) => {
      if (kind === 'start') {
        if (profile.age <= 2) sound.bubble();
        else if (info.brush === 'glitter') sound.sparkle();
      } else if (kind === 'move' && profile.age <= 2 && info.dist - lastBubble > 220) {
        lastBubble = info.dist;
        sound.bubble();
      } else if (kind === 'end') lastBubble = 0;
      else if (kind === 'fill') sound.chirp();
      else if (kind === 'stamp') sound.stamp();
    },
  });
  if (page) await surface.setPage(page.svg, profile.pageStroke);
  if (record?.paint) await surface.load(record.paint);

  // ---------- autosave ----------
  let saveTimer = null;
  let saving = Promise.resolve();
  const created = record?.created || Date.now();
  let id = record?.id || storage.newId();

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, SAVE_DELAY);
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!dirty) return saving;
    dirty = false;
    const thisId = id;
    saving = saving.then(async () => {
      const [paint, image, thumb] = await Promise.all([surface.paintBlob(), surface.imageBlob(), surface.thumbBlob()]);
      await storage.saveDrawing({ id: thisId, profile: profile.id, created, updated: Date.now(), pageId, paint, image, thumb });
    }).catch(err => console.error('Autosave failed', err));
    return saving;
  }

  // ---------- tools ----------
  const state = { brush: profile.brushes[0], color: profile.palette[0].hex, mode: page ? 'fill' : 'brush', sticker: null };
  const toolButtons = new Map();
  const stickers = new Map(stampsFor(profile).map(sid => {
    const img = new Image();
    img.src = stickerUrl(sid);
    return [sid, img];
  }));

  function apply() {
    if (state.mode === 'brush') surface.setTool({ type: 'brush', brush: state.brush.id, width: state.brush.width, color: state.color });
    else if (state.mode === 'eraser') surface.setTool({ type: 'brush', brush: 'eraser', width: profile.eraser.width });
    else if (state.mode === 'fill') surface.setTool({ type: 'fill', color: state.color });
    else if (state.mode === 'stamp') surface.setTool({ type: 'stamp', image: stickers.get(state.sticker), size: surface.tool.size || profile.stampSize });
    for (const [key, b] of toolButtons) {
      const on = key === state.mode || (state.mode === 'brush' && key === 'brush:' + state.brush.id);
      b.classList.toggle('selected', on);
    }
    paints.querySelectorAll('.swatch').forEach(s => s.classList.toggle('selected', s.dataset.hex === state.color));
    palette.classList.toggle('dim', state.mode === 'eraser' || state.mode === 'stamp' || (state.mode === 'brush' && state.brush.id === 'rainbow'));
  }

  /** A toy button: `art` names the drawn icon and its colour; `key` makes it selectable. */
  const toolBtn = (key, art, label, onclick) => {
    const b = el(`button.tool.gloss${profile.showText ? '.has-label' : ''}`, {
      'aria-label': label,
      dataset: { tool: art },
      onclick: () => { sound.tap(); if (!profile.showText) speak(label); onclick(); },
    }, el('span.tool-icon', { innerHTML: icon(art) }), profile.showText ? el('span.tool-label', {}, label) : null);
    if (key) toolButtons.set(key, b);
    return b;
  };

  shelf.append(app.exitButton(), toolBtn(null, 'home', 'Home', () => app.home()));
  for (const brush of profile.brushes) {
    shelf.append(toolBtn('brush:' + brush.id, brush.icon, brush.label, () => { state.mode = 'brush'; state.brush = brush; apply(); }));
  }
  if (profile.eraser) shelf.append(toolBtn('eraser', 'eraser', profile.eraser.label, () => { state.mode = 'eraser'; apply(); }));
  if (profile.fillBucket || page) shelf.append(toolBtn('fill', 'fill', 'Fill', () => { state.mode = 'fill'; apply(); }));
  shelf.append(toolBtn('stamp', 'stamp', 'Stickers', () => toggleTray()));
  if (profile.sendToPhotos) shelf.append(toolBtn(null, 'photos', 'Photos', sendToPhotos));

  let undoBtn, redoBtn;
  if (profile.undo) {
    undoBtn = toolBtn(null, 'undo', 'Undo', () => surface.undo());
    redoBtn = toolBtn(null, 'redo', 'Redo', () => surface.redo());
    shelf.append(undoBtn, redoBtn);
  }
  shelf.append(toolBtn(null, 'clear', 'Clear', clearAll));

  function refreshUndo() {
    if (!undoBtn) return;
    undoBtn.disabled = !surface.canUndo;
    redoBtn.disabled = !surface.canRedo;
  }
  refreshUndo();

  // ---------- paint tray ----------
  for (const c of profile.palette) {
    const s = el('button.swatch', {
      'aria-label': c.name,
      dataset: { hex: c.hex },
      style: { '--c': c.hex },
      onclick: () => {
        sound.pop();
        play(s);
        if (!profile.showText) speak(c.name);
        state.color = c.hex;
        if (state.mode === 'eraser' || state.mode === 'stamp') state.mode = page ? 'fill' : 'brush';
        if (state.mode === 'brush' && state.brush.id === 'rainbow') state.brush = profile.brushes[0];
        apply();
      },
    });
    paints.append(s);
  }

  // ---------- sticker tray ----------
  for (const [sid, img] of stickers) {
    const b = el('button.stamp-choice', {
      'aria-label': STICKERS[sid].label,
      onclick: async () => {
        sound.pop();
        if (!profile.showText) speak(STICKERS[sid].label);
        await img.decode().catch(() => {});
        state.mode = 'stamp';
        state.sticker = sid;
        apply();
        const btn = toolButtons.get('stamp');
        btn.querySelector('.tool-icon').replaceChildren(el('img', { src: img.src, alt: '', draggable: false }));
        play(btn);
        toggleTray(false);
      },
    }, el('img', { src: img.src, alt: '', draggable: false }));
    tray.append(b);
  }
  function toggleTray(force) {
    const open = force ?? !tray.classList.contains('open');
    tray.classList.toggle('open', open);
  }
  stage.addEventListener('pointerdown', () => toggleTray(false));

  // ---------- clear and export ----------
  function clearAll() {
    play(surface.wrap, 'wobble');
    sound.whoosh();
    setTimeout(async () => {
      if (!profile.undo) {
        // No undo for the toddler: keep the old picture in her gallery and start a fresh one.
        await save();
        surface.clear();
        id = storage.newId();
        clearTimeout(saveTimer);
        dirty = false;
      } else {
        surface.clear();
      }
    }, 480);
  }

  function sendToPhotos() {
    // Built synchronously so the share sheet opens inside this tap.
    const file = surface.imageFileSync(`${profile.name}-${new Date().toISOString().slice(0, 10)}.png`);
    sound.tada();
    shareFile(file);
  }

  apply();

  return async () => {
    toggleTray(false);
    await save();
    surface.destroy();
  };
}
