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
