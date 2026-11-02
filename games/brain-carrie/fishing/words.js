// Word Fishing words: 40 three-letter words that sound out letter by letter (short vowels), each
// with a picture (one of our stickers where there is one, otherwise an emoji), and the letter
// sounds the voice uses, each with a word that starts with (or, for x, ends with) that sound.

/** [word, sticker id or emoji]. A value that is a key of STICKERS is drawn as that sticker. */
export const WORDS = [
  ['cat', 'kitten'], ['hat', '🎩'], ['bat', '🦇'], ['rat', '🐀'], ['map', '🗺️'],
  ['cap', 'cap'], ['van', '🚐'], ['can', '🥫'], ['bag', '👜'], ['pan', '🍳'],
  ['bed', 'bed'], ['hen', '🐔'], ['pen', '🖊️'], ['net', '🥅'], ['jet', 'plane'],
  ['web', '🕸️'], ['leg', '🦵'], ['ten', '🔟'], ['pig', '🐷'], ['pin', '📌'],
  ['lip', '👄'], ['kid', '🧒'], ['bin', '🗑️'], ['dog', 'puppy'], ['fox', '🦊'],
  ['box', '📦'], ['pot', '🍲'], ['log', '🪵'], ['cog', '⚙️'], ['rod', '🎣'],
  ['sun', 'sun'], ['bus', 'bus'], ['cup', '🥤'], ['bug', '🐛'], ['mug', '☕'],
  ['hug', '🤗'], ['nut', '🥜'], ['tub', 'bathtub'], ['hut', '🛖'], ['cub', 'bear'],
];

/** Each letter: how the voice says its sound, a word that has it, and that word's picture. */
export const SOUNDS = {
  a: ['ah', 'apple', 'apple'], b: ['buh', 'ball', '⚽'], c: ['kuh', 'cat', 'kitten'],
  d: ['duh', 'dog', 'puppy'], e: ['eh', 'egg', '🥚'], f: ['fff', 'fish', 'fish'],
  g: ['guh', 'goat', '🐐'], h: ['huh', 'hat', '🎩'], i: ['ih', 'insect', '🐜'],
  j: ['juh', 'juice', '🧃'], k: ['kuh', 'kite', '🪁'], l: ['lll', 'lion', 'lion'],
  m: ['mmm', 'moon', 'moon'], n: ['nnn', 'nose', '👃'], o: ['aw', 'octopus', 'octopus'],
  p: ['puh', 'pig', '🐷'], r: ['rrr', 'rabbit', 'bunny'], s: ['sss', 'sun', 'sun'],
  t: ['tuh', 'tiger', '🐯'], u: ['uh', 'umbrella', '☂️'], v: ['vvv', 'van', '🚐'],
  w: ['wuh', 'web', '🕸️'], x: ['ks', 'fox', '🦊'], y: ['yuh', 'yo-yo', '🪀'],
  z: ['zzz', 'zebra', '🦓'],
};

/** Letter names, for spelling names (which don't sound out letter by letter). */
export const NAMES = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye',
  j: 'jay', k: 'kay', l: 'el', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess',
  t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee',
};

/** Letters for the sound levels, easiest first: the first group most children learn, then more. */
export const SOUND_SETS = [
  ['s', 'a', 't', 'i', 'p', 'n', 'm', 'd'],
  ['s', 'a', 't', 'i', 'p', 'n', 'm', 'd', 'g', 'o', 'c', 'e', 'h', 'r', 'b', 'f', 'l', 'u'],
  Object.keys(SOUNDS).filter(l => l !== 'x' && l !== 'k'),
];
