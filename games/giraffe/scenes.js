// Gigi's six action scenes. Each scene is an async function of a Scene; a Scene tracks every
// timer, animation and prop it makes so that cancel() (another button pressed, or leaving)
// removes them all and eases Gigi back to her standing pose in 300 ms. One-shot moves use the
// Web Animations API; loops (rain, confetti, flapping wings) are CSS.

import { el, play } from '../../js/ui.js';
import { stickerUrl } from '../../js/art.js';
import { ACTION_ART } from './giraffe.js';
import * as P from './props.js';

export const CANCEL = Symbol('cancel');
const BALLOON_COLOURS = ['#FF6B6B', '#FF5FA8', '#4D96FF', '#FFC93C', '#B78CFF', '#4ADE9A'];

export function createScene(ctx) {
  const { svg, gigiBox, stage, fx } = ctx;
  const speed = ctx.reduced ? 0.5 : 1;
  const timers = new Set(), anims = new Set(), props = new Set(), cleanups = [], rejects = new Set();
  const touched = new Map();    // part element -> its current pose animation
  let cancelled = false, cleaned = false;

  const part = id => svg.querySelector('#' + id);

  const sc = {
    ...ctx,
    get cancelled() { return cancelled; },
    part,

    /** Wait `ms` (scaled for reduced motion); rejects with CANCEL if the scene is cancelled. */
    wait(ms) {
      return new Promise((res, rej) => {
        if (cancelled) return rej(CANCEL);
        rejects.add(rej);
        const t = setTimeout(() => { timers.delete(t); rejects.delete(rej); res(); }, ms * speed);
        timers.add(t);
      });
    },
    /** Never resolves; for scenes that stay until another button is pressed. */
    forever() {
      return new Promise((_, rej) => { if (cancelled) rej(CANCEL); else rejects.add(rej); });
    },
    /** Resolves on the first event, or after `ms`. */
    race(target, type, ms) {
      return new Promise((res, rej) => {
        if (cancelled) return rej(CANCEL);
        const done = () => { target.removeEventListener(type, done); res(); };
        target.addEventListener(type, done, { once: true });
        sc.wait(ms).then(done, rej);
        cleanups.push(() => target.removeEventListener(type, done));
      });
    },
    later(fn, ms) {
      const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms * speed);
      timers.add(t);
    },
    every(fn, ms) {
      const t = setInterval(() => { if (!cancelled) fn(); }, ms);
      timers.add(t);
    },
    onCleanup(fn) { cleanups.push(fn); },

    /** Move one of Gigi's parts from wherever it is now to `transform`. Held until the scene ends. */
    to(id, transform, ms = 600, easing = 'ease-in-out', extra = {}) {
      const node = typeof id === 'string' ? part(id) : id;
      const from = getComputedStyle(node).transform;
      const a = node.animate([{ transform: from === 'none' ? 'none' : from }, { transform }],
        { duration: ms * speed, easing, fill: 'forwards', ...extra });
      touched.get(node)?.cancel();
      touched.set(node, a);
      return a;
    },
    /** A looping or free-form animation on one of Gigi's parts (also reset at the end). */
    loop(id, frames, opts) {
      const node = typeof id === 'string' ? part(id) : id;
      const a = node.animate(frames, { fill: 'forwards', ...opts });
      touched.get(node)?.cancel();
      touched.set(node, a);
      return a;
    },
    /** Any other tracked animation (props, effects). */
    anim(node, frames, opts) {
      const a = node.animate(frames, { fill: 'forwards', ...opts, duration: (opts.duration || 300) * speed });
      anims.add(a);
      return a;
    },

    /** Gigi's own coordinates (her 360×420 viewBox) to stage pixels. */
    at(gx, gy) {
      const g = gigiBox.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const k = g.width / 360;
      return { x: g.left - s.left + gx * k, y: g.top - s.top + gy * k };
    },
    k() { return gigiBox.getBoundingClientRect().width / 360; },
    centre(node) {
      const r = node.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
    },

    /** Place a prop (SVG string or element) on the effects layer. `anchor`: 'center' | 'bottom' | 'top'. */
    prop(content, { x, y, w, anchor = 'center', cls = '', front = true, layer } = {}) {
      const node = typeof content === 'string' ? el('div.gg-prop' + (cls ? '.' + cls : ''), { innerHTML: content }) : content;
      node.classList.add('gg-prop');
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      if (w) node.style.width = w + 'px';
      node.dataset.anchor = anchor;
      (layer || (front ? fx : ctx.behind)).append(node);
      props.add(node);
      return node;
    },
    remove(node, ms = 250) {
      props.delete(node);
      node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, fill: 'forwards' }).finished.then(() => node.remove(), () => node.remove());
    },
    svgClass(name, on = true) {
      svg.classList.toggle(name, on);
      if (on) cleanups.push(() => svg.classList.remove(name));
    },

    /** Stop everything now and ease Gigi back to standing. Safe to call twice. */
    cancel() {
      if (cleaned) return;
      cancelled = cleaned = true;
      timers.forEach(t => { clearTimeout(t); clearInterval(t); });
      timers.clear();
      rejects.forEach(r => r(CANCEL));
      rejects.clear();
      anims.forEach(a => a.cancel());
      cleanups.splice(0).reverse().forEach(fn => { try { fn(); } catch (err) { console.error(err); } });
      props.forEach(p => sc.remove(p, 200));
      for (const [node, a] of touched) {
        const now = getComputedStyle(node).transform;
        a.cancel();
        if (now && now !== 'none') node.animate([{ transform: now }, { transform: 'none' }], { duration: 300, easing: 'ease-out' });
      }
      touched.clear();
    },
  };
  return sc;
}

