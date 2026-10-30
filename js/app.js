// App shell: profile picker, each girl's home, the parent gate and parent settings.
// Games come from the registry and are mounted into #app with the active profile.

import { PROFILES, PROFILE_ORDER } from './profiles.js';
import { GAMES } from './registry.js';
import { el, play, holdToActivate, armedButton } from './ui.js';
import { sound, speak, unlock } from './sound.js';
import * as storage from './storage.js';
import { avatarSvg, catFull, mermaidFull, icon, TILE_ART, SCENES, cloudSvg, sparkleSvg, fishSvg, sleepingCatSvg } from './art.js';
import * as playtime from './playtime.js';
import { hardGate } from './gate.js';

export const VERSION = '1.3.0';

const FULL_ART = { cat: catFull, 'mermaid-girl': mermaidFull };

const root = document.getElementById('app');
let cleanup = null;
let current = null;   // active profile

// ---------- screen switching ----------

let switching = Promise.resolve();

/** Swap screens one at a time, so a double tap can't mount two screens at once. */
function show(render) {
  switching = switching.then(async () => {
    const prev = cleanup;
    cleanup = null;
    if (prev) await prev();
    root.replaceChildren();
    cleanup = (await render(root)) || null;
  }).catch(err => console.error(err));
  return switching;
}

function setTheme(theme) {
  document.body.dataset.theme = theme || 'picker';
}

/** What every game receives alongside its container and profile. */
function appContext(profile) {
  return {
    profile,
    sound,
    speak,
    storage,
    home: () => openHome(profile),
    open: (id, params) => openGame(id, params),
    /** The avatar in the top-left corner: hold it two seconds to leave this profile. */
    exitButton: (extraClass = '') => {
      const b = el('button.avatar-btn' + extraClass, { 'aria-label': 'Hold to switch child' }, el('span.avatar-art', { innerHTML: avatarSvg(profile.avatar) }));
      holdToActivate(b, () => openPicker());
      return b;
    },
    /** Round toy button back to her home screen. */
    homeButton: () => el('button.tool.gloss', {
      'aria-label': 'Home',
      dataset: { tool: 'home' },
      onclick: () => { sound.tap(); openHome(profile); },
    }, el('span.tool-icon', { innerHTML: icon('home') })),
    label: text => (profile.showText ? text : ''),
  };
}

// ---------- profile picker ----------

function openPicker() {
  current = null;
  playtime.leave();
  setTheme(null);
  return show(async r => {
    const last = localStorage.getItem('lastProfile');
    const asleep = new Set();
    for (const id of PROFILE_ORDER) if (await playtime.isLocked(id)) asleep.add(id);
    const cards = PROFILE_ORDER.map(id => {
      const p = PROFILES[id];
      const card = el(`button.profile-card.theme-${p.theme}`, {
        onclick: () => {
          unlock();
          sound.chirp();
          speak(`Hi ${p.name}!`);
          play(card, 'bounce');
          setTimeout(() => enterProfile(p), 250);
        },
      },
      el('span.card-top', {}, el('span'), el('span'), el('span')),
      ...['tl', 'tr', 'bl', 'br'].map(c => el(`span.rivet.${c}`)),
      el('span.card-art', { innerHTML: (FULL_ART[p.avatar] || (() => avatarSvg(p.avatar)))() }),
      el('span.name-plate', {}, el('span.card-name', {}, p.name), el('span.card-age', {}, `age ${p.age}`)));
      if (id === last) card.classList.add('last');
      if (asleep.has(id)) card.append(el('span.card-asleep', { 'aria-label': 'Play time is over', innerHTML: icon('moon') }));
      return card;
    });
    const gear = el('button.parent-corner', { 'aria-label': 'Grown-ups: hold for two seconds', innerHTML: icon('gear') });
    holdToActivate(gear, () => openGate());
    r.append(el('div.picker', {},
      gear,
      el('h1.picker-title', {}, 'Who is playing?'),
      el('div.picker-cards', {}, cards)));
  });
}

async function enterProfile(p) {
  try { localStorage.setItem('lastProfile', p.id); } catch {}
  if (await playtime.enter(p) === 'locked') openLock(p);
  else openHome(p);
}

// ---------- play time over ----------

