// App shell: profile picker, each girl's home, the parent gate and parent settings.
// Games come from the registry and are mounted into #app with the active profile.

import { PROFILES, PROFILE_ORDER } from './profiles.js';
import { GAMES } from './registry.js';
import { el, play, holdToActivate, armedButton } from './ui.js';
import { sound, speak, unlock } from './sound.js';
import * as storage from './storage.js';

export const VERSION = '1.0.0';

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
      const b = el('button.avatar-btn' + extraClass, { 'aria-label': 'Hold to switch child' }, el('span.avatar-face', {}, profile.avatar));
      holdToActivate(b, () => openPicker());
      return b;
    },
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
      el('span.card-avatar', {}, p.avatar),
      el('span.card-name', {}, p.name),
      el('span.card-age', {}, `age ${p.age}`));
      if (id === last) card.classList.add('last');
      return card;
    });
    const gear = el('button.parent-corner', { 'aria-label': 'Grown-ups: hold for two seconds' }, '⚙️');
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
      }, el('span.tile-icon', {}, g.icon), profile.showText ? el('span.tile-label', {}, g.name) : null);
      return tile;
    });
    r.append(el('div.home', {},
      el('div.home-top', {}, app.exitButton(),
        profile.showText ? el('h1.home-hello', {}, `Hi ${profile.name}!`) : null),
      el('div.home-tiles', {}, tiles),
      el('div.home-scene', { 'aria-hidden': 'true' })));
  });
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
        }, a);
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
    if (saved) PROFILES[id].avatar = saved;
  }
  openPicker();

  // While developing, set localStorage.noServiceWorker = 1 to always load fresh files.
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !localStorage.getItem('noServiceWorker')) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed', err));
  }
}

boot();
