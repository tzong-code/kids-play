// GAME-04e Word Fishing: Carrie's cat sits in a boat with a fishing rod, and fish carrying letters
// swim below. Tap the right fish: the hook drops to it, reels it up, and its letter flies to the
// word card. It grows silently: first "catch the fish that says mmm" (letter sounds), then
// three-letter words caught letter by letter (the finished word's picture jumps into the boat),
// then her own name and her sister's. Five things in the boat is a party.

import { el, play } from '../../../js/ui.js';
import { avatarSvg, cloudSvg, stickerUrl, STICKERS } from '../../../js/art.js';
import { PROFILES } from '../../../js/profiles.js';
import { say, sparklesAt, confetti, createRounds, starBadge } from '../shared.js';
import { COLOURS, fishSvg } from '../../brain-covey/colours/art.js';
import { ROD_TIP, RIM, boatBackSvg, boatFrontSvg, hookSvg, speakerSvg, lakeSvg } from './art.js';
import { WORDS, SOUNDS, NAMES, SOUND_SETS } from './words.js';

const GOALS = 5;            // things in the boat for a party
const CARGO = [0.02, 0.14, 0.53, 0.63, 0.73];   // where they sit along the boat
const HINT_MS = 7000;       // no catch for this long: the right fish glows
// One entry per level. sound: catch the letter sound; word: spell a word; name: names between words.
const LEVELS = [
  { kind: 'sound', fish: 3, set: 0, ghost: true, secs: 12 },
  { kind: 'sound', fish: 4, set: 1, secs: 11 },
  { kind: 'sound', fish: 5, set: 2, secs: 10 },
  { kind: 'word', fish: 4, ghost: true, secs: 11 },
  { kind: 'word', fish: 5, secs: 10 },
  { kind: 'word', fish: 6, secs: 8 },
  { kind: 'name', fish: 5, ghost: true, secs: 10 },
  { kind: 'name', fish: 6, secs: 9 },
];
const ALIKE = { c: 'k', k: 'c' };    // letters that make the same sound never share the water
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const pick = a => a[Math.floor(Math.random() * a.length)];
const ease = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** A word's or letter's picture: one of our stickers, or an emoji. */
const pictureEl = v => (STICKERS[v]
  ? el('img.wf-pic-img', { src: stickerUrl(v), alt: '', draggable: false })
  : el('span.wf-emoji', {}, v));