/** Full-screen lock: a sleeping kitten; only the hard maths gate gets past it. */
function openLock(profile) {
  current = null;
  playtime.leave();
  setTheme(profile.theme);
  return show(r => {
    const panel = el('div.lock-panel');
    const restScreen = () => {
      sound.lullaby();
      panel.replaceChildren(
        el('div.lock-art', { innerHTML: sleepingCatSvg() }),
        el('h1.lock-title', {}, 'Play time is over.'),
        el('p.lock-sub', {}, 'Ask Mummy or Daddy.'),
        el('button.text-btn.lock-parent', { onclick: gateScreen }, 'Grown-ups'));
    };
    const gateScreen = () => {
      panel.replaceChildren(hardGate(choiceScreen), el('button.text-btn', { onclick: restScreen }, 'Back'));
    };
    const choiceScreen = async () => {
      const [limit, st] = await Promise.all([playtime.limitFor(profile.id), playtime.status(profile.id)]);
      panel.replaceChildren(el('div.gate-box', {},
        el('h2', {}, `Unlocked for ${profile.name}`),
        st.capReached ? el('p.muted', {}, `${profile.name} has used today's blocks.`) : null,
        el('div.lock-choices', {},
          st.capReached ? null : el('button.text-btn.primary', {
            onclick: async () => { if (await playtime.unlockNewBlock(profile)) enterProfile(profile); else choiceScreen(); },
          }, `New ${limit}-minute block`),
          el('button.text-btn', { onclick: async () => { await playtime.doneForToday(profile); openPicker(); } }, 'Done for today'))));
    };
    restScreen();
    r.append(el('div.lock', {}, panel));
  });
}

// ---------- a girl's home ----------

function openHome(profile) {
  current = profile;
  setTheme(profile.theme);
  const app = appContext(profile);
  return show(r => {
    const tiles = GAMES.filter(g => g.ages.includes(profile.age)).map(g => {
      const tile = el('button.home-tile', {
        onclick: () => {
          unlock();
          sound.pop();
          if (!profile.showText) speak(g.name);
          play(tile, 'bounce');
          setTimeout(() => openGame(g.id), 180);
        },
      }, tileArt(g.icon), profile.showText ? el('span.tile-label', {}, g.name) : null);
      g.badge?.(profile, storage).then(b => b && tile.append(b)).catch(() => {});
      return tile;
    });
    r.append(el('div.home', {},
      sceneBits(profile.theme),
      el('div.scene', { 'aria-hidden': 'true', innerHTML: SCENES[profile.theme]() }),
      el('div.home-top', {}, app.exitButton(),
        profile.showText ? el('h1.home-hello', {}, `Hi ${profile.name}!`) : null),
      el('div.home-tiles', {}, tiles)));
  });
}

/** A drawn tile picture, or the plain icon for games that don't have art yet. */
function tileArt(key) {
  return TILE_ART[key] ? el('span.tile-art', { innerHTML: TILE_ART[key]() }) : el('span.tile-art', { style: { fontSize: '96px', textAlign: 'center' } }, key);
}

/** Moving bits behind the tiles: drifting clouds and sparkles, or bubbles and fish. */
function sceneBits(theme) {
  const bits = el('div.scene-bits', { 'aria-hidden': 'true' });
  if (theme === 'princess') {
    bits.append(el('div.cloud.c1', { innerHTML: cloudSvg() }), el('div.cloud.c2', { innerHTML: cloudSvg() }));
    for (const [x, y, d] of [[16, 30, 0], [78, 18, 0.8], [88, 42, 1.6], [30, 12, 2.2], [62, 34, 1.2]]) {
      bits.append(el('div.twinkle', { innerHTML: sparkleSvg('#fff'), style: { left: x + '%', top: y + '%', animationDelay: `-${d}s` } }));
    }
  } else {
    bits.append(el('div.light-rays'));
    for (const [x, size, dur, delay] of [[8, 22, 9, 0], [22, 16, 12, 4], [70, 26, 10, 2], [86, 18, 13, 7], [52, 14, 11, 5]]) {
      bits.append(el('div.bubble', { style: { left: x + '%', width: size + 'px', height: size + 'px', animationDuration: dur + 's', animationDelay: `-${delay}s` } }));
    }
    bits.append(el('div.swimmer', { innerHTML: fishSvg(), style: { top: '20%', animationDuration: '26s' } }));
    bits.append(el('div.swimmer', { innerHTML: fishSvg('#FF8FB8', '#B78CFF'), style: { top: '52%', width: '80px', animationDuration: '34s', animationDelay: '-15s' } }));
  }
  return bits;
}

function openGame(id, params = {}) {
  const game = GAMES.find(g => g.id === id);
  if (!game || !current) return openHome(current);
  const profile = current;
  return show(async r => {
    const box = el('div.game', { dataset: { game: id } });
    r.append(box);
    const startedAt = Date.now();
    const done = await game.mount(box, profile, appContext(profile), params);
    return async () => {
      playtime.logGame(profile.id, id, Date.now() - startedAt);
      if (done) await done();
    };
  });
}

// ---------- parent gate and settings ----------

/** "Kitty Says 6 min · Gigi 3 min": today's minutes per game, most played first. */
function gameLog(games) {
  const rows = Object.entries(games || {}).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1])
    .map(([id, m]) => `${GAMES.find(g => g.id === id)?.name || id} ${m} min`);
  return rows.length ? el('p.play-log', {}, `By game: ${rows.join(' · ')}`) : null;
}

