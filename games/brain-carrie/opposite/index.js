// GAME-04b Opposite Day: red and blue fish swim across the pond and the cat conductor's sign says
// which colour to tap. Tapping a fish of the wrong colour makes her giggle and shake her head; the
// fish just swims on. It gets harder silently: first "tap the red fish", then the rule flips every
// 10 fish (whistle and the sign turns over), then Opposite Day: while her party hat is on, the sign
// means "don't" (hat on and off every 8 fish). Ten fish in the bucket is a party.

import { el, play } from '../../../js/ui.js';
import { cloudSvg } from '../../../js/art.js';
import { say, sparklesAt, confetti, createRounds, loadProgress, starsFor, STAR_STEPS } from '../shared.js';
import { COLOURS, fishSvg } from '../../brain-covey/colours/art.js';
import { starSvg } from '../kitty-says/art.js';
import { conductorSvg, signInner, pondSvg, bucketSvg } from './art.js';

const RED = COLOURS[0], BLUE = COLOURS[1];
const FISH = { red: fishSvg(RED), blue: fishSvg(BLUE) };
const BUCKET = 10;          // fish to fill the bucket
const FLIP_EVERY = 10;      // fish between rule flips (phase 2)
const HAT_EVERY = 8;        // fish between hat on and off (phase 3)
const GRACE_MS = 1200;      // after a rule change, a slip is not counted
// Levels 1-3: tap one colour; 4-6: the colour flips; 7-9: Opposite Day.
const phaseFor = level => (level <= 3 ? 1 : level <= 6 ? 2 : 3);

async function badge(profile, storage) {
  const { best } = await loadProgress(storage, 'opposite');
  const n = starsFor(best);
  return el('span.tile-stars', { 'aria-label': `${n} stars` },
    STAR_STEPS.map((_, i) => el(`span.tile-star${i < n ? '.on' : ''}`, { innerHTML: starSvg() })));
}

