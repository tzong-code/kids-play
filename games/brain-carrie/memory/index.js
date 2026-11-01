// GAME-04d Sticker Memory: classic pairs, made from her own drawings and the stickers she has put
// in the dollhouse and sticker scenes (topped up from the princess and cat sticker sets). Cards
// turn over in 3D; a pair wiggles, sparkles and stays face up. The table grows 3×2 → 4×3 → 4×4.
// Two players: Carrie and Covey or a grown-up take turns, a little cat walks to whoever's turn it
// is, and a pair earns another go.

import { el, play } from '../../../js/ui.js';
import { avatarSvg, stickerUrl, STICKERS } from '../../../js/art.js';
import { STICKER_SETS } from '../../../assets/art/stickers.js';
import { PROFILES } from '../../../js/profiles.js';
import { ROOMS } from '../../dollhouse/rooms.js';
import { say, sparklesAt, confetti, createRounds, starBadge } from '../shared.js';
import { pawSvg } from '../kitty-says/art.js';
import { marcherSvg } from '../parade/art.js';
import { cardBackSvg, playersSvg } from './art.js';

const GRIDS = [[3, 2], [4, 3], [4, 4]];     // columns × rows, by level (turned round in portrait)
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

/** Up to `n` different card faces: her drawings first (at most half), then her stickers, then defaults. */
async function gatherFaces(profile, storage, n, urls) {
  const faces = [];
  const drawings = shuffle((await storage.listDrawings(profile.id).catch(() => [])).slice(0, 12)).slice(0, Math.floor(n / 2));
  for (const d of drawings) {
    const src = URL.createObjectURL(d.thumb);
    urls.push(src);
    faces.push({ key: 'd:' + d.id, src, word: 'your picture', drawing: true });
  }
  // Scenes are saved by js/stickers.js under `stickers:<scene key>` as [{ id, x, y }].
  const keys = [`scene:${profile.id}`, ...Object.keys(ROOMS).map(r => `house:${profile.id}:${r}`)];
  const placed = (await Promise.all(keys.map(k => storage.getSetting(`stickers:${k}`).catch(() => null)))).flat().filter(Boolean).map(s => s.id);
  const defaults = [...STICKER_SETS[profile.theme] || STICKER_SETS.princess, ...Object.keys(STICKERS).filter(id => id.startsWith('cat-'))];
  const ids = [...new Set([...shuffle([...new Set(placed)]), ...shuffle(defaults)])].filter(id => STICKERS[id]);
  for (const id of ids) {
    if (faces.length >= n) break;
    faces.push({ key: 's:' + id, src: stickerUrl(id), word: STICKERS[id].label || id });
  }
  return faces;
}

