// GAME-04c Pattern Parade: cats march down the street in a pattern with a gap at the end. Three
// cats wait on cushions; Carrie drags the one that comes next into the gap. Right: it joins in and
// the parade marches off to a drum beat while a new one marches in. Wrong: the cat bounces back
// and the gap glows. Patterns grow silently: AB, AAB, ABC, ABB in colour, then by size, then by
// what the cats wear. Five parades make a round, then the whole parade dances.

import { el, play } from '../../../js/ui.js';
import { say, sparklesAt, confetti, createRounds, starBadge } from '../shared.js';
import { dragToTarget } from '../../brain-covey/shared.js';
import { CATS } from '../kitty-says/art.js';
import { HATS, marcherSvg, skySvg, buntingSvg } from './art.js';

const PARADES = 5;          // parades in a round
const LINE = 6;             // cats in a parade, counting the gap
const WHITE = { name: 'white', fur: '#FFFFFF', dark: '#E3DCEF' };
const SIZES = { big: 1, medium: 0.8, small: 0.62 };
const UNITS = { AB: [0, 1], AAB: [0, 0, 1], ABC: [0, 1, 2], ABB: [0, 1, 1] };
// One entry per level: what changes along the parade, and the shape of the repeat.
const LEVELS = [
  { by: 'colour', units: ['AB'] }, { by: 'colour', units: ['AAB'] }, { by: 'colour', units: ['ABC'] },
  { by: 'colour', units: ['ABB'] }, { by: 'size', units: ['AB'] }, { by: 'hat', units: ['AB'] },
  { by: 'size', units: ['AAB', 'ABB'] }, { by: 'hat', units: ['ABC', 'AAB', 'ABB'] },
];
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const pick = a => a[Math.floor(Math.random() * a.length)];

