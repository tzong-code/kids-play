// Every game is a module exporting { id, name, icon, ages, mount(container, profile, app, params) }.
// mount() builds its screen inside `container` and may return a cleanup function (sync or async).
// The home screen shows a tile for every game whose `ages` include the child's age, in this order.
// To add a game: create games/<id>/index.js, import it here, and add its files to sw.js.

import draw from '../games/draw/index.js';
import colour from '../games/draw/colour.js';
import gallery from '../games/gallery/index.js';

export const GAMES = [draw, colour, gallery];