export default {
  id: 'memory',
  name: 'Sticker Memory',
  icon: 'memory',
  ages: [4, 5, 6, 7, 8],
  badge: starBadge('memory'),
  async mount(container, profile, app) {
    const { sound, storage } = app;
    const rounds = await createRounds({ storage, game: 'memory', maxLevel: GRIDS.length });
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const urls = [];

    // ---------- players ----------
    const other = Object.values(PROFILES).find(p => p.id !== profile.id);
    const SECONDS = [
      ...(other ? [{ name: other.name, face: avatarSvg(other.avatar) }] : []),
      { name: 'Grown-up', face: pawSvg() },
    ];
    const players = [{ name: profile.name, face: avatarSvg(profile.avatar) }, { ...SECONDS[0] }];
    let two = false, second = 0, turn = 0;

    // ---------- screen ----------
    const grid = el('div.sm-grid');
    const fx = el('div.sm-fx');
    const table = el('div.sm-table', {}, grid, fx);
    const pads = players.map((p, i) => {
      const face = el('button.sm-face', { 'aria-label': p.name, innerHTML: p.face });
      const won = el('div.sm-won');
      const pad = el(`div.sm-pad.p${i}`, {}, face, won);
      return { pad, face, won };
    });
    pads[1].face.addEventListener('pointerdown', e => {
      e.preventDefault();
      // Choose who plays against her: her sister or a grown-up.
      second = (second + 1) % SECONDS.length;
      Object.assign(players[1], SECONDS[second]);
      pads[1].face.innerHTML = players[1].face;
      pads[1].face.setAttribute('aria-label', players[1].name);
      sound.pop();
      say(players[1].name);
    });
    pads[0].face.addEventListener('pointerdown', e => { e.preventDefault(); sound.pop(); say(players[0].name); });
    const marker = el('div.sm-marker', { innerHTML: marcherSvg({ fur: '#FFFFFF', dark: '#E3DCEF' }, { hat: 'crown' }) });
    const toggle = el('button.sm-toggle', { 'aria-label': 'One or two players', innerHTML: playersSvg(false) });
    toggle.addEventListener('pointerdown', e => {
      e.preventDefault();
      two = !two;
      toggle.innerHTML = playersSvg(two);
      sound.pop();
      say(two ? 'Two players!' : 'Just me!');
      deal();
    });
    const tray = el('div.st-tray.sm-tray', {}, pads[0].pad, marker, pads[1].pad, toggle);
    const screen = el(`div.st-game.sm-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Sticker Memory') : el('span')),
      el('div.st-board', {}, table),
      tray);
    container.append(screen);

    // ---------- the table: cards sized to fit ----------
    let cols = 3, rows = 2;
    function layout() {
      const r = table.getBoundingClientRect();
      const [c, w] = GRIDS[Math.min(rounds.level, GRIDS.length) - 1];
      [cols, rows] = r.height > r.width * 1.1 ? [w, c] : [c, w];
      const gap = Math.min(18, r.width * 0.025);
      const size = Math.min((r.width * 0.94 - gap * (cols - 1)) / cols, (r.height * 0.95 - gap * (rows - 1)) / rows, 190);
      grid.style.setProperty('--card', size + 'px');
      grid.style.setProperty('--gap', gap + 'px');
      grid.style.gridTemplateColumns = `repeat(${cols}, var(--card))`;
      if (two) showTurn(false);
    }
    const ro = new ResizeObserver(layout);
    ro.observe(table);

    // ---------- a game ----------
    let cards = [], first = null, lock = false, misses = 0, streak = 0, dealt = 0;

    async function deal() {
      const id = ++dealt;
      rounds.startRound();
      lock = true;
      first = null;
      misses = 0;
      turn = 0;
      layout();
      const pairs = (cols * rows) / 2;
      const faces = await gatherFaces(profile, storage, pairs, urls);
      if (id !== dealt) return;             // dealt again while we were fetching
      const deck = shuffle([...faces, ...faces]);
      cards = deck.map(f => {
        const node = el('button.sm-card', { 'aria-label': 'card' },
          el('div.sm-inner', {}, el('div.sm-back', { innerHTML: cardBackSvg() }),
            el(`div.sm-front${f.drawing ? '.drawing' : ''}`, {}, el('img', { src: f.src, alt: '', draggable: false }))));
        const card = { f, node, up: false, done: false };
        node.addEventListener('pointerdown', e => { e.preventDefault(); flip(card); });
        return card;
      });
      grid.replaceChildren(...cards.map(c => c.node));
      cards.forEach((c, i) => { c.node.style.animationDelay = i * 40 + 'ms'; c.node.classList.add('sm-deal'); });
      tray.classList.toggle('two', two);
      pads.forEach(p => p.won.replaceChildren());
      showTurn(false);
      sound.whoosh();
      later(() => { lock = false; say(two ? `${players[0].name} first!` : 'Find the pairs!'); }, 700);
    }

    function flip(card) {
      if (lock || card.up || card.done) { if (card.done) play(card.node, 'wiggle'); return; }
      card.up = true;
      card.node.classList.add('up');
      sound.flip();
      if (!first) {
        first = card;
        // Near the end of a long game, its partner gives a little shimmer to help.
        if (!two && rounds.wrapUp) {
          const mate = cards.find(c => c !== card && c.f.key === card.f.key);
          later(() => play(mate.node, 'sm-hint'), 500);
        }
        return;
      }
      const a = first;
      first = null;
      lock = true;
      if (a.f.key === card.f.key) later(() => match(a, card), 450);
      else later(() => noMatch(a, card), 1100);
    }

    function match(a, b) {
      for (const c of [a, b]) { c.done = true; c.node.classList.add('matched'); play(c.node, 'wiggle'); sparklesAt(fx, c.node, { n: 6 }); }
      sound.chime();
      say(`${a.f.word}!`);
      // The pair goes on the winner's pile; a pair earns another go.
      const mini = el('span.sm-mini', {}, el('img', { src: a.f.src, alt: '' }));
      pads[turn].won.append(mini);
      if (!two) rounds.record(++streak);
      lock = false;
      if (cards.every(c => c.done)) later(finish, 700);
      else if (two) later(() => say(['Go again!', 'Another go!'][Math.floor(Math.random() * 2)]), 900);
    }

    function noMatch(a, b) {
      for (const c of [a, b]) { c.up = false; c.node.classList.remove('up'); }
      sound.flip();
      misses++;
      streak = 0;
      if (two) { turn = 1 - turn; showTurn(true); }
      lock = false;
    }

    function showTurn(speak) {
      tray.dataset.turn = turn;
      // The little cat walks over to whoever's turn it is.
      const f = pads[turn].face, x = f.offsetLeft + f.offsetWidth / 2 - marker.offsetWidth / 2;
      const was = parseFloat(marker.dataset.x || x);
      marker.dataset.x = x;
      marker.classList.toggle('left', x < was);
      marker.style.transform = `translateX(${x}px)`;
      if (x !== was) { marker.classList.add('walking'); later(() => marker.classList.remove('walking'), 800); }
      if (speak) { sound.tick(); later(() => say(`${players[turn].name}'s turn!`), 300); }
    }

    function finish() {
      const pairs = cards.length / 2;
      if (!two) {
        // A table cleared with few misses counts as right, one with a great many as a miss.
        if (misses <= pairs) rounds.correct();
        else if (misses >= pairs * 3) rounds.miss();
      }
      rounds.finishRound();
      grid.classList.add('sm-dance');
      sound.cheer();
      confetti(fx, 30);
      const [n0, n1] = pads.map(p => p.won.children.length);
      say(!two ? 'You found them all!' : n0 === n1 ? "It's a tie! Hooray!" : `Hooray for ${players[n0 > n1 ? 0 : 1].name}!`);
      if (two && n0 !== n1) play(pads[n0 > n1 ? 0 : 1].face, 'sm-cheer');
      later(() => { grid.classList.remove('sm-dance'); deal(); }, 3600);
    }

    await new Promise(r => requestAnimationFrame(r));
    deal();

    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
      urls.forEach(u => URL.revokeObjectURL(u));
      return rounds.save();
    };
  },
};
