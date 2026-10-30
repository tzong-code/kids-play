// Spoken words for the brain games. A recorded clip in assets/voice/ is used when one exists
// (list it in CLIPS below, e.g. 'your-turn' for assets/voice/your-turn.m4a); every other word
// falls back to the iPad's own voice, so the games work before anything is recorded.

import { speak } from './sound.js';

/** Recorded clip names, without the extension. Empty until clips are recorded. */
const CLIPS = new Set([]);
const EXT = 'm4a';

const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
let playing = null;

/** Say a short prompt: the recorded clip if there is one, otherwise speech synthesis. */
export function say(text) {
  const name = slug(text);
  playing?.pause();
  playing = null;
  if (CLIPS.has(name)) {
    playing = new Audio(`assets/voice/${name}.${EXT}`);
    playing.play().catch(() => speak(text));
    return;
  }
  speak(text);
}
