// GAME-01 Sticker Scenes: each girl's own world to fill with stickers.

import { mountStickerScene } from '../../js/stickers.js';
import { BACKDROPS } from '../../assets/art/backdrops.js';
import { WORLDS } from './scenes.js';

export default {
  id: 'stickers',
  name: 'Stickers',
  icon: 'stickers',
  ages: [2, 3, 4, 5, 6, 7, 8],
  mount(container, profile, app) {
    const world = WORLDS[profile.theme];
    return mountStickerScene(container, profile, app, {
      key: `scene:${profile.id}`,
      title: profile.name,
      backdrop: BACKDROPS[world.backdrop],
      items: world.items,
      sound: world.sound,
      sparks: world.sparks,
      onOpen: () => app.sound[world.sound](),
    });
  },
};