// ---------- shared bits ----------

const sticker = (id, cls = '') => el('img.gg-sticker' + (cls ? '.' + cls : ''), { src: stickerUrl(id), alt: '', draggable: false });

function ripple(sc, x, y, w) {
  const r = el('div.gg-ripple');
  sc.prop(r, { x, y, w });
  sc.anim(r, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 900, easing: 'ease-out' });
}

function tappable(node, onTap) {
  node.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); play(node, 'gg-friend-wiggle'); onTap(); });
}

// ---------- 1. drink ----------

async function drink(sc) {
  const { sound } = sc;
  const k = sc.k();
  const spot = sc.at(440, 404);
  const pond = sc.prop(P.pondSvg(), { x: spot.x, y: spot.y, w: 300 * k, cls: 'gg-pond' });
  sc.anim(pond, [{ transform: 'translate(-50%,-50%) translateX(-120vw)' }, { transform: 'translate(-50%,-50%)' }], { duration: 900, easing: 'cubic-bezier(.2,.9,.3,1.08)' });
  sound.splash();
  await sc.wait(900);

  // The real giraffe splits her front legs, then lowers her long neck to the water.
  sc.to('legFR', 'rotate(-24deg)', 600);
  sc.to('legFL', 'rotate(14deg)', 600);
  sc.to('torso', 'rotate(6deg)', 900);
  sc.to('neck', 'rotate(94deg)', 1300);
  sc.to('head', 'rotate(-62deg)', 1300);
  await sc.wait(1400);

  for (let i = 0; i < 3; i++) {
    sound.gulp();
    sc.anim(sc.part('throat'), [{ transform: 'scale(1)' }, { transform: 'scale(1.7,1.4)' }, { transform: 'scale(1)' }], { duration: 380 });
    ripple(sc, spot.x + 20 * k, spot.y - 4 * k, 140 * k);
    await sc.wait(620);
  }

  sc.to('neck', 'none', 1100);
  sc.to('head', 'none', 1100);
  sc.to('torso', 'none', 900);
  sc.to('legFR', 'none', 700);
  sc.to('legFL', 'none', 700);
  await sc.wait(1100);

  // A droplet drips from her nose, then she shakes it off.
  const nose = sc.centre(sc.part('nose'));
  const drop = sc.prop(P.dropSvg(), { x: nose.x + 14 * k, y: nose.y + 18 * k, w: 22 * k, cls: 'gg-drop' });
  sc.anim(drop, [{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: 'translate(-50%,-50%) translateY(140px)', opacity: 0 }], { duration: 800, easing: 'ease-in' });
  await sc.wait(500);
  sound.splash();
  sc.loop('head', [{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }],
    { duration: 700 });
  await sc.wait(700);
  sound.chirp();
  sc.burst(nose.x, nose.y);
  sc.anim(pond, [{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(-50%,-50%) translateX(-120vw)' }], { duration: 700, easing: 'ease-in' });
  await sc.wait(750);
}

// ---------- 2. shower ----------

async function shower(sc) {
  const { sound } = sc;
  const k = sc.k();
  const nozzle = sc.at(236, -14);
  const hw = 200 * k, hh = 220 * k;
  const head = sc.prop(P.showerHeadSvg(), { x: nozzle.x - hw * 0.7, y: nozzle.y - hh * 0.54, w: hw, anchor: 'none', cls: 'gg-shower' });
  sc.anim(head, [{ transform: 'translateY(-60vh)' }, { transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.3,1.4,.6,1)' });
  await sc.wait(700);

  // Rain falls over Gigi; she closes her eyes and smiles.
  const from = sc.at(176, -10), to = sc.at(300, 400);
  const rain = el('div.gg-rain', {}, Array.from({ length: 16 }, (_, i) =>
    el('i', { style: { left: `${(i / 15) * 100}%`, animationDelay: `${(i * 37) % 300}ms` } })));
  sc.prop(rain, { x: from.x, y: from.y, w: to.x - from.x, anchor: 'none' });
  rain.style.height = to.y - from.y + 'px';
  sound.water(4.4);
  sc.svgClass('gg-blink');
  sc.svgClass('gg-busy-eyes');
  sc.loop('gigi', [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px) rotate(-1.5deg)' }, { transform: 'translateX(7px) rotate(1.5deg)' }, { transform: 'translateX(0)' }],
    { duration: 700, iterations: 4 });

  if (!sc.reduced) {
    const bubbles = [];
    for (let i = 0; i < 11; i++) {
      const p = sc.at(90 + Math.random() * 170, 220 + Math.random() * 130 - (i % 3 === 0 ? 120 : 0));
      const b = sc.prop(el('div.gg-bubble'), { x: p.x, y: p.y, w: (26 + Math.random() * 30) * k });
      sc.anim(b, [{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 500, delay: i * 180, easing: 'cubic-bezier(.3,1.5,.6,1)' });
      bubbles.push(b);
    }
    await sc.wait(2600);
    sc.remove(rain, 400);
    for (const b of bubbles) {
      sound.pop();
      sc.anim(b, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.5)', opacity: 0 }], { duration: 160 });
      await sc.wait(120);
    }
  } else {
    await sc.wait(2600);
    sc.remove(rain, 300);
  }

  // A towel pats her dry.
  const towelAt = sc.at(170, 290);
  const towel = sc.prop(P.towelSvg(), { x: towelAt.x, y: towelAt.y, w: 150 * k, cls: 'gg-towel' });
  for (let i = 0; i < 3; i++) {
    sound.fwump();
    sc.anim(towel, [{ transform: 'translate(-50%,-50%) translateX(-60px) rotate(-8deg)' }, { transform: 'translate(-50%,-50%) translateX(60px) rotate(8deg)' }], { duration: 380, easing: 'ease-in-out' });
    await sc.wait(400);
  }
  sc.remove(towel);
  sc.setHat(false);   // a bath washes the party hat off
  sc.svgClass('gg-blink', false);
  sc.svgClass('gg-busy-eyes', false);
  sound.sparkle();
  const body = sc.at(170, 280);
  sc.burst(body.x, body.y, undefined, 7);
  sc.anim(head, [{ transform: 'translateY(0)' }, { transform: 'translateY(-60vh)' }], { duration: 700, easing: 'ease-in' });
  await sc.wait(900);
}

// ---------- 3. walk ----------

async function walk(sc) {
  const { sound, stage } = sc;
  const k = sc.k();
  const box = stage.getBoundingClientRect();
  const tileW = box.height * (1000 / 600);

  // The jungle: a still back layer plus three tiled layers scrolling at different speeds.
  const jungle = el('div.gg-jungle', {}, el('div.gg-jback', { innerHTML: P.jungleBackSvg() }));
  const layers = [['gg-jfar', P.jungleFarTile(), 16000], ['gg-jmid', P.jungleMidTile(), 8000]].map(([cls, tile, ms]) => {
    const layer = el('div.gg-jlayer.' + cls, { style: { backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(tile)}")`, width: `calc(100% + ${tileW}px)` } });
    jungle.append(layer);
    return [layer, ms];
  });
  sc.prop(jungle, { x: 0, y: 0, front: false, anchor: 'none' });
  const front = el('div.gg-jlayer.gg-jfront', { style: { backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(P.jungleFrontTile())}")`, width: `calc(100% + ${tileW}px)` } });
  sc.prop(front, { x: 0, y: 0, anchor: 'none' });
  layers.push([front, 4000]);
  sc.anim(jungle, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 });
  sc.anim(front, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 });
  sc.dimSavanna(true);
  sc.onCleanup(() => sc.dimSavanna(false));

  const scrolls = layers.map(([layer, ms]) =>
    sc.anim(layer, [{ transform: 'translateX(0)' }, { transform: `translateX(${-tileW}px)` }], { duration: ms, iterations: Infinity, easing: 'linear', fill: 'none' }));

  // Walking: front-left with back-right, then front-right with back-left; a little bob and neck sway.
  const step = deg => [{ transform: `rotate(${deg}deg)` }, { transform: `rotate(${-deg}deg)` }];
  const walkers = [
    sc.loop('legFL', step(15), { duration: 450, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
    sc.loop('legBR', step(15), { duration: 450, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
    sc.loop('legFR', step(-15), { duration: 450, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
    sc.loop('legBL', step(-15), { duration: 450, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
    sc.loop('torso', [{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)' }], { duration: 225, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
    sc.loop('neck', [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }),
  ];
  sc.every(() => sound.hoof(), 450);
  sound.jungle(9);
  sc.every(() => { if (Math.random() < 0.45) sound.tweet(); }, 900);

  // Jungle friends come by as she walks.
  const travellers = [];
  const W = box.width, H = box.height;
  const monkey = sc.prop(P.monkeySvg(), { x: W + 80, y: 0, w: 110 * k, anchor: 'top', cls: 'gg-monkey' });
  tappable(monkey, () => sound.ooh());
  travellers.push(sc.anim(monkey, [{ transform: 'translateX(0)' }, { transform: `translateX(${-(W + 260)}px)` }], { duration: 9000, easing: 'linear', delay: 600 }));
  sc.later(() => sound.ooh(), 2400);

  const parrot = sc.prop(P.parrotSvg(), { x: W + 100, y: H * 0.16, w: 120 * k, cls: 'gg-parrot' });
  tappable(parrot, () => sound.squawk());
  sc.later(() => {
    sound.squawk();
    sc.anim(parrot, [{ transform: 'translate(-50%,-50%) translate(0,0) scaleX(-1)' }, { transform: `translate(-50%,-50%) translate(${-(W * 0.6)}px, ${-H * 0.06}px) scaleX(-1)` },
      { transform: `translate(-50%,-50%) translate(${-(W + 260)}px, ${H * 0.04}px) scaleX(-1)` }], { duration: 3800, easing: 'linear' });
  }, 2600);

  const frog = sc.prop(P.frogLogSvg(), { x: W + 140, y: H * 0.92, w: 190 * k, anchor: 'bottom', cls: 'gg-froglog' });
  tappable(frog, () => sound.ribbit());
  sc.later(() => {
    travellers.push(sc.anim(frog, [{ transform: 'translate(-50%,-100%) translateX(0)' }, { transform: `translate(-50%,-100%) translateX(${-(W * 0.32)}px)` }],
      { duration: 2600, easing: 'ease-out' }));
    sc.later(() => { sound.ribbit(); frog.classList.add('hop'); }, 2300);
  }, 3600);

  const nose = () => sc.centre(sc.part('nose'));
  const fly = sc.prop(P.butterflySvg(), { x: W + 60, y: H * 0.1, w: 60 * k, cls: 'gg-butterfly' });
  tappable(fly, () => sound.flutter());
  sc.later(() => {
    const n = nose();
    const dx = n.x - (W + 60), dy = n.y - H * 0.1 - 22 * k;
    sound.flutter();
    sc.anim(fly, [
      { transform: 'translate(-50%,-50%) translate(0,0)' },
      { transform: `translate(-50%,-50%) translate(${dx * 0.35}px, ${dy * 0.15 + 40}px)` },
      { transform: `translate(-50%,-50%) translate(${dx * 0.7}px, ${dy * 0.5 - 30}px)` },
      { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px)` }], { duration: 2400, easing: 'ease-in-out' });
  }, 5000);

  // Keep walking for 8 s, or for as long as a finger is held on the scene.
  let holding = false;
  const down = e => { if (!e.target.closest('.gg-chip')) holding = true; };
  const up = () => { holding = false; };
  stage.addEventListener('pointerdown', down);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  sc.onCleanup(() => { stage.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); });
  const started = Date.now();
  while ((Date.now() - started < 8000 * (sc.reduced ? 0.5 : 1) || holding) && Date.now() - started < 30000) await sc.wait(100);

  // Arrive at a clearing: everything slows to a stop, a rainbow over the waterfall.
  scrolls.forEach(a => a.pause());
  travellers.forEach(a => a.pause());
  walkers.forEach(a => a.cancel());
  for (const id of ['legFL', 'legFR', 'legBL', 'legBR', 'torso', 'neck']) sc.to(id, 'none', 300);
  const rb = sc.prop(P.RAINBOW(), { x: W * 0.5, y: H * 0.3, w: Math.min(W * 0.42, 460 * k), cls: 'gg-rainbow', front: false });
  sc.anim(rb, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 900, easing: 'cubic-bezier(.3,1.4,.6,1)' });
  sound.hiss(1.8);
  await sc.wait(500);
  sound.tada();
  const head = sc.centre(sc.part('head'));
  sc.burst(head.x, head.y, undefined, 7);
  await sc.wait(2600);
  sc.anim(jungle, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 });
  sc.anim(front, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 });
  sc.dimSavanna(false);
  await sc.wait(600);
}

// ---------- 4. doctor ----------

async function doctor(sc) {
  const { sound } = sc;
  const k = sc.k();
  const spot = sc.at(372, 410);
  const doc = el('div.gg-doctor', {}, sticker('cat-pudding'), el('div.gg-coat', { innerHTML: P.coatSvg() }));
  sc.prop(doc, { x: spot.x, y: spot.y, w: 170 * k, anchor: 'bottom' });
  sc.anim(doc, [{ transform: 'translate(-50%,-100%) translateX(60vw)' }, { transform: 'translate(-50%,-100%)' }], { duration: 900, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
  sound.pop();
  await sc.wait(1000);

  // Stethoscope to her chest: the heart pulses with three thumps.
  const chest = sc.at(232, 300);
  const steth = sc.prop(ACTION_ART.doctor(), { x: spot.x - 40 * k, y: spot.y - 120 * k, w: 70 * k });
  sc.anim(steth, [{ transform: 'translate(-50%,-50%)' }, { transform: `translate(-50%,-50%) translate(${chest.x - spot.x + 40 * k}px, ${chest.y - spot.y + 120 * k}px)` }], { duration: 700, easing: 'ease-in-out' });
  await sc.wait(750);
  const heart = sc.prop(sticker('heart'), { x: chest.x - 10 * k, y: chest.y - 70 * k, w: 46 * k });
  for (let i = 0; i < 3; i++) {
    sound.heartbeat();
    sc.anim(heart, [{ transform: 'translate(-50%,-50%) scale(.8)' }, { transform: 'translate(-50%,-50%) scale(1.35)' }, { transform: 'translate(-50%,-50%) scale(.9)' }], { duration: 420 });
    await sc.wait(650);
  }
  sc.remove(heart);
  sc.remove(steth);

  // A look in her ear with a little light.
  const ear = sc.centre(sc.part('earFront'));
  const torch = sc.prop(P.torchSvg(), { x: ear.x - 70 * k, y: ear.y, w: 90 * k });
  sc.to('head', 'rotate(-8deg)', 400);
  sound.ding();
  sc.anim(torch, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  await sc.wait(1100);
  sc.remove(torch);
  sc.to('head', 'none', 400);

  // A star sticker for being so good, then both wave.
  const neck = sc.at(246, 210);
  const star = sc.prop(sticker('star'), { x: neck.x, y: neck.y, w: 44 * k });
  sc.anim(star, [{ transform: 'translate(-50%,-50%) scale(0) rotate(-40deg)' }, { transform: 'translate(-50%,-50%) scale(1.3) rotate(10deg)' }, { transform: 'translate(-50%,-50%) scale(1) rotate(0)' }],
    { duration: 500, easing: 'ease-out' });
  sound.stamp();
  await sc.wait(600);
  sound.tada();
  play(doc, 'gg-friend-wiggle');
  sc.loop('head', [{ transform: 'rotate(0)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: 900 });
  sc.burst(neck.x, neck.y);
  await sc.wait(1300);
  sc.anim(doc, [{ transform: 'translate(-50%,-100%)' }, { transform: 'translate(-50%,-100%) translateX(60vw)' }], { duration: 800, easing: 'ease-in' });
  await sc.wait(1100);
}

// ---------- 5. birthday ----------

async function birthday(sc) {
  const { sound, stage } = sc;
  const k = sc.k();
  const box = stage.getBoundingClientRect();
  const dim = sc.prop(el('div.gg-dim'), { x: 0, y: 0, anchor: 'none', front: false });
  sc.anim(dim, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 });
  sound.jingle();

  const age = Math.max(1, Math.min(9, sc.profile.age || 1));
  const spot = sc.at(410, 410);
  const cake = sc.prop(P.cakeSvg(age), { x: spot.x, y: spot.y, w: 170 * k, anchor: 'bottom', cls: 'gg-cake' });
  sc.anim(cake, [{ transform: 'translate(-50%,-100%) translateX(60vw)' }, { transform: 'translate(-50%,-100%)' }], { duration: 900, easing: 'cubic-bezier(.2,.9,.3,1.08)' });

  if (!sc.reduced) {
    const colours = ['#FF5FA8', '#FFC93C', '#4D96FF', '#4ADE9A', '#B78CFF', '#FF6B6B'];
    for (let i = 0; i < 30; i++) {
      const c = el('i.gg-confetti', { style: { background: colours[i % 6], left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.4}s`, animationDuration: `${2.2 + Math.random() * 1.4}s` } });
      sc.prop(c, { x: Math.random() * box.width, y: -20, anchor: 'none' });
    }
  }
  sc.setHat(true, true);
  await sc.wait(1100);

  // Blow out the candles: tap the cake (any tap for little ones), or it happens by itself.
  cake.classList.add('gg-waiting');
  await sc.race(sc.profile.age <= 2 ? stage : cake, 'pointerdown', 7000);
  cake.classList.remove('gg-waiting');
  sc.to('neck', 'rotate(16deg)', 300);
  await sc.wait(250);
  sound.puff();
  cake.querySelectorAll('.gg-flame').forEach(f => f.classList.add('out'));
  const top = sc.centre(cake);
  for (let i = 0; i < 4; i++) {
    const s = sc.prop(el('div.gg-smoke'), { x: top.x - 30 * k + i * 20 * k, y: top.y - 60 * k, w: 18 * k });
    sc.anim(s, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: .9 }, { transform: 'translate(-50%,-50%) translateY(-70px) scale(1.4)', opacity: 0 }], { duration: 1100, delay: i * 90 });
  }
  await sc.wait(400);
  sc.to('neck', 'none', 400);
  sound.horn();
  sc.later(() => sound.cheer(), 300);
  sc.anim(dim, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 });

  for (let i = 0; i < 4; i++) {
    const b = sc.prop(P.balloonSvg(BALLOON_COLOURS[i]), { x: box.width * (0.12 + i * 0.25), y: box.height + 40, w: 70 * k, anchor: 'top' });
    sc.anim(b, [{ transform: 'translate(-50%,0) translateY(0)' }, { transform: `translate(-50%,0) translateY(${-(box.height + 260)}px) rotate(${i % 2 ? 8 : -8}deg)` }],
      { duration: 3600, delay: i * 250, easing: 'ease-in' });
  }

  // Dance!
  sc.svgClass('gg-laughing');
  sc.loop('gigi', [{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)' }], { duration: 300, iterations: 10, direction: 'alternate', easing: 'ease-in-out' });
  sc.loop('head', [{ transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }], { duration: 600, iterations: 5, direction: 'alternate', easing: 'ease-in-out' });
  await sc.wait(3000);
  sc.svgClass('gg-laughing', false);
  sc.anim(cake, [{ transform: 'translate(-50%,-100%)' }, { transform: 'translate(-50%,-100%) translateX(60vw)' }], { duration: 700, easing: 'ease-in' });
  await sc.wait(800);
}

// ---------- 6. balloon (stays until another button) ----------

async function balloon(sc) {
  const { sound, stage } = sc;
  const k = sc.k();
  let colour = sc.saved.balloonColour || BALLOON_COLOURS[0];
  const b = sc.prop(P.balloonSvg(colour), { x: 0, y: 0, w: 96 * k, anchor: 'none', cls: 'gg-balloon' });
  b.style.transform = 'translate(-50%,-50%)';
  const string = sc.prop(el('div.gg-string', { innerHTML: '<svg><path/></svg>' }), { x: 0, y: 0, anchor: 'none', front: true });
  const path = string.querySelector('path');
  const neck = sc.part('neck'), head = sc.part('head'), gigi = sc.part('gigi');
  sc.svgClass('gg-live');   // no CSS easing while the neck tracks the balloon every frame
  sc.onCleanup(() => {
    for (const node of [neck, head, gigi]) {
      const now = node.style.transform;
      node.style.transform = '';
      if (now) node.animate([{ transform: now }, { transform: 'none' }], { duration: 300, easing: 'ease-out' });
    }
  });

  const box = () => stage.getBoundingClientRect();
  const rest = () => { const r = sc.at(420, 10); return { x: r.x, y: r.y - lift * 0.9 }; };
  let lift = 0;
  let pos = { x: box().width + 80, y: box().height * 0.8 }, vel = { x: 0, y: 0 };
  let dragging = false, held = null, moved = false, taps = 0, lastSqueak = 0, lifting = false;
  const shoulder = () => sc.at(232, 296);
  const baseAngle = (() => { const s = sc.at(232, 296), h = sc.at(270, 100); return Math.atan2(h.y - s.y, h.x - s.x); })();

  let last = performance.now(), raf = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const r = rest();
    const bob = Math.sin(now / 600) * 6;
    if (!dragging) {
      vel.x += (r.x - pos.x) * 22 * dt - vel.x * 4.5 * dt;
      vel.y += (r.y + bob - pos.y) * 22 * dt - vel.y * 4.5 * dt;
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
    }
    b.style.left = pos.x + 'px';
    b.style.top = pos.y + 'px';
    // Neck follows the balloon (a simple look-at with limits).
    const s = shoulder();
    const ang = Math.atan2(pos.y - s.y, pos.x - s.x);
    const deg = Math.max(-38, Math.min(42, (ang - baseAngle) * 180 / Math.PI));
    neck.style.transform = `rotate(${deg}deg)`;
    head.style.transform = `rotate(${-deg * 0.35}deg)`;
    gigi.style.transform = lift ? `translateY(${-lift}px)` : '';
    // String from the knot to her mouth, with a little sag.
    const m = sc.centre(sc.part('mouth'));
    const kx = pos.x, ky = pos.y + 52 * k;
    const cx = (kx + m.x) / 2, cy = Math.max(ky, m.y) + 24;
    path.setAttribute('d', `M${kx} ${ky} Q${cx} ${cy} ${m.x} ${m.y}`);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  sc.onCleanup(() => cancelAnimationFrame(raf));
  sound.boing();

  function setColour(c) {
    colour = c;
    b.innerHTML = P.balloonSvg(c);
    sc.saved.balloonColour = c;
    sc.save();
  }

  function onDown(e) {
    e.preventDefault();
    e.stopPropagation();
    sc.poke();
    dragging = true;
    moved = false;
    const start = { x: e.clientX, y: e.clientY };
    const sb = box();
    const move = ev => {
      if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 6) moved = true;
      if (!moved) return;
      pos = { x: Math.max(20, Math.min(sb.width - 20, ev.clientX - sb.left)), y: Math.max(20, Math.min(sb.height - 40, ev.clientY - sb.top)) };
      vel = { x: 0, y: 0 };
      if (performance.now() - lastSqueak > 160) { sound.squeak(); lastSqueak = performance.now(); }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      clearTimeout(held);
      dragging = false;
      if (!moved && !lifting) {
        // Tap: the balloon bounces up; every 4th tap it changes colour.
        vel.y = -900;
        sound.boing();
        if (++taps % 4 === 0) setColour(BALLOON_COLOURS[(BALLOON_COLOURS.indexOf(colour) + 1) % BALLOON_COLOURS.length]);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    sc.onCleanup(up);
    // Hold for 2 s: the balloon lifts Gigi off the ground, she kicks her legs, then floats down.
    held = setTimeout(() => { if (!moved) liftOff(); }, 2000);
  }
  b.addEventListener('pointerdown', onDown);

  async function liftOff() {
    if (lifting) return;
    lifting = true;
    sound.wheee();
    const kicks = ['legFL', 'legFR', 'legBL', 'legBR'].map((id, i) =>
      sc.loop(id, [{ transform: 'rotate(-18deg)' }, { transform: 'rotate(18deg)' }], { duration: 220, iterations: Infinity, direction: 'alternate', delay: i * 60 }));
    const t0 = performance.now();
    const rise = h => new Promise(res => {
      const from = lift;
      const tick = now => {
        const p = Math.min(1, (now - t0r) / 900);
        lift = from + (h - from) * (1 - (1 - p) ** 3);
        if (p < 1 && !sc.cancelled) requestAnimationFrame(tick); else res();
      };
      const t0r = performance.now();
      requestAnimationFrame(tick);
    });
    await rise(70 * k);
    await sc.wait(1200);
    await rise(0);
    kicks.forEach(a => a.cancel());
    lifting = false;
    void t0;
  }

  await sc.forever();
}

export const SCENES = {
  drink: { run: drink },
  shower: { run: shower },
  walk: { run: walk },
  doctor: { run: doctor },
  birthday: { run: birthday },
  balloon: { run: balloon, persistent: true },
};
