// Kitty Dollhouse rooms. Add a room = add an entry here and a window rect (in the house
// picture's 1200×760 coordinates) — the window button is placed over that rect.

/** Our own cat friends, in every room. */
export const CATS = ['cat-sprinkle', 'cat-button', 'cat-whisker', 'cat-pudding', 'cat-mochi', 'kitten', 'paw'];

export const ROOMS = {
  kitchen: {
    name: 'Kitchen', icon: 'cupcake', window: [115, 285], sound: 'chime', sparks: ['cupcake', 'sparkle', 'strawberry'],
    items: ['cupcake', 'cake', 'cookie', 'strawberry', 'milk', 'doughnut', 'lollipop', 'birthday-cake', 'candy', 'teapot'],
  },
  bedroom: {
    name: 'Bedroom', icon: 'bed', window: [370, 285], sound: 'chime', sparks: ['star', 'purple-heart', 'moon'],
    items: ['bed', 'bear', 'moon', 'star', 'bow', 'crown', 'wand', 'unicorn', 'books', 'purple-heart'],
  },
  craft: {
    name: 'Craft Room', icon: 'palette', window: [625, 285], sound: 'chime', sparks: ['sparkle', 'rainbow', 'sparkle'],
    items: ['palette', 'crayon', 'scissors', 'rainbow', 'thread', 'balloon', 'kite', 'paintbrush', 'paperclip', 'yarn'],
  },
  bath: {
    name: 'Bubble Bath', icon: 'bathtub', window: [880, 285], sound: 'bubble', sparks: ['bubbles', 'blue-heart'],
    items: ['bathtub', 'bubbles', 'rubber-duck', 'soap', 'mermaid', 'fish', 'dolphin', 'lotion', 'shower', 'blue-heart'],
  },
  tennis: {
    name: 'Tennis Court', icon: 'tennis-ball', window: [115, 520], sound: 'bounce', sparks: ['tennis-ball', 'star', 'sparkle'],
    items: ['tennis-ball', 'racket', 'trophy', 'drink', 'cap', 'sneakers', 'medal', 'bow', 'muscle', 'sun'],
  },
  pool: {
    name: 'Swimming Pool', icon: 'swim-ring', window: [370, 520], sound: 'bubble', sparks: ['bubbles', 'blue-heart', 'bubbles'],
    items: ['swimmer', 'rubber-duck', 'swimsuit', 'goggles', 'swim-ring', 'watermelon', 'palm-tree', 'bubbles', 'sun', 'ice-cream'],
  },
  golf: {
    name: 'Golf Green', icon: 'golf-flag', window: [625, 520], sound: 'bounce', sparks: ['golf-flag', 'star', 'sparkle'],
    items: ['golf-flag', 'golfer', 'trophy', 'cap', 'golf-buggy', 'tree', 'tulip', 'squirrel', 'butterfly', 'sun'],
  },
  piano: {
    name: 'Piano Room', icon: 'piano', window: [880, 520], sound: 'piano', sparks: ['music-note', 'music-notes', 'sparkle'],
    items: ['piano', 'music-note', 'music-notes', 'microphone', 'violin', 'drum', 'trumpet', 'sheet-music', 'bouquet', 'bow'],
  },
};

export const WINDOW_SIZE = [205, 170];
export const HOUSE_SIZE = [1200, 760];