export default {
  id: 'opposite',
  name: 'Opposite Day',
  icon: 'opposite',
  ages: [4, 5, 6, 7, 8],
  badge,
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const rounds = await createRounds({ storage, game: 'opposite', maxLevel: 9 });
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    // ---------- screen ----------
    const conductor = el('div.od-conductor', { innerHTML: conductorSvg(RED) });
    const sign = conductor.querySelector('.od-sign');
    const bucket = el('div.od-bucket');
    const pips = el('div.od-pips');
    const bucketBox = el('div.od-bucket-box', {}, bucket, pips);
    const sky = el('div.od-sky', { innerHTML: cloudSvg() }, conductor, bucketBox);
    const fishLayer = el('div.od-fishes');
    const water = el('div.od-water', { innerHTML: pondSvg() }, fishLayer);
    const fx = el('div.od-fx');
    const stage = el('div.od-stage', {}, sky, water, fx);
    const screen = el(`div.st-game.od-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Opposite Day') : el('span')),
      el('div.st-board', {}, stage));
    container.append(screen);

    conductor.addEventListener('pointerdown', e => {
      e.preventDefault();
      sound.meow(700);
      play(conductor, 'od-bob');
      say(ruleWords());
    });

    // ---------- state ----------
    let target = RED, opposite = false, phase = 1, sinceChange = 0, changedAt = 0;
    let caught = [], streak = 0, speed = 0, spawnGap = 0, nextSpawn = 0, playing = false;
    let fishes = [], lanes = [], fishW = 120, raf = 0, last = 0;

    const isGo = f => (f.c === target) !== opposite;
    const other = c => (c === RED ? BLUE : RED);
    function ruleWords() {
      if (opposite) return `Opposite Day! ${target.name} means don't!`;
      return `Tap the ${target.name} fish!`;
    }
    function showSign(flip) {
      if (!flip) { sign.innerHTML = signInner(target); return; }
      sign.classList.add('flip');
      later(() => { sign.innerHTML = signInner(target); }, 200);
      later(() => sign.classList.remove('flip'), 420);
    }
    function renderBucket() {
      bucket.innerHTML = bucketSvg(caught);
      pips.replaceChildren(...Array.from({ length: BUCKET }, (_, i) => {
        const p = el('span.od-pip');
        if (caught[i]) p.style.background = caught[i].fill;
        return p;
      }));
    }

    // ---------- layout: lanes across the water, fish sized to fit ----------
    function layout() {
      const w = water.getBoundingClientRect();
      const n = w.height > 520 ? 4 : w.height > 300 ? 3 : 2;
      const laneH = w.height / n;
      fishW = Math.min(170, w.width * 0.24, laneH * 0.8 * (160 / 110));
      stage.style.setProperty('--fish', fishW + 'px');
      lanes = Array.from({ length: n }, (_, i) => ({ y: laneH * (i + 0.5) - (fishW * 110 / 160) / 2, dir: i % 2 ? -1 : 1, lastX: null }));
      fishes = fishes.filter(f => { if (f.lane < n) return true; f.node.remove(); return false; });
    }
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    // ---------- fish ----------
    function spawn() {
      const W = water.clientWidth;
      // A lane whose last fish has swum clear of the edge.
      const free = lanes.map((l, i) => i).filter(i => !fishes.some(f => f.lane === i && !f.done &&
        (lanes[i].dir > 0 ? f.x < fishW * 0.9 : f.x > W - fishW * 1.9)));
      if (!free.length) return;
      const lane = free[Math.floor(Math.random() * free.length)];
      // About half the fish are ones to tap; near the end of a long round, all of them are.
      const wantGo = rounds.wrapUp || Math.random() < 0.55;
      const goColour = opposite ? other(target) : target;
      const c = wantGo ? goColour : other(goColour);
      const dir = lanes[lane].dir;
      const node = el(`button.od-fish${dir < 0 ? '.left' : ''}`, { 'aria-label': `${c.name} fish`, innerHTML: fishSvgFor(c) });
      const f = { node, c, lane, dir, x: dir > 0 ? -fishW : W, done: false };
      node.addEventListener('pointerdown', e => { e.preventDefault(); tap(f); });
      fishLayer.append(node);
      fishes.push(f);
      place(f);
      sinceChange++;
      maybeChangeRule();
    }
    const fishSvgFor = c => `<div class="od-fish-in">${FISH[c.id]}</div>`;
    const place = f => { f.node.style.transform = `translate(${f.x}px, ${lanes[f.lane]?.y ?? 0}px)`; };

    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      if (!playing) return;
      const W = water.clientWidth;
      for (const f of fishes) {
        if (f.done) continue;
        f.x += f.dir * speed * dt;
        place(f);
        if (f.x > W + 10 || f.x < -fishW - 10) { f.done = true; f.node.remove(); }
      }
      fishes = fishes.filter(f => f.node.isConnected);
      if (t >= nextSpawn) { spawn(); nextSpawn = t + spawnGap * (0.8 + Math.random() * 0.4); }
    }

    // ---------- the rule ----------
    function maybeChangeRule() {
      if (phase === 2 && sinceChange >= FLIP_EVERY) {
        sinceChange = 0;
        target = other(target);
        announce(true);
      } else if (phase === 3 && sinceChange >= HAT_EVERY) {
        sinceChange = 0;
        opposite = !opposite;
        conductor.classList.toggle('hat', opposite);
        announce(false);
      }
    }
    function announce(flip) {
      changedAt = performance.now();
      sound.whistle();
      play(conductor, 'od-bob');
      showSign(flip);
      later(() => say(opposite ? ruleWords() : flip ? `Now tap the ${target.name} fish!` : `Hat off! Tap the ${target.name} fish!`), 350);
    }

    function tap(f) {
      if (f.done || !playing) return;
      if (!isGo(f)) {
        play(f.node.firstChild, 'od-wobble');
        if (performance.now() - changedAt < GRACE_MS) { sound.tap(); return; }   // the rule only just changed
        streak = 0;
        rounds.miss();
        sound.hmm();
        later(() => sound.giggle(), 200);
        play(conductor, 'od-giggle');
        return;
      }
      f.done = true;
      streak++;
      rounds.correct();
      rounds.record(streak);
      sound.pop();
      sparklesAt(fx, f.node, { n: 5, color: f.c.fill });
      // Up out of the water and into the bucket.
      const s = stage.getBoundingClientRect(), a = f.node.getBoundingClientRect(), b = bucket.getBoundingClientRect();
      const fly = el(`div.od-flyer${f.dir < 0 ? '.left' : ''}`, { innerHTML: f.node.innerHTML });
      fly.style.left = a.left - s.left + 'px';
      fly.style.top = a.top - s.top + 'px';
      fly.style.width = a.width + 'px';
      fx.append(fly);
      f.node.remove();
      requestAnimationFrame(() => {
        fly.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height * 0.25 - a.top - a.height / 2}px) scale(.35) rotate(-80deg)`;
        fly.style.opacity = '0.2';
      });
      later(() => {
        fly.remove();
        caught.push(f.c);
        renderBucket();
        sound.splash();
        play(bucket, 'od-bob');
        if (caught.length === BUCKET) finish();
        else if (caught.length % 4 === 0) say(['Yes!', 'Good job!', 'Great catching!'][Math.floor(Math.random() * 3)]);
      }, 560);
    }

    // ---------- a round ----------
    function newRound() {
      rounds.startRound();
      phase = phaseFor(rounds.level);
      // Slow at first, a little quicker with every level.
      speed = water.clientWidth / Math.max(4.6, 8.5 - (rounds.level - 1) * 0.45);
      spawnGap = Math.max(900, 1500 - (rounds.level - 1) * 70);
      target = phase === 1 ? RED : Math.random() < 0.5 ? RED : BLUE;
      opposite = false;
      conductor.classList.remove('hat', 'od-dance');
      caught = [];
      streak = 0;
      sinceChange = 0;
      changedAt = 0;
      renderBucket();
      showSign(false);
      play(conductor, 'od-bob');
      later(() => { sound.whistle(); say(ruleWords()); }, 400);
      later(() => { playing = true; nextSpawn = 0; }, 1600);
    }

    function finish() {
      playing = false;
      rounds.finishRound();
      for (const f of fishes) f.node.classList.add('od-away');
      later(() => { fishes.forEach(f => f.node.remove()); fishes = []; }, 600);
      conductor.classList.add('od-dance');
      sound.cheer();
      confetti(fx, 28);
      say('Hooray! A full bucket!');
      later(newRound, 3600);
    }

    renderBucket();
    await new Promise(r => requestAnimationFrame(r));
    layout();
    raf = requestAnimationFrame(frame);
    newRound();

    return () => {
      playing = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      timers.forEach(clearTimeout);
      return rounds.save();
    };
  },
};
