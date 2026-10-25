// App shell: profile picker, each girl's home, the parent gate and parent settings.
// Games come from the registry and are mounted into #app with the active profile.

import { PROFILES, PROFILE_ORDER } from './profiles.js';
import { GAMES } from './registry.js';
import { el, play, holdToActivate, armedButton } from './ui.js';
import { sound, speak, unlock } from './sound.js';
import * as storage from './storage.js';
import { avatarSvg, catFull, mermaidFull, icon, TILE_ART, SCENES, cloudSvg, sparkleSvg, fishSvg } from './art.js';

export const VERSION = '1.1.0';

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
  setTheme(null);
  return show(r => {
    const last = localStorage.getItem('lastProfile');
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

function enterProfile(p) {
  try { localStorage.setItem('lastProfile', p.id); } catch {}
  openHome(p);
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
  return show(r => {
    const box = el('div.game', { dataset: { game: id } });
    r.append(box);
    return game.mount(box, profile, appContext(profile), params);
  });
}

// ---------- parent gate and settings ----------

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
      sections.push(el(`section.settings-card.theme-${p.theme}`, {},
        el('h2', {}, `${p.name} · age ${p.age}`),
        el('p.muted', {}, 'Mascot'),
        avatars,
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
  openPicker();

  // While developing, set localStorage.noServiceWorker = 1 to always load fresh files.
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !localStorage.getItem('noServiceWorker')) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed', err));
  }
}

boot();
