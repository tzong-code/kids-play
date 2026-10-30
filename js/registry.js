// Every game is a module exporting { id, name, icon, ages, mount(container, profile, app, params) }.
// `icon` is a key into TILE_ART in js/art.js (drawn tile picture); anything else is shown as plain text/emoji.
// mount() builds its screen inside `container` and may return a cleanup function (sync or async).
// The home screen shows a tile for every game whose `ages` include the child's age, in this order.
// To add a game: create games/<id>/index.js, import it here, and add its files to sw.js.

import draw from '../games/draw/index.js';
import colour from '../games/draw/colour.js';
import stickers from '../games/stickers/index.js';
import dollhouse from '../games/dollhouse/index.js';
import giraffe from '../games/giraffe/index.js';
import busyBoard from '../games/brain-covey/busy-board/index.js';
import peekaboo from '../games/brain-covey/peekaboo/index.js';
import colourMatch from '../games/brain-covey/colours/index.js';
import shapeSorter from '../games/brain-covey/shapes/index.js';
import kittySays from '../games/brain-carrie/kitty-says/index.js';
import gallery from '../games/gallery/index.js';

export const GAMES = [draw, colour, stickers, dollhouse, giraffe, busyBoard, peekaboo, colourMatch, shapeSorter, kittySays, gallery];
