// GAME-05c Colour Match: fish swim slowly in a tank; bowls of the same colours sit on a shelf
// below. Drag a fish to the bowl of its colour and it swims in with bubbles while the voice says
// the colour. The wrong bowl just bounces the fish back. When every fish is home the bowls bubble
// and a new round starts. The number of colours steps up 2 → 3 → 4 → 6 without saying so.

import { el, play } from '../../../js/ui.js';
import { say, sparklesAt, dragToTarget, celebrateThenReset } from '../shared.js';
import { COLOURS, fishSvg, bowlSvg, tankFloorSvg } from './art.js';

const STAGES = [2, 3, 4, 6];        // colours per round
const ROUNDS_PER_STAGE = 2;         // finished rounds before the next step up
const SPEED = 38;                   // px per second: slow, easy to catch
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

export default {
  id: 'colour-match',
  name: 'Colours',
  icon: 'colourMatch',
  ages: [2, 3],
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const key = `brain-covey-colours:${profile.id}`;
    const saved = { stage: 0, rounds: 0, ...((await storage.getSetting(key).catch(() => null)) || {}) };
    const save = () => storage.setSetting(key, saved).catch(() => {});
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    // ---------- screen ----------
    const tank = el('div.cm-tank', {},
      el('div.cm-rays'),
      [12, 30, 55, 78, 90].map((x, i) => el('span.cm-bubble', { style: { left: x + '%', animationDelay: `-${i * 1.3}s`, animationDuration: 5 + (i % 3) + 's' } })),
      el('div.cm-floor', { innerHTML: tankFloorSvg() }));
    const bowlRow = el('div.cm-bowls');
    const fishLayer = el('div.cm-fishes');
    const fx = el('div.cm-fx');
    const stage = el('div.cm-stage', {}, tank, el('div.cm-shelf'), bowlRow, fishLayer, fx);
    const screen = el(`div.st-game.cm-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Colours') : el('span')),
      el('div.st-board', {}, stage));
    container.append(screen);

    let fishes = [], bowls = [], fishW = 130, bounds = null, raf = 0, last = 0, roundOver = false;

    // ---------- sizes follow the screen ----------
    function layout() {
      const s = stage.getBoundingClientRect(), t = tank.getBoundingClientRect();
      fishW = Math.max(110, Math.min(180, t.height * 0.32));
      stage.style.setProperty('--fish', fishW + 'px');
      // Bowls go on one, two or three rows, whichever makes them biggest.
      const n = bowls.length || 2, row = bowlRow.getBoundingClientRect();
      let size = 0, per = n;
      for (const rows of [1, 2, 3]) {
        const cols = Math.ceil(n / rows), s = Math.min(row.height / rows - 8, row.width / cols - 16);
        if (s > size + 1) { size = s; per = cols; }
      }
      stage.style.setProperty('--bowl', Math.floor(size) + 'px');
      stage.style.setProperty('--per', per);
      // Where fish may swim: inside the glass, above the sand.
      bounds = { x0: t.left - s.left + 8, x1: t.right - s.left - fishW - 8, y0: t.top - s.top + 10, y1: t.top - s.top + t.height * 0.78 - fishW * 0.75 };
      fishes.forEach(f => { f.x = Math.min(Math.max(f.x, bounds.x0), bounds.x1); f.y = Math.min(Math.max(f.y, bounds.y0), bounds.y1); place(f); });
    }
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    function place(f) {
      f.node.style.left = f.x + 'px';
      f.node.style.top = f.y + Math.sin(f.phase) * 6 + 'px';
      f.node.classList.toggle('left', f.vx < 0);
    }

    function swim(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      for (const f of fishes) {
        if (f.held || f.home) continue;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.phase += dt * 2.4;
        if (f.x < bounds.x0 || f.x > bounds.x1) { f.vx = -f.vx; f.x = Math.min(Math.max(f.x, bounds.x0), bounds.x1); }
        if (f.y < bounds.y0 || f.y > bounds.y1) { f.vy = -f.vy; f.y = Math.min(Math.max(f.y, bounds.y0), bounds.y1); }
        place(f);
      }
      // Fish nudge each other apart, so there is never a pile that small fingers can't pick from.
      const free = fishes.filter(f => !f.held && !f.home), gap = fishW * 0.95;
      for (let i = 0; i < free.length; i++) {
        for (let j = i + 1; j < free.length; j++) {
          const a = free[i], b = free[j], dx = b.x - a.x, dy = (b.y - a.y) * 1.3, d = Math.hypot(dx, dy) || 1;
          if (d >= gap) continue;
          const push = Math.min(2, (gap - d) * 0.08), ux = dx / d, uy = dy / d;
          a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
        }
      }
      raf = requestAnimationFrame(swim);
    }

    // ---------- a round ----------
    function newRound() {
      roundOver = false;
      const n = STAGES[saved.stage];
      const colours = shuffle(COLOURS).slice(0, n);
      const perColour = n <= 3 ? 2 : 1;

      bowlRow.replaceChildren();
      bowls = colours.map(c => {
        const node = el('button.cm-bowl', { 'aria-label': `${c.name} bowl`, innerHTML: bowlSvg(c) }, el('div.cm-inside'));
        node.addEventListener('pointerdown', e => {
          e.preventDefault();
          sound.bubble();
          say(c.name);
          play(node, 'wiggle');
        });
        bowlRow.append(node);
        return { c, node, inside: node.querySelector('.cm-inside') };
      });
      layout();

      fishLayer.replaceChildren();
      const count = colours.length * perColour;
      const rows = Math.max(1, Math.min(3, Math.floor((bounds.y1 - bounds.y0) / (fishW * 0.8)) + 1));
      const cols = Math.ceil(count / rows);
      fishes = shuffle(colours.flatMap(c => Array.from({ length: perColour }, () => c))).map((c, i, all) => {
        const node = el('div.cm-fish', { 'aria-label': `${c.name} fish` }, el('div.cm-fish-art', { innerHTML: fishSvg(c) }));
        fishLayer.append(node);
        const f = {
          c, node, held: false, home: false, phase: Math.random() * 6,
          // start spread out on a grid across the tank
          x: bounds.x0 + (bounds.x1 - bounds.x0) * ((i % cols + 0.5) / cols),
          y: bounds.y0 + (bounds.y1 - bounds.y0) * ((Math.floor(i / cols) + 0.5) / rows),
          vx: (Math.random() < 0.5 ? -1 : 1) * SPEED * (0.7 + Math.random() * 0.6),
          vy: (Math.random() - 0.5) * SPEED * 0.5,
        };
        const drag = dragToTarget(node, {
          targets: () => bowls.map(b => b.node),
          onPick: () => { f.held = true; sound.bubble(); say(c.name); },
          onTap: () => { later(() => { f.held = false; }, 420); play(node.firstChild, 'wiggle'); },
          onMiss: () => { sound.boing(); later(() => { f.held = false; }, 420); },
          onDrop: target => {
            const bowl = bowls.find(b => b.node === target);
            if (bowl.c !== c) return false;                // wrong bowl: bounce back
            f.home = true;
            later(() => goHome(f, bowl, drag), 280);
            return true;
          },
        });
        place(f);
        return f;
      });
      later(() => say('Fish home!'), 600);
    }

    function goHome(f, bowl) {
      f.node.remove();
      const mini = el('div.cm-mini', { innerHTML: fishSvg(f.c) });
      mini.style.animationDelay = `-${Math.random() * 3}s`;
      mini.style.top = 30 + bowl.inside.children.length * 22 + '%';
      bowl.inside.append(mini);
      sound.splash();
      say(f.c.name);
      sparklesAt(fx, bowl.node, { n: 5 });
      bubbles(bowl, 4);
      if (fishes.every(x => x.home)) finish();
    }

    function bubbles(bowl, n) {
      for (let i = 0; i < n; i++) {
        const b = el('span.cm-pop', { style: { left: 25 + Math.random() * 50 + '%', animationDelay: i * 0.15 + 's' } });
        bowl.inside.append(b);
        later(() => b.remove(), 1600);
      }
    }

    function finish() {
      if (roundOver) return;
      roundOver = true;
      if (++saved.rounds >= ROUNDS_PER_STAGE && saved.stage < STAGES.length - 1) { saved.stage++; saved.rounds = 0; }
      save();
      later(() => {
        say('All home!');
        bowls.forEach(b => bubbles(b, 6));
        celebrateThenReset({ layer: fx, sound, ms: 2400, reset: newRound });
      }, 700);
    }

    await new Promise(r => requestAnimationFrame(r));
    layout();
    newRound();
    raf = requestAnimationFrame(t => { last = t; swim(t); });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      timers.forEach(clearTimeout);
      return save();
    };
  },
};
