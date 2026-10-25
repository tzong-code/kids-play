// Colouring pages: pick a picture, then tap areas to fill them (or colour with brushes).

import { mountEditor } from './editor.js';
import { pageSvg } from '../../js/canvas.js';
import { el, play } from '../../js/ui.js';
import { PAGES } from '../../assets/pages/pages.js';

function pagesFor(profile) {
  const set = PAGES.filter(p => p.set === profile.pageSet);
  // Her theme first (sea creatures for Covey, princesses for Carrie), then the rest.
  return [...set.filter(p => p.theme === profile.pageTheme), ...set.filter(p => p.theme !== profile.pageTheme)];
}

export default {
  id: 'colour',
  name: 'Colour',
  icon: 'colour',
  ages: [2, 3, 4, 5, 6, 7, 8],
  async mount(container, profile, app, params) {
    if (params.pageId) return mountEditor(container, profile, app, params);

    const grid = el('div.page-grid');
    for (const page of pagesFor(profile)) {
      const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pageSvg(page.svg, profile.pageStroke * 1.4, 240));
      const tile = el('button.page-tile', {
        onclick: () => {
          app.sound.pop();
          play(tile, 'bounce');
          setTimeout(() => app.open('colour', { pageId: page.id }), 180);
        },
      }, el('img', { src, alt: '', draggable: false }));
      grid.append(tile);
    }
    container.append(el('div.picker-screen', {},
      el('div.screen-top', {}, app.exitButton(), app.homeButton(),
        profile.showText ? el('h1', {}, 'Pick a picture') : null),
      grid));
  },
};
