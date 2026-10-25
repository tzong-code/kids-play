// Gallery: big tiles of her saved drawings, newest first.
// Covey can only look (a parent can hold a picture for two seconds to send it to Photos).
// Carrie can re-open, send to Photos, and delete with a two-tap confirm.

import { el, play, holdToActivate, armedButton, shareFile } from '../../js/ui.js';
import { icon, TILE_ART } from '../../js/art.js';

export default {
  id: 'gallery',
  name: 'My Art',
  icon: 'gallery',
  ages: [2, 3, 4, 5, 6, 7, 8],
  async mount(container, profile, app) {
    const { storage, sound } = app;
    const urls = [];
    const url = blob => { const u = URL.createObjectURL(blob); urls.push(u); return u; };
    const fileName = rec => `${profile.name}-${new Date(rec.updated).toISOString().slice(0, 10)}.png`;

    const grid = el('div.gallery-grid');
    const viewer = el('div.viewer');
    const screen = el('div.picker-screen.gallery', {},
      el('div.screen-top', {}, app.exitButton(), app.homeButton(),
        profile.showText ? el('h1', {}, 'My Art') : null),
      grid, viewer);
    container.append(screen);

    async function render() {
      urls.splice(0).forEach(u => URL.revokeObjectURL(u));
      const items = await storage.listDrawings(profile.id);
      grid.replaceChildren();
      if (!items.length) {
        grid.append(el('div.empty', {}, profile.showText ? el('p', {}, 'Your drawings will show up here!') : null,
          el('button.home-tile.small', { onclick: () => app.open('draw'), 'aria-label': 'Draw' }, el('span.tile-art', { innerHTML: TILE_ART.draw() }))));
        return;
      }
      for (const rec of items) {
        const tile = el('button.art-tile', { onclick: () => { sound.pop(); open(rec); } }, el('img', { src: url(rec.thumb), alt: '', draggable: false }));
        if (!profile.sendToPhotos) {
          // Parent shortcut for the toddler profile.
          holdToActivate(tile, async () => {
            const full = await storage.getDrawing(rec.id);
            shareFile(new File([full.image], fileName(rec), { type: 'image/png' }));
          });
        }
        grid.append(tile);
      }
    }

    async function open(rec) {
      const full = await storage.getDrawing(rec.id);
      if (!full) return;
      // Prepared now, so the share sheet can open straight from the tap.
      const file = new File([full.image], fileName(full), { type: 'image/png' });
      const img = el('img.viewer-img', { src: url(full.image), alt: '', draggable: false });
      const close = () => { viewer.classList.remove('open'); viewer.replaceChildren(); };
      const actions = el('div.viewer-actions');
      const labelled = profile.showText ? '.has-label' : '';
      const btn = (art, label, onclick) =>
        el(`button.tool.gloss${labelled}`, { onclick, 'aria-label': label, dataset: { tool: art } },
          el('span.tool-icon', { innerHTML: icon(art) }), profile.showText ? el('span.tool-label', {}, label) : null);

      actions.append(btn('close', 'Close', () => { sound.tap(); close(); }));
      if (profile.galleryReopen) actions.append(btn('keep', 'Draw', () => { sound.pop(); app.open('draw', { drawingId: full.id }); }));
      if (profile.sendToPhotos) actions.append(btn('photos', 'Photos', () => { sound.tada(); shareFile(file); }));
      if (profile.galleryDelete) {
        const del = armedButton(`button.tool.gloss${labelled}`,
          [el('span.tool-icon', { innerHTML: icon('trash') }), el('span.tool-label', {}, 'Delete')],
          [el('span.tool-icon', { innerHTML: icon('trash') }), el('span.tool-label', {}, 'Sure?')],
          async () => { sound.whoosh(); await storage.deleteDrawing(full.id); close(); render(); });
        del.dataset.tool = 'delete';
        del.setAttribute('aria-label', 'Delete');
        actions.append(del);
      }
      viewer.replaceChildren(el('div.viewer-backdrop', { onclick: close }), el('div.viewer-card', {}, el('div.viewer-frame', {}, img), actions));
      viewer.classList.add('open');
      play(img, 'bounce');
    }

    await render();
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  },
};
