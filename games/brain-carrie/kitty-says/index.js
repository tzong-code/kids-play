// GAME-04a Kitty Says: four cats light up and meow in a sequence; Carrie taps them back in order.
// The sequence starts at 2 and grows by one after every success; a miss is a soft "hmm" and the
// same sequence again. The cats dance at 5, 8 and 12 in a row, and a round always ends on a win
// within about 90 seconds. Progress and best streak are kept by the shared round manager.

import { el, play } from '../../../js/ui.js';
import { say, sparklesAt, confetti, createRounds, loadProgress, starsFor, STAR_STEPS } from '../shared.js';
import { CATS, sittingCatSvg, stageSvg, pawSvg, starSvg, noteSvg } from './art.js';

const DANCE_AT = [5, 8, 12];
const STOP = Symbol('stop');

/** Stars for the home tile: one per best-streak milestone reached. */
async function badge(profile, storage) {
  const { best } = await loadProgress(storage, 'kitty-says');
  const n = starsFor(best);
  return el('span.tile-stars', { 'aria-label': `${n} stars` },
    STAR_STEPS.map((_, i) => el(`span.tile-star${i < n ? '.on' : ''}`, { innerHTML: starSvg() })));
}

export default {
  id: 'kitty-says',
  name: 'Kitty Says',
  icon: 'kittySays',
  ages: [4, 5, 6, 7, 8],
  badge,
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const rounds = await createRounds({ storage, game: 'kitty-says', maxLevel: 8 });
    let alive = true;
    const timers = new Set();
    const wait = ms => new Promise((res, rej) => {
      const t = setTimeout(() => { timers.delete(t); alive ? res() : rej(STOP); }, ms);
      timers.add(t);
    });

    // ---------- screen ----------
    const fx = el('div.ks-fx');
    const cats = CATS.map((c, i) => {
      const b = el('button.ks-cat', { 'aria-label': `${c.name} cat`, dataset: { i }, innerHTML: sittingCatSvg(c) });
      b.addEventListener('pointerdown', e => { e.preventDefault(); onTap(i); });
      return b;
    });
    const grid = el('div.ks-grid', {}, cats);
    const stage = el('div.ks-stage', { innerHTML: stageSvg() }, grid, fx);
    const dots = el('div.ks-dots');
    const stars = el('div.ks-stars');
    const screen = el(`div.st-game.ks-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Kitty Says') : el('span')),
      el('div.st-board', {}, stage),
      el('div.st-tray.ks-tray', {}, dots, stars));
    container.append(screen);

    const renderDots = (n, filled) => dots.replaceChildren(...Array.from({ length: n }, (_, i) =>
      el(`span.ks-paw${i < filled ? '.on' : ''}`, { innerHTML: pawSvg() })));
    const renderStars = () => {
      const n = starsFor(rounds.best);
      stars.replaceChildren(...STAR_STEPS.map((_, i) => el(`span.ks-star${i < n ? '.on' : ''}`, { innerHTML: starSvg() })));
    };

    // ---------- cats ----------
    function note(i) {
      const n = el('span.ks-note', { innerHTML: noteSvg(CATS[i].fur) });
      const a = stage.getBoundingClientRect(), b = cats[i].getBoundingClientRect();
      n.style.left = b.left - a.left + b.width * 0.7 + 'px';
      n.style.top = b.top - a.top + b.height * 0.15 + 'px';
      fx.append(n);
      setTimeout(() => n.remove(), 1100);
    }
    /** Light a cat: glow, bounce, open mouth and meow its note. */
    function light(i, ms = 420) {
      const c = cats[i];
      c.classList.remove('lit');
      void c.offsetWidth;
      c.classList.add('lit', 'meow');
      sound.meow(CATS[i].note);
      note(i);
      const t = setTimeout(() => { timers.delete(t); c.classList.remove('lit', 'meow'); }, ms);
      timers.add(t);
    }

    // ---------- the game ----------
    let seq = [], pos = 0, phase = 'busy', watchedOnce = false;
    const pick = () => Math.floor(Math.random() * 4);
    const gap = () => Math.max(380, 720 - (rounds.level - 1) * 45);   // faster as she levels up

    async function newRound() {
      rounds.startRound();
      seq = Array.from({ length: rounds.level + 1 }, pick);
      watchedOnce = false;
      renderStars();
      await wait(700);
      await playSeq();
    }

    async function playSeq(again = false) {
      phase = 'watch';
      pos = 0;
      renderDots(seq.length, 0);
      if (!watchedOnce || again) say(again ? 'Watch again' : 'Watch!');
      watchedOnce = true;
      await wait(900);
      for (const i of seq) {
        light(i, gap() * 0.75);
        await wait(gap());
      }
      phase = 'turn';
      say('Your turn!');
    }

    async function onTap(i) {
      if (phase !== 'turn') { sound.tap(); play(cats[i], 'ks-squish'); return; }
      light(i, 320);
      cats[i].classList.add('glow');
      setTimeout(() => cats[i].classList.remove('glow'), 360);
      if (i !== seq[pos]) return run(miss(i));
      pos++;
      renderDots(seq.length, pos);
      if (pos === seq.length) run(success());
    }

    async function success() {
      phase = 'busy';
      rounds.correct();
      const newBest = rounds.record(seq.length);
      renderStars();
      await wait(450);
      sound.chime();
      cats.forEach(c => play(c, 'ks-hop'));
      sparklesAt(fx, grid, { n: 6, spread: 260 });
      if (rounds.wrapUp || seq.length >= 16) return endRound();
      if (DANCE_AT.includes(seq.length)) {
        await dance(newBest ? 'Wow, a new record!' : 'Amazing!');
      } else {
        say(['Yes!', 'Good job!', 'You did it!'][Math.floor(Math.random() * 3)]);
        await wait(900);
      }
      seq.push(pick());
      await playSeq();
    }

    async function miss(i) {
      phase = 'busy';
      sound.hmm();
      play(cats[i], 'ks-wobble');
      grid.classList.add('ks-no');
      await wait(700);
      grid.classList.remove('ks-no');
      const lower = rounds.miss() === 'down';
      if (rounds.wrapUp) seq = [pick(), pick()];              // make sure the round ends on a win soon
      else if (lower && seq.length > 2) seq.pop();
      await wait(500);
      await playSeq(true);
    }

    async function dance(words) {
      say(words);
      sound.jingle();
      grid.classList.add('ks-dance');
      confetti(fx, 24);
      await wait(2600);
      grid.classList.remove('ks-dance');
    }

    async function endRound() {
      rounds.finishRound();
      await dance('Hooray! Well done!');
      sound.tada();
      await wait(800);
      await newRound();
    }

    const run = p => p.catch(err => { if (err !== STOP) console.error(err); });
    renderDots(0, 0);
    run(newRound());

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      return rounds.save();
    };
  },
};
