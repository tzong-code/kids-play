// GAME-05a Busy Board: a wooden board of nine fiddle toys for Covey. Each toy does exactly one
// thing, forever: switches light bulbs, the dial ticks (and a cat watches it), the zip hides a cat,
// the spring boings, bubble wrap pops, the doorbell opens a door, the slider sings, the spinner
// whirrs and the key opens the lock. No text, no score, nothing to get wrong.

import { el, play } from '../../../js/ui.js';
import { say, sparklesAt, dragToTarget, celebrateThenReset } from '../shared.js';
import {
  switchesSvg, dialSvg, zipSvg, springSvg, bubblesSvg, BUBBLES, doorSvg, sliderSvg, spinnerSvg, lockSvg, keySvg, screwSvg,
} from './board.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Pointer position in an SVG's own viewBox units. */
function toSvg(svg, e) {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  return [p.x, p.y];
}

/** Track one pointer from down to up on `node`: handlers get the event. */
function drag(node, { down, move, up }) {
  let id = null;
  node.addEventListener('pointerdown', e => {
    if (id !== null) return;
    e.preventDefault();
    id = e.pointerId;
    try { node.setPointerCapture(id); } catch {}   // capture can fail for a pointer that already lifted
    down?.(e);
  });
  node.addEventListener('pointermove', e => { if (e.pointerId === id) move?.(e); });
  const end = e => { if (e.pointerId !== id) return; id = null; up?.(e); };
  node.addEventListener('pointerup', end);
  node.addEventListener('pointercancel', end);
}