export default {
  id: 'fishing',
  name: 'Word Fishing',
  icon: 'fishing',
  ages: [4, 5, 6, 7, 8],
  badge: starBadge('fishing'),
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const rounds = await createRounds({ storage, game: 'fishing', maxLevel: LEVELS.length });
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const sister = Object.values(PROFILES).find(p => p.id !== profile.id);

    // ---------- screen ----------
    const boat = el('div.wf-boat', {},
      el('div.wf-boat-back', { innerHTML: boatBackSvg() }), el('div.wf-cargo'), el('div.wf-boat-front', { innerHTML: boatFrontSvg() }));
    const cargo = boat.querySelector('.wf-cargo');
    const cat = boat.querySelector('.wf-cat');
    const pic = el('div.wf-pic');
    const slots = el('div.wf-slots');
    const speaker = el('button.wf-say', { 'aria-label': 'Say it again', innerHTML: speakerSvg() });
    const card = el('div.wf-card', {}, pic, slots, speaker);
    const sky = el('div.wf-sky', { innerHTML: cloudSvg() }, card);
    const fishLayer = el('div.wf-fishes');
    const water = el('div.wf-water', { innerHTML: lakeSvg() }, fishLayer);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    line.setAttribute('class', 'wf-line');
    line.innerHTML = '<path fill="none"/>';
    const linePath = line.firstChild;
    const hook = el('div.wf-hook', { innerHTML: hookSvg() });
    const fx = el('div.wf-fx');
    const stage = el('div.wf-stage', {}, sky, water, boat, line, hook, fx);
    const screen = el(`div.st-game.wf-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Word Fishing') : el('span')),
      el('div.st-board', {}, stage));
    container.append(screen);

    // ---------- state ----------
    let spec = LEVELS[0], goal = null, step = 0, missed = false, done = 0, streak = 0, busy = true;
    let fishes = [], lanes = [], fishW = 120, speed = 60, raf = 0, last = 0, hintAt = 0, recent = [];
    let W = 0, skyH = 0, boatW = 0, boatLeft = 0, boatMax = 0;
    let hookPos = null, tween = null, held = null;

    // ---------- layout: the sky, the card, the boat and the fish lanes ----------
    function layout() {
      const s = stage.getBoundingClientRect();
      W = s.width;
      const narrow = W < 640;
      const n = Math.max(goal?.tiles.length || 3, 3);
      let tile;
      if (narrow) {
        // Card across the top, the boat under it. Long names leave the picture out to fit.
        const long = n > 4;
        card.classList.toggle('long', long);
        tile = Math.min(58, (W - 94) / (n + 0.14 * (n - 1) + (long ? 0 : 1.39)));
        const cardH = tile * 1.15 + 24;
        const boatH = Math.min(150, Math.max(96, s.height * 0.17));
        skyH = 10 + cardH + 6 + boatH * RIM;
        stage.style.setProperty('--boat', boatH + 'px');
      } else {
        card.classList.remove('long');
        skyH = Math.max(160, Math.min(s.height * 0.34, 300));
        tile = Math.min(84, skyH * 0.32, (W * 0.62 - 24 - 60) / (n + 1.25 + 0.15 * n));
        stage.style.setProperty('--boat', skyH * 0.66 / RIM * 0.9 + 'px');
      }
      stage.style.setProperty('--sky', skyH + 'px');
      stage.style.setProperty('--tile', tile + 'px');
      stage.classList.toggle('narrow', narrow);
      boatW = boat.offsetWidth;
      // The boat stays clear of the card (wide screens) or anywhere under it (narrow).
      const c = card.getBoundingClientRect();
      boatMax = narrow ? W - boatW - 4 : Math.max(8, Math.min(W * 0.5, c.left - s.left - boatW - 12));
      setBoat(Math.min(Math.max(boatLeft || W * 0.04, 4), boatMax), false);

      // The lanes start below the boat's hull.
      const top = boat.offsetHeight * 0.4, h = s.height - skyH - top;
      const nl = h > 480 ? 4 : h > 300 ? 3 : 2;
      const laneH = h / nl;
      fishW = Math.min(180, W * 0.25, laneH * 0.86 * (160 / 110));
      stage.style.setProperty('--fish', fishW + 'px');
      lanes = Array.from({ length: nl }, (_, i) => ({ y: top + laneH * (i + 0.5) - (fishW * 110 / 160) / 2, dir: i % 2 ? -1 : 1 }));
      if (fishes.length && fishes.some(f => f.lane >= nl)) school(true);
    }
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    function setBoat(x, glide = true) {
      boatLeft = x;
      boat.classList.toggle('gliding', glide);
      boat.style.left = x + 'px';
    }
    function rodTip() {
      const s = stage.getBoundingClientRect(), b = boat.getBoundingClientRect();
      return { x: b.left - s.left + b.width * ROD_TIP[0], y: b.top - s.top + b.height * ROD_TIP[1] };
    }

    // ---------- fish ----------
    const loop = () => W + fishW * 1.2;
    const display = l => (goal?.kind === 'name' && step === 0 ? l.toUpperCase() : l);
    function fishXY(f) {
      const x = lanes[f.lane].dir > 0 ? f.p - fishW : loop() - f.p - fishW;
      return { x, y: lanes[f.lane].y };
    }
    function place(f) {
      const { x, y } = fishXY(f);
      f.node.style.transform = `translate(${x}px, ${y}px)`;
    }
    function makeFish(letter, lane, p, colour) {
      const left = lanes[lane].dir < 0;
      const label = el('span.wf-letter', {}, display(letter));
      const node = el(`button.wf-fish${left ? '.left' : ''}`, { 'aria-label': letter },
        el('div.wf-fish-in', { innerHTML: fishSvg(colour) }, label));
      const f = { node, label, letter, lane, p, colour };
      node.addEventListener('pointerdown', e => { e.preventDefault(); tap(f); });
      fishLayer.append(node);
      place(f);
      return f;
    }
    /** Make a fresh school: `count` fish spread over the lanes, carrying `letters`. */
    function school(keepLetters) {
      const letters = keepLetters ? fishes.map(f => f.letter) : null;
      fishes.forEach(f => f.node.remove());
      const count = Math.min(spec.fish, lanes.length * 2);
      const want = letters || lettersFor(count);
      const perLane = Math.ceil(count / lanes.length);
      const colours = shuffle(COLOURS);
      fishes = Array.from({ length: count }, (_, i) => {
        const lane = i % lanes.length, k = Math.floor(i / lanes.length);
        const p = (loop() / perLane) * k + Math.random() * loop() * 0.2 + lane * fishW * 0.6;
        return makeFish(want[i] || pick(distractors()), lane, p % loop(), colours[i % colours.length]);
      });
    }
    /** Letters that aren't the one we want and don't sound like it. */
    function distractors() {
      const need = new Set(goal.letters.slice(step));
      const pool = goal.kind === 'sound' ? SOUND_SETS[spec.set] : Object.keys(SOUNDS).filter(l => l !== 'x');
      return pool.filter(l => !need.has(l) && !need.has(ALIKE[l]));
    }
    /** Letters for a new school: what's still needed (in order), then others; shuffled. */
    function lettersFor(count) {
      const need = [...new Set(goal.letters.slice(step))].slice(0, Math.max(1, count - 1));
      const others = shuffle(distractors()).slice(0, count - need.length);
      return shuffle([...need, ...others]);
    }
    /** The next letter must always be swimming; swap one other fish for it if not. */
    function ensureNext() {
      if (step >= goal.letters.length) return;
      const next = goal.letters[step];
      for (const f of fishes) setLetter(f, f.letter);
      if (fishes.some(f => f.letter === next)) return;
      const f = pick(fishes);
      setLetter(f, next);
      play(f.label, 'wf-pop');
    }
    function setLetter(f, l) {
      f.letter = l;
      f.node.setAttribute('aria-label', l);
      if (f.label.textContent !== display(l)) f.label.textContent = display(l);
    }

    // ---------- the hook and line ----------
    function drawLine() {
      const tip = rodTip();
      if (!tween && !held) hookPos = { x: tip.x, y: skyH + 46 + Math.sin(performance.now() / 600) * 6 };
      const { x, y } = hookPos;
      const sag = Math.min(60, Math.abs(x - tip.x) * 0.25);
      linePath.setAttribute('d', `M${tip.x} ${tip.y} Q${(tip.x + x) / 2} ${Math.max(tip.y, y) - (y - tip.y) * 0.3 + sag} ${x} ${y}`);
      hook.style.transform = `translate(${x - hook.offsetWidth / 2}px, ${y - 4}px)`;
    }
    /** Move the hook to a point (a function, so it can follow the rod tip) over `ms`. */
    const moveHook = (to, ms) => new Promise(done => { tween = { from: { ...hookPos }, to, t0: performance.now(), ms, done }; });

    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      for (const f of fishes) {
        if (f.stop) continue;
        f.p = (f.p + speed * dt) % loop();
        place(f);
      }
      if (tween) {
        const k = Math.min(1, (t - tween.t0) / tween.ms), to = tween.to();
        hookPos = { x: tween.from.x + (to.x - tween.from.x) * ease(k), y: tween.from.y + (to.y - tween.from.y) * ease(k) };
        if (k >= 1) { const d = tween.done; tween = null; d(); }
      }
      if (held) held.node.style.transform = `translate(${hookPos.x - held.dx}px, ${hookPos.y - held.dy}px) rotate(${held.rot}deg)`;
      drawLine();
      if (!busy && goal && t > hintAt) hint();
    }
    function armHint() {
      hintAt = performance.now() + (rounds.wrapUp ? 2500 : HINT_MS);
    }

    // ---------- a goal: one letter sound, one word or one name ----------
    const soundOf = l => SOUNDS[l][0];
    const nameOf = l => NAMES[l];
    const spoken = l => (goal.kind === 'name' ? nameOf(l) : soundOf(l));

    function newGoal() {
      spec = LEVELS[rounds.level - 1];
      speed = W / spec.secs;
      missed = false;
      step = 0;
      let kind = spec.kind;
      // Name levels: her name first, a word, her sister's name, then words.
      if (kind === 'name') kind = done === 0 || (done === 2 && sister) ? 'name' : 'word';
      if (kind === 'sound') {
        const l = pick(SOUND_SETS[spec.set].filter(x => !recent.includes(x)));
        goal = { kind, letters: [l], tiles: [l], picture: SOUNDS[l][2], word: SOUNDS[l][1] };
      } else if (kind === 'word') {
        const [w, p] = pick(WORDS.filter(([x]) => !recent.includes(x)));
        goal = { kind, letters: [...w], tiles: [...w], picture: p, word: w };
      } else {
        const name = done === 0 ? profile.name : sister.name;
        goal = { kind, letters: [...name.toLowerCase()], tiles: [...name], picture: null, avatar: done === 0 ? profile : sister, word: name };
      }
      recent = [...recent.slice(-5), goal.kind === 'sound' ? goal.letters[0] : goal.word];
      renderCard();
      layout();
      school(false);
      play(card, 'wf-in');
      later(() => { prompt(true); busy = false; armHint(); }, 500);
    }

    function renderCard() {
      pic.replaceChildren(goal.avatar ? el('span.wf-avatar', { innerHTML: avatarSvg(goal.avatar.avatar) }) : pictureEl(goal.picture));
      const ghost = spec.ghost || goal.kind === 'name';
      slots.replaceChildren(...goal.tiles.map(t => el('span.wf-slot', { 'aria-label': t }, ghost ? el('span.wf-ghost', {}, t) : '')));
    }

    function prompt(first) {
      const l = goal.letters[step];
      if (goal.kind === 'sound') {
        say(`Catch the fish that says ${soundOf(l)}! ${soundOf(l)}, like ${goal.word}.`);
      } else if (goal.kind === 'word') {
        // With the letters showing, the voice sounds it all out; without, just the next sound.
        if (first) say(spec.ghost ? `Let's spell ${goal.word}! ${goal.letters.map(soundOf).join(', ')}.` : `Let's spell ${goal.word}!`);
        else say(spec.ghost ? `Now ${soundOf(l)}!` : `${goal.word}. What's next?`);
      } else {
        if (first) say(`Let's spell ${goal.word}! ${goal.letters.map(nameOf).join(', ')}.`);
        else say(`Now ${nameOf(l)}!`);
      }
    }

    function hint() {
      armHint();
      const l = goal.letters[step];
      fishes.filter(f => f.letter === l).forEach(f => play(f.node.firstChild, 'wf-hint'));
      say(goal.kind === 'sound' ? `${soundOf(l)}, like ${goal.word}!` : `Find ${spoken(l)}!`);
    }

    // ---------- tapping a fish ----------
    function tap(f) {
      if (busy || f === held?.fish) return;
      const want = goal.letters[step];
      if (f.letter !== want) {
        play(f.node.firstChild, 'wf-wobble');
        sound.hmm();
        say(`That's ${spoken(f.letter)}. Find ${spoken(want)}!`);
        if (!missed) { missed = true; streak = 0; rounds.miss(); }
        armHint();
        return;
      }
      reel(f);
    }

    async function reel(f) {
      busy = true;
      f.stop = true;
      const s = stage.getBoundingClientRect(), a = f.node.getBoundingClientRect();
      const left = lanes[f.lane].dir < 0;
      const mouth = { x: a.left - s.left + a.width * (left ? 0.1 : 0.9), y: a.top - s.top + a.height * 0.5 };
      // The boat glides over (as far as it can), and the hook drops to the fish's mouth.
      setBoat(Math.min(Math.max(mouth.x - boatW * 0.75, 4), boatMax));
      held = null;
      sound.whoosh();
      await moveHook(() => mouth, 520);
      sound.splash();
      // Lift the fish out of the water onto the line.
      const flyer = el(`div.wf-fish.wf-flyer${left ? '.left' : ''}`, {}, f.node.firstChild.cloneNode(true));
      flyer.style.width = a.width + 'px';
      fx.append(flyer);
      f.node.remove();
      fishes = fishes.filter(x => x !== f);
      held = { fish: f, node: flyer, dx: mouth.x - (a.left - s.left), dy: mouth.y - (a.top - s.top), rot: left ? 30 : -30 };
      flyer.style.transformOrigin = `${held.dx}px ${held.dy}px`;
      sparklesAt(fx, flyer, { n: 5, color: f.colour.fill });
      await moveHook(() => { const t = rodTip(); return { x: t.x, y: t.y + 40 }; }, 650);
      // Its letter flies to the card; the fish dives back in.
      const slot = slots.children[step];
      const from = held.node.querySelector('.wf-letter').getBoundingClientRect();
      held.node.remove();
      held = null;
      flyLetter(f.letter, from, slot);
      later(() => respawn(f), 700);
    }

    function flyLetter(letter, from, slot) {
      const s = stage.getBoundingClientRect(), to = slot.getBoundingClientRect();
      const t = el('span.wf-tile.wf-fly', {}, goal.tiles[step]);
      t.style.left = from.left - s.left + 'px';
      t.style.top = from.top - s.top + 'px';
      t.style.width = from.width + 'px';
      t.style.height = from.height + 'px';
      t.style.fontSize = from.height * 0.62 + 'px';
      fx.append(t);
      requestAnimationFrame(() => {
        t.style.transform = `translate(${to.left - from.left + (to.width - from.width) / 2}px, ${to.top - from.top + (to.height - from.height) / 2}px) scale(${to.width / from.width})`;
      });
      later(() => {
        t.remove();
        slot.replaceChildren(el('span.wf-tile', {}, goal.tiles[step]));
        play(slot, 'wf-land');
        sound.chime();
        step++;
        if (step >= goal.letters.length) { goalDone(); return; }
        say(spoken(letter));
        ensureNext();
        later(() => { prompt(false); busy = false; armHint(); }, 700);
      }, 520);
    }

    /** A new fish swims in from the edge of the lane the caught one was in. */
    function respawn(f) {
      if (!goal) return;
      if (fishes.length >= Math.min(spec.fish, lanes.length * 2)) return;
      const free = lanes.map((_, i) => i).filter(i => fishes.filter(x => x.lane === i).length < 2);
      if (!free.length) return;
      const lane = free.includes(f.lane) ? f.lane : pick(free);
      const nf = makeFish(pick(distractors()), lane, 0, f.colour);
      play(nf.node.firstChild, 'wf-arrive');
      fishes.push(nf);
      ensureNext();
    }

    // ---------- a finished goal: the picture jumps into the boat ----------
    function goalDone() {
      if (!missed) { streak++; rounds.correct(); rounds.record(streak); }
      done++;
      const tiles = [...slots.children];
      tiles.forEach((t, i) => later(() => play(t, 'wf-land'), i * 220));
      if (goal.kind === 'sound') say(`${soundOf(goal.letters[0])}! ${goal.word}!`);
      else if (goal.kind === 'word') say(`${goal.letters.map(soundOf).join(', ')}. ${goal.word}!`);
      else say(`${goal.letters.map(nameOf).join(', ')}. ${goal.word}!`);
      const wait = goal.letters.length * 420 + 900;
      later(() => jumpIntoBoat(), wait);
      later(() => {
        if (done >= GOALS || rounds.wrapUp) party();
        else newGoal();
      }, wait + 1200);
    }

    function jumpIntoBoat() {
      const a = pic.getBoundingClientRect();
      const item = el('span.wf-item', {}, pic.firstChild.cloneNode(true));
      item.style.left = CARGO[cargo.children.length % CARGO.length] * 100 + '%';
      cargo.append(item);
      const b = item.getBoundingClientRect();
      // Start where the card's picture is, then hop into place.
      item.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})`;
      void item.offsetWidth;
      item.classList.add('hop');
      item.style.transform = '';
      sound.boing();
      later(() => { sparklesAt(fx, item, { n: 6 }); play(boat, 'wf-bob'); sound.splash(); }, 650);
    }

    function party() {
      rounds.finishRound();
      goal = null;
      busy = true;
      fishes.forEach(f => f.node.classList.add('wf-away'));
      boat.classList.add('wf-dance');
      sound.cheer();
      confetti(fx, 30);
      say('Hooray! A boat full of words!');
      later(() => {
        fishes.forEach(f => f.node.remove());
        fishes = [];
        boat.classList.remove('wf-dance');
        cargo.replaceChildren();
        done = 0;
        streak = 0;
        rounds.startRound();
        newGoal();
      }, 3800);
    }

    // ---------- buttons ----------
    speaker.addEventListener('pointerdown', e => { e.preventDefault(); sound.pop(); if (goal) prompt(step === 0); });
    cat.addEventListener('pointerdown', e => { e.preventDefault(); sound.meow(700); play(boat, 'wf-bob'); if (goal) prompt(step === 0); });

    await new Promise(r => requestAnimationFrame(r));
    rounds.startRound();
    goal = { kind: 'sound', letters: ['a'], tiles: ['a'] };
    layout();
    hookPos = { x: rodTip().x, y: skyH + 46 };
    raf = requestAnimationFrame(frame);
    newGoal();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      timers.forEach(clearTimeout);
      return rounds.save();
    };
  },
};
