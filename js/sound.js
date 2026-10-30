// Sounds are synthesised with Web Audio (no files to download, works offline),
// and spoken labels use the iPad's built-in voice.

let ctx;
let master;

/** iOS only allows audio after a user gesture; call this from the first tap. */
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state !== 'running') ctx.resume();
}

function tone({ type = 'sine', from, to = from, dur = 0.12, vol = 0.6, delay = 0 }) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** A short burst of filtered white noise (sneezes, splashes, water). */
function noise({ dur = 0.2, vol = 0.2, freq = 1200, delay = 0, type = 'bandpass' }) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

export const sound = {
  pop() { tone({ from: 520, to: 980, dur: 0.08, vol: 0.5 }); },
  tap() { tone({ type: 'triangle', from: 700, to: 500, dur: 0.06, vol: 0.35 }); },
  bubble() {
    const f = 300 + Math.random() * 300;
    tone({ from: f, to: f * 2.4, dur: 0.11, vol: 0.35 });
  },
  chirp() {
    tone({ type: 'triangle', from: 900, to: 1500, dur: 0.09, vol: 0.4 });
    tone({ type: 'triangle', from: 1200, to: 1900, dur: 0.09, vol: 0.35, delay: 0.09 });
  },
  sparkle() {
    [1568, 2093, 2637].forEach((f, i) => tone({ from: f, dur: 0.1, vol: 0.18, delay: i * 0.05 }));
  },
  stamp() {
    tone({ type: 'square', from: 180, to: 90, dur: 0.07, vol: 0.18 });
    tone({ from: 660, to: 1320, dur: 0.1, vol: 0.4, delay: 0.04 });
  },
  whoosh() {
    tone({ type: 'sawtooth', from: 900, to: 120, dur: 0.45, vol: 0.12 });
  },
  tada() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', from: f, dur: 0.18, vol: 0.35, delay: i * 0.09 }));
  },
  nope() { tone({ type: 'triangle', from: 300, to: 200, dur: 0.15, vol: 0.3 }); },
  // Sticker-scene sounds (GAME-01 / GAME-02 recipes).
  chime() {
    const f = [880, 1108, 1318][(Math.random() * 3) | 0];
    tone({ from: f, to: f * 1.5, dur: 0.5, vol: 0.3 });
  },
  bounce() { tone({ type: 'square', from: 220, to: 110, dur: 0.18, vol: 0.18 }); },
  piano() {
    const f = [261.6, 293.7, 329.6, 349.2, 392, 440, 493.9, 523.3][(Math.random() * 8) | 0];
    tone({ type: 'triangle', from: f, dur: 0.8, vol: 0.4 });
  },
  door() { tone({ type: 'triangle', from: 400, to: 800, dur: 0.35, vol: 0.25 }); },
  // Gigi the giraffe (GAME-03 recipes).
  giggle() {
    tone({ from: 600, to: 900, dur: 0.1, vol: 0.35 });
    tone({ from: 700, to: 1000, dur: 0.1, vol: 0.35, delay: 0.12 });
  },
  laugh() {
    [660, 784, 988].forEach((f, i) => tone({ type: 'triangle', from: f, to: f * 1.2, dur: 0.14, vol: 0.32, delay: i * 0.16 }));
  },
  sneeze() {
    tone({ from: 500, to: 900, dur: 0.25, vol: 0.12 });
    noise({ dur: 0.22, vol: 0.35, freq: 2400, delay: 0.25 });
  },
  yawn() { tone({ from: 420, to: 220, dur: 0.9, vol: 0.18 }); },
  snore() { tone({ type: 'triangle', from: 110, to: 150, dur: 0.7, vol: 0.08 }); },
  // Gigi's action scenes (GAME-03 sound table, plus the jungle friends).
  gulp() { tone({ from: 180, to: 120, dur: 0.2, vol: 0.5 }); },
  splash() { noise({ dur: 0.35, vol: 0.3, freq: 900 }); tone({ from: 700, to: 300, dur: 0.2, vol: 0.12 }); },
  /** Running water for `dur` seconds (filtered noise). */
  water(dur = 3) { noise({ dur, vol: 0.08, freq: 1200, type: 'lowpass' }); },
  fwump() { noise({ dur: 0.18, vol: 0.3, freq: 300, type: 'lowpass' }); },
  hoof() { tone({ type: 'triangle', from: 160, to: 140, dur: 0.07, vol: 0.4 }); },
  tweet() {
    const f = 2200 + Math.random() * 900;
    tone({ from: f, to: f * 1.25, dur: 0.08, vol: 0.12 });
    tone({ from: f * 1.1, to: f * 1.4, dur: 0.08, vol: 0.1, delay: 0.1 });
  },
  jungle(dur = 8) { noise({ dur, vol: 0.035, freq: 500, type: 'lowpass' }); },
  ooh() { tone({ from: 300, to: 520, dur: 0.25, vol: 0.3 }); tone({ from: 520, to: 340, dur: 0.3, vol: 0.28, delay: 0.25 }); },
  squawk() { tone({ type: 'sawtooth', from: 1300, to: 850, dur: 0.18, vol: 0.12 }); tone({ type: 'sawtooth', from: 1200, to: 800, dur: 0.16, vol: 0.1, delay: 0.2 }); },
  ribbit() { tone({ type: 'square', from: 200, to: 160, dur: 0.09, vol: 0.14 }); tone({ type: 'square', from: 220, to: 170, dur: 0.12, vol: 0.14, delay: 0.13 }); },
  flutter() { [1800, 2200, 2000, 2400].forEach((f, i) => tone({ from: f, dur: 0.05, vol: 0.08, delay: i * 0.06 })); },
  hiss(dur = 1.6) { noise({ dur, vol: 0.12, freq: 3000, type: 'highpass' }); },
  heartbeat() { tone({ from: 60, dur: 0.12, vol: 0.9 }); tone({ from: 58, dur: 0.12, vol: 0.7, delay: 0.24 }); },
  ding() { tone({ from: 1568, dur: 0.6, vol: 0.25 }); tone({ from: 2093, dur: 0.5, vol: 0.12, delay: 0.02 }); },
  horn() { tone({ type: 'sawtooth', from: 440, to: 660, dur: 0.3, vol: 0.14 }); },
  puff() { noise({ dur: 0.3, vol: 0.25, freq: 800, type: 'lowpass' }); },
  /** An original 8-note party tune (not "Happy Birthday"). */
  jingle() {
    [523.3, 659.3, 784, 659.3, 698.5, 880, 784, 1046.5].forEach((f, i) =>
      tone({ type: 'triangle', from: f, dur: 0.17, vol: 0.32, delay: i * 0.18 }));
  },
  cheer() { noise({ dur: 0.7, vol: 0.12, freq: 1500 }); this.tada(); },
  boing() { tone({ from: 300, to: 700, dur: 0.18, vol: 0.3 }); tone({ from: 700, to: 450, dur: 0.18, vol: 0.2, delay: 0.16 }); },
  squeak() { tone({ from: 1300, to: 1700, dur: 0.07, vol: 0.12 }); },
  wheee() { tone({ from: 500, to: 1500, dur: 0.8, vol: 0.25 }); },
  // Busy Board and the brain games (GAME-04 / GAME-05).
  click() { tone({ type: 'square', from: 1800, to: 1200, dur: 0.03, vol: 0.18 }); noise({ dur: 0.03, vol: 0.2, freq: 3000 }); },
  tick() { tone({ type: 'square', from: 2400, dur: 0.02, vol: 0.08 }); },
  zip() { noise({ dur: 0.09, vol: 0.18, freq: 4200 }); },
  dingdong() { tone({ from: 784, dur: 0.6, vol: 0.3 }); tone({ from: 622, dur: 0.9, vol: 0.3, delay: 0.42 }); },
  clunk() { tone({ type: 'square', from: 140, to: 70, dur: 0.12, vol: 0.25 }); noise({ dur: 0.08, vol: 0.3, freq: 600, type: 'lowpass', delay: 0.02 }); },
  /** A cat's meow around `freq` Hz: rises, then falls a little. */
  meow(freq = 660, vol = 0.32) {
    tone({ type: 'triangle', from: freq * 0.85, to: freq * 1.25, dur: 0.16, vol });
    tone({ type: 'triangle', from: freq * 1.25, to: freq * 0.95, dur: 0.24, vol: vol * 0.9, delay: 0.15 });
  },
  /** The soft "not quite" sound: never a buzzer. */
  hmm() { tone({ from: 330, to: 300, dur: 0.18, vol: 0.22 }); tone({ from: 300, to: 340, dur: 0.22, vol: 0.2, delay: 0.2 }); },
  /** A held note whose pitch follows a slider: returns { set(freq), stop() }. */
  glide(freq = 440) {
    if (!ctx) return { set() {}, stop() {} };
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.05);
    o.connect(g).connect(master);
    o.start();
    return {
      set(f) { o.frequency.setTargetAtTime(f, ctx.currentTime, 0.03); },
      stop() {
        g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        o.stop(ctx.currentTime + 0.3);
      },
    };
  },
  /** Soft falling "good night" notes for the lock screen. */
  lullaby() {
    [784, 659, 523, 392].forEach((f, i) => tone({ from: f, dur: 0.7, vol: 0.22, delay: i * 0.38 }));
  },
};

let voice;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  voice = voices.find(v => /en[-_](GB|AU|US)/i.test(v.lang) && /Samantha|Karen|Moira|Serena|Female/i.test(v.name))
    || voices.find(v => /^en/i.test(v.lang));
}

/** Say a word or two, cheerfully. Cancels anything already being said. */
export function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  if (!voice) pickVoice();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.rate = 0.95;
  u.pitch = 1.25;
  speechSynthesis.speak(u);
}

if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = pickVoice;
