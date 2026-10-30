// GAME-05b Peekaboo Cats: a cosy room with four hiding places (box, curtain, bed, plant).
// "Where's the pink cat?" Tap a hiding place to look: the cat pops out ("Peekaboo!"), or it's
// empty and closes again with a soft "hmm". Every hunt hides the cats somewhere new; after a few
// hunts two cats hide at once. If she's stuck, a tail starts poking out as a hint.

import { el, play } from '../../../js/ui.js';
import { say, sparklesAt, celebrateThenReset } from '../shared.js';
import { CATS, sittingCatSvg } from '../../brain-carrie/kitty-says/art.js';
import { PLACES, roomSvg, placeSvg, tailSvg } from './room.js';

const TWO_CATS_AFTER = 3;          // hunts with one cat before two cats hide
const HINT_MS = 8000;              // a tail pokes out if nothing is found for this long
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

export default {
  id: 'peekaboo',
  name: 'Peekaboo',
  icon: 'peekaboo',
  ages: [2, 3],
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const key = `brain-covey-peekaboo:${profile.id}`;
    const saved = (await storage.getSetting(key).catch(() => null)) || { hunts: 0 };
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const opening = { box: () => sound.bounce(), curtain: () => sound.whoosh(), bed: () => sound.fwump(), plant: () => sound.puff() };

    // ---------- the room ----------
    const fx = el('div.pb-fx');
    const places = PLACES.map(p => {
      const cat = el('div.pb-cat');
      const win = el('div.pb-win', { style: { left: p.win.l + '%', top: p.win.t + '%', width: p.win.w + '%', height: p.win.h + '%' } }, cat);
      const tail = el('div.pb-tail', { style: { left: p.tail.l + '%', top: p.tail.t + '%', '--r': p.tail.r + 'deg' } });
      const node = el(`button.pb-place.pb-${p.id}`, { 'aria-label': p.name, style: { '--open': p.open } },
        el('div.pb-layer', { innerHTML: placeSvg(p, 'back') }), win, el('div.pb-layer', { innerHTML: placeSvg(p, 'front') }), tail);
      const place = { ...p, node, cat, tail, who: null, open: false, busy: false };
      node.addEventListener('pointerdown', e => { e.preventDefault(); look(place); });
      return place;
    });
    const room = el('div.pb-room', { innerHTML: roomSvg() }, places.map(p => p.node), fx);
    const screen = el(`div.st-game.pb-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Peekaboo') : el('span')),
      el('div.st-board', {}, room));
    container.append(screen);

    // ---------- a hunt ----------
    let hidden = [], last = [], misses = 0, hintTimer = 0, done = false;

    function hunt() {
      done = false;
      misses = 0;
      const n = saved.hunts >= TWO_CATS_AFTER ? 2 : 1;
      const cats = shuffle(CATS).slice(0, n);
      // Somewhere new every time: never the spot a cat was just found in.
      const spots = shuffle(places.filter(p => !last.includes(p.id))).concat(shuffle(places.filter(p => last.includes(p.id))));
      places.forEach(p => { p.who = null; p.cat.innerHTML = ''; p.tail.classList.remove('show'); });
      hidden = cats.map((c, i) => {
        const p = spots[i];
        p.who = c;
        p.cat.innerHTML = sittingCatSvg(c);
        p.cat.querySelector('svg').setAttribute('preserveAspectRatio', 'xMidYMax meet');
        p.tail.innerHTML = tailSvg(c.fur);
        return p;
      });
      last = hidden.map(p => p.id);
      later(() => say(n === 1 ? `Where's the ${cats[0].name} cat?` : 'Where are the kitties?'), 500);
      armHint();
    }

    function armHint() {
      clearTimeout(hintTimer);
      hintTimer = later(hint, HINT_MS);
    }
    function hint() {
      const p = hidden.find(h => !h.open);
      if (!p || done) return;
      p.tail.classList.add('show');
      sound.squeak();
    }

    function setOpen(p, on) {
      p.open = on;
      p.node.classList.toggle('open', on);
      if (on) opening[p.id]();
    }

    function look(p) {
      if (p.busy || done) { sound.tap(); play(p.node, 'pb-jiggle'); return; }
      if (p.open && p.who) {
        // Tapping a found cat: it meows again and you hear its colour.
        sound.meow(p.who.note * 0.8);
        say(`${p.who.name} cat`);
        play(p.cat, 'pb-hop');
        return;
      }
      p.busy = true;
      setOpen(p, true);
      if (p.who) {
        p.tail.classList.remove('show');
        p.cat.classList.add('meow');
        later(() => {
          sound.meow(p.who.note * 0.8);
          say('Peekaboo!');
          sparklesAt(fx, p.cat, { n: 6 });
        }, 280);
        later(() => p.cat.classList.remove('meow'), 900);
        later(() => { p.busy = false; found(); }, 700);
      } else {
        later(() => { sound.hmm(); say(`not in the ${p.name}`); }, 300);
        later(() => setOpen(p, false), 1100);
        later(() => { p.busy = false; }, 1500);
        if (++misses >= 2) hint();
      }
    }

    function found() {
      if (hidden.some(p => !p.open)) { armHint(); return; }
      done = true;
      clearTimeout(hintTimer);
      saved.hunts++;
      storage.setSetting(key, saved).catch(() => {});
      later(() => {
        say(hidden.length > 1 ? 'You found them!' : 'You found it!');
        celebrateThenReset({
          layer: fx, sound, ms: 2200,
          reset: () => {
            places.forEach(p => p.open && setOpen(p, false));
            later(hunt, 900);
          },
        });
      }, 700);
    }

    hunt();

    return () => {
      timers.forEach(clearTimeout);
      return storage.setSetting(key, saved).catch(() => {});
    };
  },
};