export default {
  id: 'busy-board',
  name: 'Busy Board',
  icon: 'busy',
  ages: [2, 3],
  mount(container, profile, app) {
    const { sound } = app;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    let raf = 0;

    const cell = (cls, html) => el(`div.bb-cell.${cls}`, { innerHTML: html });
    const cells = {
      switches: cell('bb-switches', switchesSvg()),
      dial: cell('bb-dialbox', dialSvg()),
      zip: cell('bb-zipbox', zipSvg()),
      spring: cell('bb-springbox', springSvg()),
      bubbles: cell('bb-bubbles', bubblesSvg()),
      door: cell('bb-doorbox', doorSvg()),
      slider: cell('bb-sliderbox', sliderSvg()),
      spinner: cell('bb-spinnerbox', spinnerSvg()),
      lock: cell('bb-lockbox', lockSvg()),
    };
    const fx = el('div.bb-fx');
    const board = el('div.bb-board', {},
      ['tl', 'tr', 'bl', 'br'].map(c => el(`span.bb-screw.${c}`, { innerHTML: screwSvg() })),
      Object.values(cells), fx);
    const screen = el(`div.st-game.bb-game.age-${profile.age}`, {},
      el('div.st-top', {}, app.exitButton(), app.homeButton(), profile.showText ? el('div.st-title', {}, 'Busy Board') : el('span')),
      el('div.st-board.bb-frame', {}, board));
    container.append(screen);
    const q = (c, sel) => cells[c].querySelector(sel);
    const qa = (c, sel) => [...cells[c].querySelectorAll(sel)];
    const svgOf = c => cells[c].querySelector('svg');

    // ---------- 1. switches and bulbs ----------
    const lit = [false, false, false];
    const bulbs = qa('switches', '.bb-bulb');
    qa('switches', '.bb-switch').forEach(sw => sw.addEventListener('pointerdown', e => {
      e.preventDefault();
      const i = +sw.dataset.i;
      lit[i] = !lit[i];
      sw.classList.toggle('on', lit[i]);
      bulbs[i].classList.toggle('on', lit[i]);
      sound.click();
      say(lit[i] ? 'on' : 'off');
      if (lit.every(Boolean)) { sound.sparkle(); bulbs.forEach(b => sparklesAt(fx, b, { n: 3 })); }
    }));

    // ---------- 2. dial (and the cat watching it) ----------
    {
      const dial = q('dial', '.bb-dial');
      const pupils = q('dial', '.bb-pupils');
      let rot = 0, last = 0, acc = 0;
      const angle = e => {
        const r = dial.getBoundingClientRect();
        return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
      };
      const look = () => {
        // The cat looks at the dial's pointer tip.
        const a = rot * Math.PI / 180;
        const tx = 88 + Math.sin(a) * 50 - 196, ty = 110 - Math.cos(a) * 50 - 83;
        const d = Math.hypot(tx, ty) || 1;
        pupils.setAttribute('transform', `translate(${(tx / d * 3.6).toFixed(2)} ${(ty / d * 3.6).toFixed(2)})`);
      };
      drag(dial, {
        down: e => { last = angle(e); sound.tick(); say('round and round'); },
        move: e => {
          const a = angle(e);
          let d = a - last;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          last = a;
          rot += d;
          acc += Math.abs(d);
          for (; acc >= 15; acc -= 15) sound.tick();
          dial.style.transform = `rotate(${rot}deg)`;
          look();
        },
      });
      const cat = q('dial', '.bb-cat');
      cat.addEventListener('pointerdown', e => { e.preventDefault(); sound.meow(700); say('kitty'); play(cat, 'bb-hop'); });
      look();
    }

    // ---------- 3. zip ----------
    {
      const s = svgOf('zip');
      const hole = q('zip', '.bb-zip-hole'), clip = q('zip', '.bb-zip-clip');
      const teeth = q('zip', '.bb-zip-teeth'), tab = q('zip', '.bb-zip-tab');
      let p = 0, open = false, lastX = 40, moved = false, startX = 0, anim = 0;
      const render = () => {
        const w = 162 * p, h = Math.min(50, w * 0.42), x1 = 40 + w, mid = 40 + w / 2;
        const d = w < 1 ? 'M40 105 Z' : `M40 105 Q${mid} ${105 - 2 * h} ${x1} 105 Q${mid} ${105 + 2 * h} 40 105 Z`;
        hole.setAttribute('d', d);
        clip.setAttribute('d', d);
        teeth.setAttribute('x1', Math.min(x1, 202));
        tab.setAttribute('transform', `translate(${x1} 105)`);
        if (!open && p > 0.96) {
          open = true;
          sound.meow(760);
          say('peekaboo!');
          sparklesAt(fx, q('zip', '.bb-zip-cat'));
        } else if (open && p < 0.5) open = false;
      };
      const zipTo = x => {
        const np = clamp((x - 40) / 162, 0, 1);
        if (Math.abs(np * 162 - lastX) >= 12) { sound.zip(); lastX = np * 162; }
        p = np;
        render();
      };
      drag(q('zip', '.bb-hit'), {
        down: e => { cancelAnimationFrame(anim); moved = false; startX = toSvg(s, e)[0]; sound.zip(); },
        move: e => {
          const x = toSvg(s, e)[0];
          if (Math.abs(x - startX) > 6) moved = true;
          if (moved) zipTo(x);
        },
        up: () => {
          if (moved) return;
          // A tap zips all the way, open or closed.
          const target = p > 0.5 ? 0 : 1, from = p, t0 = performance.now();
          const step = now => {
            const k = Math.min(1, (now - t0) / 650);
            zipTo(40 + 162 * (from + (target - from) * k));
            if (k < 1) anim = requestAnimationFrame(step);
          };
          anim = requestAnimationFrame(step);
        },
      });
      render();
    }

    // ---------- 4. spring and ball ----------
    {
      const ball = q('spring', '.bb-ball'), spring = q('spring', '.bb-spring');
      q('spring', '.bb-hit').addEventListener('pointerdown', e => {
        e.preventDefault();
        sound.boing();
        say('boing!');
        ball.getAnimations().forEach(a => a.cancel());
        spring.getAnimations().forEach(a => a.cancel());
        const opts = { duration: 1100, easing: 'ease-out' };
        ball.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(22px)', offset: 0.15 }, { transform: 'translateY(-110px)', offset: 0.45 },
          { transform: 'translateY(0)', offset: 0.7 }, { transform: 'translateY(-26px)', offset: 0.85 }, { transform: 'translateY(0)' }], opts);
        spring.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.7)', offset: 0.15 }, { transform: 'scaleY(1.18)', offset: 0.4 },
          { transform: 'scaleY(.92)', offset: 0.7 }, { transform: 'scaleY(1.04)', offset: 0.85 }, { transform: 'scaleY(1)' }], opts);
      });
    }

    // ---------- 5. bubble wrap ----------
    {
      const s = svgOf('bubbles');
      const bubbles = qa('bubbles', '.bb-bubble');
      let busy = false;
      // Anywhere on the strip pops the nearest whole bubble, so small fingers never miss.
      q('bubbles', '.bb-hit').addEventListener('pointerdown', e => {
        e.preventDefault();
        if (busy) { sound.tap(); return; }
        const [x, y] = toSvg(s, e);
        let best = -1, bestD = Infinity;
        BUBBLES.forEach(([bx, by], i) => {
          const d = Math.hypot(bx - x, by - y);
          if (!bubbles[i].classList.contains('popped') && d < bestD) { best = i; bestD = d; }
        });
        if (best < 0 || bestD > 70) { sound.tap(); play(cells.bubbles, 'bb-squish'); return; }
        bubbles[best].classList.add('popped');
        sound.pop();
        say('pop!');
        sparklesAt(fx, bubbles[best], { n: 3, color: '#fff', spread: 40 });
        if (bubbles.every(b => b.classList.contains('popped'))) {
          busy = true;
          later(() => {
            say('all popped!');
            celebrateThenReset({
              layer: fx, sound, ms: 1800,
              reset: () => bubbles.forEach((b, i) => later(() => { b.classList.remove('popped'); sound.bubble(); if (i === 7) busy = false; }, i * 90)),
            });
          }, 350);
        }
      });
    }

    // ---------- 6. doorbell ----------
    {
      const box = cells.door;
      const bell = q('door', '.bb-bell');
      let open = false;
      q('door', '.bb-hit').addEventListener('pointerdown', e => {
        e.preventDefault();
        play(bell, 'bb-press');
        if (open) { sound.meow(820); say('hello!'); return; }
        open = true;
        sound.dingdong();
        later(() => { box.classList.add('open'); }, 450);
        later(() => { sound.meow(820); say('hello!'); sparklesAt(fx, q('door', '.bb-peek'), { n: 4 }); }, 900);
        later(() => { box.classList.remove('open'); sound.door(); }, 3400);
        later(() => { open = false; }, 3900);
      });
    }

    // ---------- 7. slider ----------
    {
      const s = svgOf('slider');
      const knob = q('slider', '.bb-knob2');
      let note = null;
      const set = x => {
        const kx = clamp(x, 40, 200);
        knob.setAttribute('transform', `translate(${kx} 0)`);
        return 220 * 2 ** (2 * (kx - 40) / 160);      // two octaves, low on the left
      };
      drag(q('slider', '.bb-hit'), {
        down: e => { note = sound.glide(set(toSvg(s, e)[0])); say('la la la'); },
        move: e => note?.set(set(toSvg(s, e)[0])),
        up: () => { note?.stop(); note = null; },
      });
    }

    // ---------- 8. spinner ----------
    {
      const s = svgOf('spinner');
      const wheel = q('spinner', '.bb-wheel');
      let rot = 0, vel = 0, last = 0, lastT = 0, acc = 0, moved = false;
      const angle = e => {
        const r = wheel.getBoundingClientRect();
        return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
      };
      const turn = d => {
        rot += d;
        acc += Math.abs(d);
        for (; acc >= 60; acc -= 60) sound.tick();
        wheel.style.transform = `rotate(${rot}deg)`;
        s.classList.toggle('bb-blur', Math.abs(vel) > 0.7);
      };
      const spin = () => {
        let t = performance.now();
        cancelAnimationFrame(raf);
        const step = now => {
          const dt = Math.min(48, now - t);
          t = now;
          turn(vel * dt);
          vel *= 0.985 ** (dt / 16);
          if (Math.abs(vel) > 0.01) raf = requestAnimationFrame(step);
          else s.classList.remove('bb-blur');
        };
        raf = requestAnimationFrame(step);
      };
      drag(q('spinner', '.bb-hit'), {
        down: e => { cancelAnimationFrame(raf); vel = 0; moved = false; last = angle(e); lastT = performance.now(); say('spin!'); },
        move: e => {
          const a = angle(e), now = performance.now();
          let d = a - last;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          if (Math.abs(d) > 2) moved = true;
          vel = d / Math.max(8, now - lastT);
          last = a;
          lastT = now;
          turn(d);
        },
        up: () => {
          if (!moved || Math.abs(vel) < 0.3) vel = vel < 0 ? -1.1 : 1.1;   // a tap (or a lazy flick) still gives a good spin
          vel = clamp(vel, -2.5, 2.5);
          sound.whoosh();
          spin();
        },
      });
    }

    // ---------- 9. lock and key ----------
    {
      const box = cells.lock;
      const key = el('div.bb-key', { innerHTML: keySvg() });
      box.append(key);
      const lock = q('lock', '.bb-lock');
      let open = false;
      const k = dragToTarget(key, {
        targets: () => [q('lock', '.bb-lock-target')],
        onPick: () => sound.tap(),
        onTap: () => { sound.tap(); say('key'); play(key, 'wiggle'); },
        onMiss: () => sound.boing(),
        onDrop: () => {
          if (open) return false;
          open = true;
          later(() => { key.classList.add('turned'); sound.clunk(); }, 260);
          later(() => {
            box.classList.add('open');
            say('open!');
            celebrateThenReset({
              layer: fx, sound, ms: 2400,
              reset: () => { box.classList.remove('open'); key.classList.remove('turned'); sound.clunk(); k.home(); later(() => { open = false; }, 450); },
            });
          }, 620);
          return true;
        },
      });
      lock.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (open) return;
        sound.click();
        say('locked');
        play(lock, 'bb-shake');
      });
    }

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  },
};
