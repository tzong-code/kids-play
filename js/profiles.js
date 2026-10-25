// Age presets. A profile is just a settings object: add a child or bump an age here.

const ALL_COLOURS = [
  { hex: '#e53935', name: 'red' },
  { hex: '#ff8a00', name: 'orange' },
  { hex: '#fdd835', name: 'yellow' },
  { hex: '#7cb342', name: 'green' },
  { hex: '#00897b', name: 'sea green' },
  { hex: '#4fc3f7', name: 'light blue' },
  { hex: '#1e63d6', name: 'blue' },
  { hex: '#283593', name: 'dark blue' },
  { hex: '#ff6fae', name: 'pink' },
  { hex: '#d81b60', name: 'hot pink' },
  { hex: '#f8bbd0', name: 'light pink' },
  { hex: '#9c27b0', name: 'purple' },
  { hex: '#ce93d8', name: 'lilac' },
  { hex: '#8d5524', name: 'brown' },
  { hex: '#ffffff', name: 'white' },
  { hex: '#222222', name: 'black' },
];

const pick = names => names.map(n => ALL_COLOURS.find(c => c.name === n));

export const PROFILES = {
  carrie: {
    id: 'carrie',
    name: 'Carrie',
    age: 5,
    theme: 'princess',
    avatar: '👸',
    avatars: ['👸', '🧚‍♀️', '🦄', '👑', '🐱', '🦋'],
    showText: true,
    // Pinks and purples first, then the rest.
    palette: pick(['pink', 'hot pink', 'light pink', 'purple', 'lilac', 'red', 'orange', 'yellow',
      'green', 'sea green', 'light blue', 'blue', 'dark blue', 'brown', 'white', 'black']),
    brushes: [
      { id: 'crayon', icon: '🖍️', label: 'Crayon', width: 12 },
      { id: 'marker', icon: '🖊️', label: 'Marker', width: 9 },
      { id: 'glitter', icon: '✨', label: 'Glitter', width: 14 },
      { id: 'rainbow', icon: '🌈', label: 'Rainbow', width: 16 },
    ],
    eraser: { id: 'eraser', icon: '🧽', label: 'Eraser', width: 34 },
    fillBucket: true,
    undo: true,
    pressure: true,
    pinchStamps: true,
    stampSize: 90,
    fillMode: 'color',
    pageSet: 'kid',
    pageTheme: 'princess',
    pageStroke: 1.1,
    galleryDelete: true,
    galleryReopen: true,
    sendToPhotos: true,
  },
  covey: {
    id: 'covey',
    name: 'Covey',
    age: 2,
    theme: 'mermaid',
    avatar: '🧜‍♀️',
    avatars: ['🧜‍♀️', '🐠', '🐳', '🐙', '🐬', '🦀'],
    showText: false,
    // Six colours, blues and sea greens first.
    palette: pick(['blue', 'light blue', 'sea green', 'yellow', 'red', 'pink']),
    brushes: [
      { id: 'marker', icon: '🖍️', label: 'Crayon', width: 30 },
      { id: 'rainbow', icon: '🌈', label: 'Rainbow', width: 34 },
    ],
    eraser: null,
    fillBucket: false,
    undo: false,
    pressure: false,
    pinchStamps: false,
    stampSize: 120,
    fillMode: 'region',
    pageSet: 'toddler',
    pageTheme: 'sea',
    pageStroke: 1.8,
    galleryDelete: false,
    galleryReopen: false,
    sendToPhotos: false,   // the share sheet is an escape hatch; parents use a 2-second hold instead
  },
};

/** Order in which the picker shows the girls. */
export const PROFILE_ORDER = ['carrie', 'covey'];

/** Emoji stamps: the profile's theme first, then shared animals, hearts, stars and vehicles. */
export const STAMPS = {
  mermaid: ['🧜‍♀️', '🐠', '🐟', '🐡', '🐙', '🦀', '🐚', '🐳', '🐬', '🐢', '🦭', '🪸'],
  princess: ['👑', '👸', '💎', '🏰', '🦄', '🎀', '🪄', '👗', '🌸', '🦢', '💍', '🧚‍♀️'],
  shared: ['❤️', '⭐', '🌈', '☀️', '🌙', '☁️', '🌷', '🦋', '🐞', '🐝', '🐶', '🐱', '🐰', '🐻',
    '🐼', '🦁', '🐘', '🦒', '🐥', '🦕', '🍎', '🍓', '🧁', '🍦', '🚗', '🚌', '🚒', '🚂', '✈️', '🚀'],
};

export function stampsFor(profile) {
  return [...STAMPS[profile.theme], ...STAMPS.shared];
}
