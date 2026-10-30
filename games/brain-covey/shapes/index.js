// GAME-05d Shape Sorter: a cat-shaped toy box with holes (circle, square, triangle, star; later
// heart and rectangle too). Drag a block to its hole and it clunks in while the voice says the
// shape; the wrong hole just bounces it off. When every block is in, the box purrs, shakes and
// spits the blocks back out onto the rug to start again.

import { el, play } from '../../../js/ui.js';
import { say, sparklesAt, confetti, dragToTarget } from '../shared.js';
import { SHAPES, blockSvg, holeSvg, boxSvg } from './art.js';

const ROUNDS_BEFORE_SIX = 2;        // rounds with four shapes before heart and rectangle join
// Hole centres and size in the box's own 600 × 440 units.
const HOLES = {
  4: { size: 100, at: [[120, 300], [240, 300], [360, 300], [480, 300]] },
  6: { size: 72, at: [[150, 258], [300, 258], [450, 258], [150, 334], [300, 334], [450, 334]] },   // between the mouth and the paws
};
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

export default {
  id: 'shape-sorter',
  name: 'Shapes',
  icon: 'shapes',
  ages: [2, 3],
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const key = `brain-covey-shapes:${profile.id}`;
    const saved = { rounds: 0, ...((await storage.getSetting(key).catch(() => null)) || {}) };
    const save = () => storage.setSetting(key, saved).catch(() => {});
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    // ---------- screen ----------
    const box = el('div.ss-box', { innerHTML: boxSvg() });
    const holeLayer = el('div.ss-holes');
    box.append(holeLayer);
    const blockLayer = el('div.ss-blocks');
    const fx = el('div.ss-fx');
    const rug = el('div.ss-rug');
    const stage = el('div.ss-stage', {}, rug, box, blockLayer, fx);
    const screen = el(`div.st-game.ss-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Shapes') : el('span')),
      el('div.st-board', {}, stage));
    container.append(screen);

    box.addEventListener('pointerdown', e => {
      if (e.target.closest('.ss-hole')) return;
      e.preventDefault();
      sound.meow(620);
      say('meow!');
      play(box, 'ss-wobble');
    });

    let holes = [], blocks = [], busy = false;

    // ---------- where the blocks sit on the rug ----------
    function layout() {
      const s = stage.getBoundingClientRect(), b = box.getBoundingClientRect();
      const n = blocks.length || 4;
      const hole = b.width * (HOLES[n === 6 ? 6 : 4].size / 600);
      const zone = { x0: s.width * 0.06, x1: s.width * 0.94, y0: b.bottom - s.top + 14, y1: s.height - 12 };
      const W = zone.x1 - zone.x0, H = zone.y1 - zone.y0;
      // One or two rows on the rug, whichever gives bigger blocks; never smaller than the hole.
      let size = 0, cols = n, rows = 1;
      for (const r of [1, 2]) {
        const c = Math.ceil(n / r), sz = Math.min(H / r - 12, W / c - 20, 160);
        if (sz > size) { size = sz; cols = c; rows = r; }
      }
      size = Math.max(Math.min(size, hole * 1.25), Math.min(96, size));
      // The rug sits under wherever the blocks are.
      rug.style.top = zone.y0 - 6 + 'px';
      rug.style.height = H + 6 + 'px';
      stage.style.setProperty('--block', size + 'px');
      blocks.forEach(bl => {
        const col = bl.slot % cols, row = Math.floor(bl.slot / cols);
        const inRow = Math.min(cols, n - row * cols);
        bl.cx = zone.x0 + W * ((col + 0.5) / inRow) + bl.jx * size * 0.15;
        bl.cy = zone.y0 + H * ((row + 0.5) / rows) + bl.jy * size * 0.08;
        bl.node.style.left = bl.cx - size / 2 + 'px';
        bl.node.style.top = bl.cy - size / 2 + 'px';
      });
    }
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    // ---------- a round ----------
    function newRound(spit = false) {
      busy = false;
      const shapes = SHAPES.slice(0, saved.rounds >= ROUNDS_BEFORE_SIX ? 6 : 4);
      const spec = HOLES[shapes.length];

      holeLayer.replaceChildren();
      holes = shapes.map((sh, i) => {
        const [x, y] = spec.at[i];
        const node = el('button.ss-hole', { 'aria-label': `${sh.name} hole`, innerHTML: holeSvg(sh) });
        node.style.left = (x - spec.size / 2) / 6 + '%';
        node.style.top = (y - spec.size / 2) / 4.4 + '%';
        node.style.width = spec.size / 6 + '%';
        node.addEventListener('pointerdown', e => { e.preventDefault(); sound.tap(); say(sh.name); play(node, 'ss-pulse'); });
        holeLayer.append(node);
        return { sh, node };
      });

      blockLayer.replaceChildren();
      const slots = shuffle(shapes.map((_, i) => i));
      blocks = shapes.map((sh, i) => {
        const node = el('div.ss-block', { 'aria-label': `${sh.name} block`, innerHTML: blockSvg(sh) });
        blockLayer.append(node);
        const bl = { sh, node, slot: slots[i], jx: Math.random() - 0.5, jy: Math.random() - 0.5, inside: false };
        dragToTarget(node, {
          targets: () => holes.map(h => h.node),
          onPick: () => { sound.tap(); say(sh.name); },
          onTap: () => { say(sh.name); play(node.firstChild, 'wiggle'); },
          onMiss: () => sound.boing(),
          onDrop: target => {
            const h = holes.find(x => x.node === target);
            if (h.sh !== sh || bl.inside) return false;     // wrong hole: it bounces off
            bl.inside = true;
            later(() => drop(bl, h), 260);
            return true;
          },
        });
        return bl;
      });
      layout();

      if (spit) {
        // Out of the cat's mouth and back onto the rug, one after another.
        const s = stage.getBoundingClientRect(), b = box.getBoundingClientRect();
        const mx = b.left - s.left + b.width / 2, my = b.top - s.top + b.height * 0.5;
        blocks.forEach((bl, i) => {
          bl.node.style.transition = 'none';
          bl.node.style.transform = `translate(${mx - bl.cx}px, ${my - bl.cy}px) scale(.2)`;
          bl.node.style.opacity = '0';
          later(() => {
            bl.node.style.transition = 'transform .6s var(--spring), opacity .2s';
            bl.node.style.transform = '';
            bl.node.style.opacity = '';
            sound.pop();
          }, 120 + i * 160);
        });
      }
    }

    function drop(bl, h) {
      bl.node.classList.add('ss-in');
      h.node.classList.add('filled');
      sound.clunk();
      say(bl.sh.name);
      sparklesAt(fx, h.node, { n: 5 });
      if (blocks.every(x => x.inside)) finish();
    }

    function finish() {
      if (busy) return;
      busy = true;
      saved.rounds++;
      save();
      later(() => {
        say('All in!');
        box.classList.add('happy', 'purring');
        sound.purr(1.8);
        confetti(fx, 24);
      }, 500);
      later(() => { box.classList.remove('purring', 'happy'); box.classList.add('spitting'); sound.boing(); }, 2400);
      later(() => newRound(true), 2600);
      later(() => box.classList.remove('spitting'), 3600);
    }

    await new Promise(r => requestAnimationFrame(r));
    newRound();

    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
      return save();
    };
  },
};
