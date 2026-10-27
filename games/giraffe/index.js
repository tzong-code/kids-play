// GAME-03 Gigi the Giraffe: a virtual-pet toy. Gigi stands on the savanna, breathing, blinking and
// swishing her tail; taps make her giggle, sneeze (nose) or laugh (tummy). Six picture buttons
// along the bottom will play her action scenes. Layout follows the Superdesign "Gigi savanna" draft.

import { el, play } from '../../js/ui.js';
import { stickerUrl, sparkleSvg } from '../../js/art.js';
import { gigiSvg, savannaSvg, ACTION_ART, GIRAFFE_NAME } from './giraffe.js';
import { startIdle } from './idle.js';
import { createScene, SCENES, CANCEL } from './scenes.js';
import { partyHatSvgGroup } from './props.js';

/** The six action buttons, in tray order. `art` is a drawn icon or a sticker id. */
const ACTIONS = [
  { id: 'drink', label: 'Drink', art: () => ACTION_ART.drink() },
  { id: 'shower', label: 'Shower', sticker: 'shower' },
  { id: 'walk', label: 'Walk', art: () => ACTION_ART.walk() },
  { id: 'doctor', label: 'Doctor', art: () => ACTION_ART.doctor() },
  { id: 'birthday', label: 'Birthday', sticker: 'birthday-cake' },
  { id: 'balloon', label: 'Balloon', sticker: 'balloon' },
];

