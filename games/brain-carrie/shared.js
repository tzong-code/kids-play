// Shared round manager for Carrie's brain games (GAME-04). Difficulty moves silently: up after
// 3 right in a row, down after 2 misses in a row. A round should end in a celebration within
// 90 seconds, so after WRAP_MS a game makes its next question easy and celebrates the win.
// Progress lives in `brain-carrie-<game>`: { level, rounds, best }.

export { say } from '../../js/voice.js';
export { sparkles, sparklesAt, confetti } from '../../js/fx.js';

const WRAP_MS = 75 * 1000;

/** Best-streak milestones; each one reached is a star on the game's home tile. */
export const STAR_STEPS = [3, 5, 8, 12, 16];
export const starsFor = best => STAR_STEPS.filter(n => best >= n).length;

export async function loadProgress(storage, game) {
  return { level: 1, rounds: 0, best: 0, ...((await storage.getSetting(`brain-carrie-${game}`).catch(() => null)) || {}) };
}

export async function createRounds({ storage, game, minLevel = 1, maxLevel = 10 }) {
  const state = await loadProgress(storage, game);
  const save = () => storage.setSetting(`brain-carrie-${game}`, state).catch(() => {});
  let streak = 0, misses = 0, startedAt = Date.now();
  return {
    get level() { return state.level; },
    get best() { return state.best; },
    get rounds() { return state.rounds; },
    startRound() { startedAt = Date.now(); streak = 0; misses = 0; },
    /** True once the round has run long enough that the next win should end it. */
    get wrapUp() { return Date.now() - startedAt > WRAP_MS; },
    /** A right answer. Returns 'up' when the level just went up. */
    correct() {
      misses = 0;
      if (++streak >= 3 && state.level < maxLevel) {
        streak = 0;
        state.level++;
        save();
        return 'up';
      }
      return null;
    },
    /** A miss. Returns 'down' when the level just went down. */
    miss() {
      streak = 0;
      if (++misses >= 2 && state.level > minLevel) {
        misses = 0;
        state.level--;
        save();
        return 'down';
      }
      return null;
    },
    /** Record a streak; returns true if it is a new best. */
    record(n) {
      if (n <= state.best) return false;
      state.best = n;
      save();
      return true;
    },
    finishRound() { state.rounds++; save(); },
    save,
  };
}