export default {
  id: 'parade',
  name: 'Pattern Parade',
  icon: 'parade',
  ages: [4, 5, 6, 7, 8],
  badge: starBadge('parade'),
  async mount(container, profile, app) {
    const { sound } = app;
    const rounds = await createRounds({ storage: app.storage, game: 'parade', maxLevel: LEVELS.length });
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    // ---------- screen ----------
    const line = el('div.pp-line');
    const picks = el('div.pp-picks');
    const pips = el('div.pp-pips');
    const fx = el('div.pp-fx');
    const stage = el('div.pp-stage', {},
      el('div.pp-sky', { innerHTML: skySvg() }, el('div.pp-bunting', { innerHTML: buntingSvg() })), el('div.pp-road'), el('div.pp-carpet'), el('div.pp-grass'),
      line, picks, pips, fx);
    const screen = el(`div.st-game.pp-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Pattern Parade') : el('span')),
      el('div.st-board', {}, stage));
    container.append(screen);

    // ---------- sizes: one unit for the marchers, a bigger one for the cats on cushions ----------
    function layout() {
      const s = stage.getBoundingClientRect();
      const u = Math.min((s.width * 0.94) / (LINE + 0.4), (s.height * 0.36) / 1.05, 190);
      const c = Math.min(s.width * 0.27, (s.height * 0.27) / 1.05, 210);
      stage.style.setProperty('--u', u + 'px');
      stage.style.setProperty('--c', c + 'px');
      stage.style.setProperty('--bunting', s.width * 0.09 + 'px');
    }
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    // ---------- a cat: what it looks like and what the voice calls it ----------
    let spec = LEVELS[0];
    const word = v => (spec.by === 'colour' ? v.name : spec.by === 'size' ? v : HATS[v].name);
    let base = { colour: WHITE, size: 'big', hat: null };
    const looks = v => ({ ...base, [spec.by]: v });
    function catEl(tag, v, opts = {}) {
      const c = looks(v);
      const node = el(tag, { 'aria-label': word(v), innerHTML: marcherSvg(c.colour, { hat: c.hat, drum: opts.drum }) });
      node.style.setProperty('--s', SIZES[c.size]);
      return node;
    }

    // ---------- a parade ----------
    let answer = null, gap = null, cats = [], done = 0, streak = 0, busy = true;

    function newParade() {
      spec = rounds.wrapUp ? LEVELS[0] : LEVELS[rounds.level - 1];
      const unit = UNITS[pick(spec.units)];
      const n = Math.max(...unit) + 1;
      const pool = spec.by === 'colour' ? shuffle(CATS) : spec.by === 'size' ? shuffle(['big', 'small']) : shuffle(Object.keys(HATS));
      const values = pool.slice(0, n);
      base = { colour: spec.by === 'size' ? pick(CATS) : WHITE, size: 'big', hat: null };
      const off = Math.floor(Math.random() * unit.length);
      const seq = Array.from({ length: LINE }, (_, i) => values[unit[(i + off) % unit.length]]);
      answer = seq[LINE - 1];

      cats = seq.slice(0, -1).map((v, i) => {
        const node = catEl('div.pp-cat', v, { drum: i === 0 });
        node.addEventListener('pointerdown', e => { e.preventDefault(); sound.tap(); say(word(v)); play(node, 'pp-hop'); });
        return node;
      });
      gap = el('div.pp-gap', { innerHTML: marcherSvg(WHITE) }, el('span.pp-q', {}, '?'));
      line.replaceChildren(...cats, gap);

      // The three to choose from: every value in the pattern, topped up with others of the same kind.
      const others = spec.by === 'colour' ? shuffle(CATS) : spec.by === 'size' ? Object.keys(SIZES) : Object.keys(HATS);
      const choices = shuffle([...values, ...others.filter(v => !values.includes(v))].slice(0, 3));
      picks.replaceChildren(...choices.map(v => {
        const node = catEl('div.pp-pick', v);
        dragToTarget(node, {
          targets: () => (busy ? [] : [gap]),
          onPick: () => { sound.tap(); say(word(v)); },
          onTap: () => { say(word(v)); play(node, 'wiggle'); },
          onMiss: () => sound.boing(),
          onDrop: () => {
            if (v !== answer) { wrong(); return false; }
            busy = true;
            later(() => right(node, v), 260);
            return true;
          },
        });
        return el('div.pp-seat', {}, node);
      }));
      marchIn(seq);
    }

    function marchIn(seq) {
      busy = true;
      stage.classList.add('pp-busy');
      line.style.transition = 'none';
      line.style.transform = `translateX(${-stage.clientWidth}px)`;
      line.classList.add('pp-marching');
      void line.offsetWidth;
      line.style.transition = 'transform 1.6s cubic-bezier(.2, .7, .3, 1)';
      line.style.transform = '';
      for (let i = 0; i < 4; i++) later(() => sound.drum(), i * 380);
      later(() => {
        line.classList.remove('pp-marching');
        // Read the pattern out, each cat hopping as it is named.
        say(`${seq.slice(0, -1).map(word).join(', ')}, and…?`);
        cats.forEach((c, i) => later(() => play(c, 'pp-hop'), i * 420));
        later(() => { busy = false; stage.classList.remove('pp-busy'); play(gap, 'pp-glow'); }, cats.length * 420);
      }, 1700);
    }

    function wrong() {
      streak = 0;
      rounds.miss();
      sound.hmm();
      play(gap, 'pp-glow');
    }

    function right(node, v) {
      streak++;
      rounds.correct();
      rounds.record(streak);
      // The chosen cat takes its place in the parade.
      node.parentNode.classList.add('pp-used');
      const joined = catEl('div.pp-cat.pp-join', v);
      gap.replaceWith(joined);
      cats.push(joined);
      sound.chime();
      sparklesAt(fx, joined, { n: 7, spread: 90 });
      say(`${word(v)}! Yes!`);
      done++;
      renderPips();
      later(marchOff, 1100);
    }

    function marchOff() {
      stage.classList.add('pp-busy');
      picks.classList.add('pp-away');
      line.classList.add('pp-marching');
      line.style.transition = 'transform 1.8s ease-in';
      line.style.transform = `translateX(${stage.clientWidth}px)`;
      for (let i = 0; i < 5; i++) later(() => sound.drum(), i * 360);
      later(() => {
        picks.classList.remove('pp-away');
        if (done >= PARADES || rounds.wrapUp) party();
        else newParade();
      }, 1900);
    }

    function party() {
      rounds.finishRound();
      // Everyone back for a dance.
      line.classList.remove('pp-marching');
      line.style.transition = 'none';
      line.style.transform = '';
      line.classList.add('pp-dance');
      sound.cheer();
      confetti(fx, 32);
      say('What a parade! Hooray!');
      later(() => {
        line.classList.remove('pp-dance');
        done = 0;
        streak = 0;
        rounds.startRound();
        renderPips();
        newParade();
      }, 3400);
    }

    function renderPips() {
      pips.replaceChildren(...Array.from({ length: PARADES }, (_, i) => el(`span.pp-pip${i < done ? '.on' : ''}`)));
    }

    await new Promise(r => requestAnimationFrame(r));
    layout();
    rounds.startRound();
    renderPips();
    newParade();

    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
      return rounds.save();
    };
  },
};
