// GAME-05e Big and Small: three things in three sizes and three homes to match. Drag each one to
// the home of its size and the voice says "small", "medium" or "big". The round rotates every time:
// cats into beds (they curl up and snore), fish into bowls, hats onto cats, and finally Gigi and a
// cat into a tall house and a short house. The wrong home just bounces it back.

import { el, play } from '../../../js/ui.js';
import { say, sparklesAt, dragToTarget, celebrateThenReset } from '../shared.js';
import { sittingCatSvg } from '../../brain-carrie/kitty-says/art.js';
import { COLOURS, fishSvg, bowlSvg } from '../colours/art.js';
import { gigiSvg } from '../../giraffe/giraffe.js';
import { CAT_FURS, bedSvg, hatSvg, houseSvg, bedroomSvg } from './art.js';

const SCALE = [0.58, 0.79, 1];                     // small, medium, big
const SIZE_WORDS = ['small', 'medium', 'big'];
const BED_COLOURS = ['#FF8A7A', '#4ADE9A', '#B78CFF'];
const FISH = [COLOURS[2], COLOURS[5], COLOURS[0]];  // yellow, orange, red
const HATS = [['#FF5FA8', '#FFC93C'], ['#4D96FF', '#fff'], ['#4ADE9A', '#B78CFF']];
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const cat = i => sittingCatSvg(CAT_FURS[i]);

// Each round: what you drag (item) and where it goes (target), as SVG plus width (in units) and
// height/width. 'swap' homes hide the item and show the filled home; 'stay' leaves it standing there.
const ROUNDS = [
  {
    id: 'beds', done: 'Night night!', words: SIZE_WORDS, mode: 'swap', home: s => s.snore(),
    item: i => ({ html: cat(i), w: 0.5, h: 1.1 }),
    target: i => ({ html: bedSvg(BED_COLOURS[i], CAT_FURS[i]), w: 1, h: 170 / 300 }),
  },
  {
    id: 'bowls', done: 'All the fish are home!', words: SIZE_WORDS, mode: 'swap', home: s => s.splash(),
    item: i => ({ html: fishSvg(FISH[i]), w: 0.55, h: 110 / 160 }),
    target: i => ({ html: bowlSvg(COLOURS[1]), extra: `<div class="bs-in-bowl">${fishSvg(FISH[i])}</div>`, w: 0.72, h: 1 }),
  },
  {
    id: 'hats', done: 'Nice hats!', words: SIZE_WORDS, mode: 'swap', home: s => s.pop(),
    item: i => ({ html: hatSvg(...HATS[i]), w: 0.5, h: 100 / 120 }),
    target: i => ({ html: cat(i), extra: `<div class="bs-hat-on">${hatSvg(...HATS[i])}</div>`, w: 0.62, h: 1.1 }),
  },
  {
    id: 'tall', done: 'Tall and short!', words: ['short', 'tall'], mode: 'stay', home: s => s.hoof(),
    item: i => (i ? { html: gigiSvg(), w: 0.56, h: 420 / 360, scale: 1 } : { html: cat(1), w: 0.36, h: 1.1, scale: 1 }),
    target: i => (i ? { html: houseSvg(true), w: 0.62, h: 360 / 200, scale: 1 } : { html: houseSvg(false), w: 0.62, h: 220 / 200, scale: 1 }),
  },
];

export default {
  id: 'big-small',
  name: 'Big and Small',
  icon: 'sizes',
  ages: [2, 3],
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const key = `brain-covey-sizes:${profile.id}`;
    const saved = { next: 0, ...((await storage.getSetting(key).catch(() => null)) || {}) };
    const save = () => storage.setSetting(key, saved).catch(() => {});
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    const itemsRow = el('div.bs-items');
    const targetsRow = el('div.bs-targets');
    const fx = el('div.bs-fx');
    const stage = el('div.bs-stage', { innerHTML: bedroomSvg() }, targetsRow, itemsRow, fx);
    const screen = el(`div.st-game.bs-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Big and Small') : el('span')),
      el('div.st-board', {}, stage));
    container.append(screen);

    let round = null, items = [], targets = [], finished = false;

    // ---------- sizes: everything scales from one unit that fits the screen ----------
    function layout() {
      if (!round) return;
      const s = stage.getBoundingClientRect();
      const W = s.width * 0.92, gap = Math.min(24, s.width * 0.03);
      const size = x => x.spec.w * (x.spec.scale ?? SCALE[x.i]);
      const widths = list => list.reduce((sum, x) => sum + size(x), 0);
      const tallest = list => Math.max(...list.map(x => size(x) * x.spec.h));
      // Homes fill the floor; the things you drag may be up to 1.6× bigger than strictly to scale,
      // so that on narrow screens they stay big enough for small fingers.
      const uT = Math.min((W - gap * targets.length) / widths(targets), (s.height * 0.5) / tallest(targets), 420);
      const uI = Math.min((W - gap * items.length) / widths(items), (s.height * 0.38) / tallest(items), uT * 1.6, 420);
      for (const x of targets) x.node.style.width = uT * size(x) + 'px';
      for (const x of items) x.node.style.width = uI * size(x) + 'px';
    }
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    function newRound() {
      finished = false;
      round = ROUNDS[saved.next % ROUNDS.length];
      stage.dataset.round = round.id;
      const n = round.words.length;
      targetsRow.replaceChildren();
      targets = shuffle([...Array(n).keys()]).map(i => {
        const spec = round.target(i);
        const node = el('button.bs-target', { 'aria-label': round.words[i], innerHTML: spec.html + (spec.extra || '') });
        node.style.aspectRatio = `1 / ${spec.h}`;
        node.addEventListener('pointerdown', e => { e.preventDefault(); sound.tap(); say(round.words[i]); play(node, 'bs-squish'); });
        targetsRow.append(node);
        return { i, spec, node, home: false };
      });
      itemsRow.replaceChildren();
      items = shuffle([...Array(n).keys()]).map(i => {
        const spec = round.item(i);
        const node = el('div.bs-item', { 'aria-label': round.words[i], innerHTML: spec.html });
        node.style.aspectRatio = `1 / ${spec.h}`;
        itemsRow.append(node);
        const it = { i, spec, node };
        dragToTarget(node, {
          targets: () => targets.filter(t => !t.home).map(t => t.node),
          onPick: () => { sound.tap(); say(round.words[i]); },
          onTap: () => { say(round.words[i]); play(node, 'wiggle'); },
          onMiss: () => sound.boing(),
          onDrop: tn => {
            const t = targets.find(x => x.node === tn);
            if (t.i !== i) return false;                   // the wrong size: bounce back
            t.home = true;
            later(() => settle(it, t), 280);
            return true;
          },
        });
        return it;
      });
      layout();
      later(() => say(round.id === 'tall' ? 'Who is tall?' : 'Big and small!'), 500);
    }

    function settle(it, t) {
      if (round.mode === 'swap') it.node.classList.add('bs-gone');
      else it.node.classList.add('bs-stays');
      t.node.classList.add('home');
      round.home(sound);
      say(round.words[t.i]);
      sparklesAt(fx, t.node, { n: 5 });
      if (targets.every(x => x.home) && !finished) {
        finished = true;
        saved.next++;
        save();
        later(() => {
          say(round.done);
          celebrateThenReset({ layer: fx, sound, ms: 2600, reset: newRound });
        }, 900);
      }
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
