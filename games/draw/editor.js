// The drawing screen shared by free draw, colouring pages and re-opened gallery drawings.
// Toolbars are built from the profile, so Covey and Carrie get different tools on one engine.

import { Surface } from '../../js/canvas.js';
import { stampsFor } from '../../js/profiles.js';
import { el, play, shareFile } from '../../js/ui.js';
import { PAGES } from '../../assets/pages/pages.js';

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
  const tools = el('div.bar.tools');
  const palette = el('div.bar.palette');
  const tray = el('div.stamp-tray');
  const editor = el(`div.editor.age-${profile.age}`, {}, tools, stage, palette, tray);
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
  const state = { brush: profile.brushes[0], color: profile.palette[0].hex, mode: page ? 'fill' : 'brush', glyph: null };
  const toolButtons = new Map();

  function apply() {
    if (state.mode === 'brush') surface.setTool({ type: 'brush', brush: state.brush.id, width: state.brush.width, color: state.color });
    else if (state.mode === 'eraser') surface.setTool({ type: 'brush', brush: 'eraser', width: profile.eraser.width });
    else if (state.mode === 'fill') surface.setTool({ type: 'fill', color: state.color });
    else if (state.mode === 'stamp') surface.setTool({ type: 'stamp', glyph: state.glyph, size: surface.tool.size || profile.stampSize });
    for (const [key, b] of toolButtons) {
      const on = key === state.mode || (state.mode === 'brush' && key === 'brush:' + state.brush.id);
      b.classList.toggle('selected', on);
    }
    palette.querySelectorAll('.swatch').forEach(s => s.classList.toggle('selected', s.dataset.hex === state.color));
    palette.classList.toggle('dim', state.mode === 'eraser' || state.mode === 'stamp' || (state.mode === 'brush' && state.brush.id === 'rainbow'));
  }

  const toolBtn = (key, icon, label, onclick, extra = '') => {
    const b = el('button.tool' + extra, {
      'aria-label': label,
      onclick: () => { sound.tap(); play(b); if (!profile.showText) speak(label); onclick(); },
    }, el('span.tool-icon', {}, icon), profile.showText ? el('span.tool-label', {}, label) : null);
    if (key) toolButtons.set(key, b);
    return b;
  };

  const homeBtn = toolBtn(null, '🏠', 'Home', () => app.home());
  tools.append(app.exitButton('.corner'), homeBtn, el('span.bar-gap'));

  for (const brush of profile.brushes) {
    tools.append(toolBtn('brush:' + brush.id, brush.icon, brush.label, () => { state.mode = 'brush'; state.brush = brush; apply(); }));
  }
  if (profile.eraser) tools.append(toolBtn('eraser', profile.eraser.icon, profile.eraser.label, () => { state.mode = 'eraser'; apply(); }));
  if (profile.fillBucket || page) tools.append(toolBtn('fill', '🪣', 'Fill', () => { state.mode = 'fill'; apply(); }));
  tools.append(toolBtn('stamp', '⭐', 'Stamps', () => toggleTray()));

  let undoBtn, redoBtn;
  if (profile.undo) {
    undoBtn = toolBtn(null, '↩️', 'Undo', () => surface.undo());
    redoBtn = toolBtn(null, '↪️', 'Redo', () => surface.redo());
    tools.append(el('span.bar-gap'), undoBtn, redoBtn);
  }
  tools.append(el('span.bar-gap'), toolBtn(null, '🧹', 'Clear', clearAll, '.clear'));
  if (profile.sendToPhotos) tools.append(toolBtn(null, '📸', 'Photos', sendToPhotos, '.photos'));

  function refreshUndo() {
    if (!undoBtn) return;
    undoBtn.disabled = !surface.canUndo;
    redoBtn.disabled = !surface.canRedo;
  }
  refreshUndo();

  // ---------- palette ----------
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
    palette.append(s);
  }

  // ---------- stamps tray ----------
  for (const glyph of stampsFor(profile)) {
    const b = el('button.stamp-choice', {
      onclick: () => {
        sound.pop();
        state.mode = 'stamp';
        state.glyph = glyph;
        apply();
        toolButtons.get('stamp').querySelector('.tool-icon').textContent = glyph;
        toggleTray(false);
      },
    }, glyph);
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
    }, 450);
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