function openGate() {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  let entry = '';
  return show(r => {
    const display = el('div.gate-entry', {}, '?');
    const pad = el('div.gate-pad', {},
      [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k => el('button.gate-key', {
        onclick: () => {
          if (k === '⌫') entry = entry.slice(0, -1);
          else if (k === '✓') {
            if (Number(entry) === a + b) return openSettings();
            entry = '';
            play(display, 'wiggle');
          } else if (entry.length < 2) entry += k;
          display.textContent = entry || '?';
        },
      }, String(k))));
    r.append(el('div.gate', {},
      el('h1', {}, 'Grown-ups only'),
      el('p.gate-q', {}, `${a} + ${b} =`),
      display, pad,
      el('button.text-btn', { onclick: () => openPicker() }, 'Back')));
  });
}

async function openSettings() {
  setTheme(null);
  const used = await storage.usage();
  return show(async r => {
    const sections = [];
    for (const id of PROFILE_ORDER) {
      const p = PROFILES[id];
      const count = (await storage.listDrawings(id)).length;
      const avatars = el('div.avatar-choices', {}, p.avatars.map(a => {
        const b = el('button.avatar-choice', {
          onclick: async () => {
            p.avatar = a;
            await storage.setSetting(`avatar:${id}`, a);
            avatars.querySelectorAll('.selected').forEach(n => n.classList.remove('selected'));
            b.classList.add('selected');
          },
        }, el('span.avatar-art', { innerHTML: avatarSvg(a) }));
        if (a === p.avatar) b.classList.add('selected');
        return b;
      }));
      const countLabel = el('span', {}, `${count} drawing${count === 1 ? '' : 's'} saved`);
      const [limit, cap, st] = await Promise.all([playtime.limitFor(id), playtime.capFor(id), playtime.status(id)]);
      const chips = (values, selected, label, onPick) => {
        const row = el('div.chip-row', {}, values.map(v => {
          const b = el('button.choice-chip', {
            onclick: async () => {
              await onPick(v);
              row.querySelectorAll('.selected').forEach(n => n.classList.remove('selected'));
              b.classList.add('selected');
            },
          }, label(v));
          if (v === selected) b.classList.add('selected');
          return b;
        }));
        return row;
      };
      const playNow = st.locked ? 'Play time is over (locked until a grown-up unlocks it)'
        : st.minutesLeft ? `${st.minutesLeft} min left in the current block` : 'No block running';
      const playTime = el('div.play-settings', {},
        el('p.muted', {}, 'Play time per block'),
        chips(playtime.LIMIT_CHOICES, limit, v => `${v} min`, v => playtime.setLimit(id, v)),
        el('p.muted', {}, 'Blocks per day'),
        chips(playtime.CAP_CHOICES, cap, v => (v ? String(v) : 'No limit'), v => playtime.setCap(id, v)),
        el('p.play-log', {}, `Today: ${st.blocksToday} block${st.blocksToday === 1 ? '' : 's'} started, ${st.minutesToday} min played. ${playNow}.`),
        gameLog(st.games));
      sections.push(el(`section.settings-card.theme-${p.theme}`, {},
        el('h2', {}, `${p.name} · age ${p.age}`),
        el('p.muted', {}, 'Mascot'),
        avatars,
        playTime,
        el('div.settings-row', {}, countLabel,
          armedButton('button.text-btn.danger', `Delete all of ${p.name}'s drawings`, 'Tap again to delete them all', async () => {
            await storage.deleteAllDrawings(id);
            countLabel.textContent = '0 drawings saved';
          }))));
    }
    r.append(el('div.settings', {},
      el('div.settings-head', {},
        el('h1', {}, 'Grown-ups'),
        el('button.text-btn.primary', { onclick: () => openPicker() }, 'Done')),
      sections,
      el('section.settings-card', {},
        el('h2', {}, 'Tips'),
        el('ul.tips', {},
          el('li', {}, 'Leave a child’s world: hold her mascot in the top-left corner for two seconds.'),
          el('li', {}, 'Play time: when a block runs out the screen locks. Tap Grown-ups and answer three maths questions to unlock. Changes to block length apply from the next block.'),
          el('li', {}, 'Save Covey’s drawings to Photos: in her gallery, hold a picture for two seconds.'),
          el('li', {}, 'Lock the iPad to this app with Settings › Accessibility › Guided Access, then triple-click the side button.'),
          el('li', {}, 'Updates: open the app once on Wi-Fi after a new version is published, then close and reopen it.'))),
      el('p.muted.center', {}, `Version ${VERSION}` + (used != null ? ` · ${(used / 1e6).toFixed(1)} MB stored on this device` : ''))));
  });
}

// ---------- boot ----------

async function boot() {
  // iOS: stop pinch-zoom and double-tap zoom on the whole app.
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('pointerdown', unlock, { once: true });

  storage.persist();
  for (const id of PROFILE_ORDER) {
    const saved = await storage.getSetting(`avatar:${id}`).catch(() => null);
    if (PROFILES[id].avatars.includes(saved)) PROFILES[id].avatar = saved;   // ignores old emoji choices
  }
  playtime.setLockHandler(p => openLock(p));
  openPicker();

  // While developing, set localStorage.noServiceWorker = 1 to always load fresh files.
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !localStorage.getItem('noServiceWorker')) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed', err));
  }
}

boot();