export default {
  id: 'giraffe',
  name: GIRAFFE_NAME,
  icon: 'giraffe',
  ages: [2, 3, 4, 5, 6, 7, 8],
  async mount(container, profile, app) {
    const { sound, speak, storage } = app;
    const key = `giraffe:${profile.id}`;
    const saved = (await storage.getSetting(key).catch(() => null)) || { name: GIRAFFE_NAME, counts: {} };
    saved.counts ||= {};
    const save = () => storage.setSetting(key, saved).catch(() => {});
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stage = el('div.gg-stage', { innerHTML: savannaSvg() });
    const gigiBox = el('div.gg-gigi', { innerHTML: gigiSvg() });
    const behind = el('div.gg-behind');
    const fx = el('div.gg-fx');
    stage.append(behind, gigiBox, fx);
    const svg = gigiBox.querySelector('svg');
    const savanna = stage.querySelector(':scope > svg');

    // The party hat stays on after a birthday until her next shower.
    function setHat(on, drop = false) {
      const old = svg.querySelector('#hat');
      if (!on) {
        if (old) old.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-40px)' }], { duration: 300 }).finished.then(() => old.remove(), () => old.remove());
        saved.hat = false;
      } else if (!old) {
        const head = svg.querySelector('#head');
        head.insertAdjacentHTML('beforeend', partyHatSvgGroup());
        if (drop) svg.querySelector('#hat').animate([{ transform: 'translateY(-260px)' }, { transform: 'translateY(0)', offset: 0.7 }, { transform: 'translateY(-18px)', offset: 0.85 }, { transform: 'translateY(0)' }],
          { duration: 900, easing: 'ease-in' });
        saved.hat = true;
      }
      save();
    }
    if (saved.hat) setHat(true);

    const chips = ACTIONS.map(a => {
      const chip = el('button.st-chip.gg-chip', {
        'aria-label': a.label,
        dataset: { action: a.id },
        onclick: () => runAction(a, chip),
      }, a.sticker ? el('img', { src: stickerUrl(a.sticker), alt: '', draggable: false }) : el('span.gg-chip-art', { innerHTML: a.art() }));
      return chip;
    });

    const tray = el('div.st-tray.gg-tray', {}, el('div.gg-chips', {}, chips));
    const screen = el(`div.st-game.gg-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, saved.name) : el('span')),
      el('div.st-board', {}, stage),
      tray);
    container.append(screen);

    // ---------- feedback ----------
    const sparkleSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sparkleSvg('#FFC93C'));
    function burst(x, y, src = sparkleSrc, n = 5) {
      for (let i = 0; i < n; i++) {
        const p = el('img.st-spark', { src, alt: '' });
        p.style.left = `${x + Math.round(Math.random() * 80 - 40)}px`;
        p.style.top = `${y + Math.round(Math.random() * 40 - 20)}px`;
        p.style.animationDelay = i * 40 + 'ms';
        fx.append(p);
        setTimeout(() => p.remove(), 900);
      }
    }
    function zzz() {
      const head = svg.querySelector('#head').getBoundingClientRect();
      const box = stage.getBoundingClientRect();
      const z = el('span.gg-z', {}, 'z');
      z.style.left = head.right - box.left - 10 + 'px';
      z.style.top = head.top - box.top + 10 + 'px';
      fx.append(z);
      setTimeout(() => z.remove(), 2600);
    }
    const anim = (id, frames, opts) => svg.querySelector('#' + id).animate(frames, { easing: 'ease-in-out', ...opts });

    const idle = startIdle(svg, { sound, zzz });

    // ---------- taps on Gigi ----------
    function onGigi(e) {
      e.preventDefault();
      const box = stage.getBoundingClientRect();
      const x = e.clientX - box.left, y = e.clientY - box.top;
      if (idle.poke()) { burst(x, y); return; }            // woke her up: that's reaction enough
      if (e.target.closest('#nose')) {
        // Achoo: head pulls back, then snaps forward.
        sound.sneeze();
        anim('head', [{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0)' }],
          { duration: 700 });
        svg.classList.add('gg-busy-eyes', 'gg-blink');
        setTimeout(() => svg.classList.remove('gg-busy-eyes', 'gg-blink'), 520);
        setTimeout(() => burst(x + 20, y, sparkleSrc, 4), 300);
        if (profile.age <= 2) speak('achoo!');
      } else if (e.target.closest('#body')) {
        // Tummy tickle: three bouncy laughs.
        sound.laugh();
        anim('gigi', [{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-10px)' },
          { transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 750 });
        svg.classList.add('gg-laughing');
        setTimeout(() => svg.classList.remove('gg-laughing'), 800);
        burst(x, y);
      } else {
        sound.giggle();
        play(gigiBox, 'gg-wiggle');
        burst(x, y);
      }
    }
    svg.addEventListener('pointerdown', onGigi);
    stage.addEventListener('pointerdown', e => { if (!e.target.closest('svg.gg-svg')) idle.poke(); });

    // ---------- action scenes ----------
    let current = null;
    async function runAction(a, chip) {
      idle.poke();
      play(chip, 'wiggle');
      sound.pop();
      if (profile.age <= 2) speak(a.label);
      current?.cancel();
      const def = SCENES[a.id];
      const sc = createScene({
        svg, gigiBox, stage, fx, behind, sound, speak, profile, reduced, saved, save, setHat, burst,
        poke: () => idle.poke(),
        dimSavanna: on => savanna.animate([{ opacity: on ? 1 : 0 }, { opacity: on ? 0 : 1 }], { duration: 600, fill: 'forwards' }),
      });
      current = sc;
      chips.forEach(c => c.classList.toggle('selected', c === chip));
      tray.classList.toggle('gg-busy', !def.persistent);
      saved.counts[a.id] = (saved.counts[a.id] || 0) + 1;
      save();
      // Keep her awake while a scene plays.
      const awake = setInterval(() => idle.poke(), 5000);
      try {
        await def.run(sc);
      } catch (err) {
        if (err !== CANCEL) console.error(err);
      } finally {
        clearInterval(awake);
        sc.cancel();
        if (current === sc) {
          current = null;
          tray.classList.remove('gg-busy');
          chip.classList.remove('selected');
        }
      }
    }

    return () => {
      current?.cancel();
      idle.stop();
      svg.removeEventListener('pointerdown', onGigi);
      return storage.setSetting(key, saved).catch(() => {});
    };
  },
};
