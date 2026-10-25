// Play timer: each girl plays in blocks (default 20 minutes). The block is measured from
// `blockStartedAt` on the wall clock, so closing the app, backgrounding it or switching profile
// never resets it. When it runs out the profile locks until a grown-up passes the hard maths gate.
// A sleepy cat in the corner shows time passing without numbers; at 2 minutes left it yawns.

import { el } from './ui.js';
import { sleepyCat } from './art.js';
import * as storage from './storage.js';

export const LIMIT_CHOICES = [10, 15, 20, 30];   // minutes per block
export const CAP_CHOICES = [0, 1, 2, 3];          // blocks per day; 0 = no limit
const DEFAULT_LIMIT = 20;
const WARN_MS = 2 * 60 * 1000;

const today = () => new Date().toLocaleDateString('en-CA');   // YYYY-MM-DD, local time

let active = null;     // { profile, state, timer, lastTick, ticks }
let badge = null;
let onLock = () => {};

export function setLockHandler(fn) { onLock = fn; }

export async function limitFor(id) { return (await storage.getSetting(`playLimit:${id}`)) || DEFAULT_LIMIT; }
export async function capFor(id) { return (await storage.getSetting(`playCap:${id}`)) || 0; }
export const setLimit = (id, min) => storage.setSetting(`playLimit:${id}`, min);
export const setCap = (id, n) => storage.setSetting(`playCap:${id}`, n);

async function load(id) {
  const st = (await storage.getSetting(`play:${id}`)) || {};
  if (st.day !== today()) Object.assign(st, { day: today(), blocksToday: 0, msToday: 0 });
  return st;
}
const save = (id, st) => storage.setSetting(`play:${id}`, st);

const remaining = st => st.blockStartedAt ? st.blockMin * 60000 - (Date.now() - st.blockStartedAt) : 0;

/** Status for parent settings. */
export async function status(id) {
  const st = await load(id);
  return {
    locked: !!st.locked,
    blocksToday: st.blocksToday || 0,
    minutesToday: Math.round((st.msToday || 0) / 60000),
    minutesLeft: st.locked || !st.blockStartedAt ? 0 : Math.max(0, Math.ceil(remaining(st) / 60000)),
    capReached: await capReached(id, st),
  };
}

async function capReached(id, st) {
  const cap = await capFor(id);
  return cap > 0 && (st.blocksToday || 0) >= cap;
}

export async function isLocked(id) {
  const st = await load(id);
  return !!st.locked || (st.blockStartedAt && remaining(st) <= 0);
}

/** Entering a profile: resumes her block, starts a new one, or reports that she's locked. */
export async function enter(profile) {
  leave();
  const st = await load(profile.id);
  if (!st.locked && st.blockStartedAt && remaining(st) <= 0) lockState(st);
  if (!st.locked && !st.blockStartedAt) {
    if (await capReached(profile.id, st)) lockState(st);
    else await startBlock(profile.id, st);
  }
  await save(profile.id, st);
  if (st.locked) return 'locked';
  active = { profile, state: st, lastTick: Date.now(), ticks: 0, timer: setInterval(tick, 1000) };
  document.addEventListener('visibilitychange', tick);
  document.body.classList.add('timer-on');
  tick();
  return 'ok';
}

/** Leaving a profile (back to the picker or onto the lock screen). The block keeps running. */
export function leave() {
  if (!active) return;
  clearInterval(active.timer);
  document.removeEventListener('visibilitychange', tick);
  save(active.profile.id, active.state);
  active = null;
  badge?.remove();
  badge = null;
  document.body.classList.remove('timer-on', 'sleepy-soon');
}

async function startBlock(id, st) {
  st.blockStartedAt = Date.now();
  st.blockMin = await limitFor(id);
  st.blocksToday = (st.blocksToday || 0) + 1;
  st.locked = false;
}

function lockState(st) {
  st.locked = true;
  st.blockStartedAt = null;
}

function tick() {
  if (!active) return;
  const { state: st, profile } = active;
  const now = Date.now();
  if (document.visibilityState === 'visible') st.msToday = (st.msToday || 0) + Math.min(now - active.lastTick, 5000);
  active.lastTick = now;
  if (st.day !== today()) Object.assign(st, { day: today(), blocksToday: 1, msToday: 0 });

  const left = remaining(st);
  if (left <= 0) {
    lockState(st);
    const p = profile;
    leave();
    onLock(p);
    return;
  }
  drawBadge(1 - left / (st.blockMin * 60000), left <= WARN_MS);
  if (++active.ticks % 10 === 0) save(profile.id, st);
}

let drawn = '';
function drawBadge(sleepy, warn) {
  if (!badge) {
    badge = el('div.sleepy-cat', { 'aria-hidden': 'true' });
    document.body.append(badge);
    drawn = '';
  }
  // Re-draw only when the picture changes; the yawn comes and goes every few seconds near the end.
  const yawn = warn && Math.floor(Date.now() / 3000) % 2 === 0;
  const key = `${Math.round(sleepy * 20)}:${yawn}`;
  if (key !== drawn) {
    badge.innerHTML = sleepyCat(Math.min(1, sleepy), yawn);
    drawn = key;
  }
  document.body.classList.toggle('sleepy-soon', warn);
}

/** After the maths gate: start a fresh block (unless the daily cap says no). */
export async function unlockNewBlock(profile) {
  const st = await load(profile.id);
  if (await capReached(profile.id, st)) return false;
  await startBlock(profile.id, st);
  await save(profile.id, st);
  return true;
}

/** After the maths gate: stay locked; only the gate opens it again. */
export async function doneForToday(profile) {
  const st = await load(profile.id);
  lockState(st);
  await save(profile.id, st);
}
