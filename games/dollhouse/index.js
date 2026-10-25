// GAME-02 Kitty Dollhouse: tap a window to go into that room; every room is a sticker scene.

import { mountStickerScene } from '../../js/stickers.js';
import { stickerUrl } from '../../js/art.js';
import { el, play } from '../../js/ui.js';
import { BACKDROPS } from '../../assets/art/backdrops.js';
import { ROOMS, CATS, WINDOW_SIZE, HOUSE_SIZE } from './rooms.js';

export default {
  id: 'dollhouse',
  name: 'Dollhouse',
  icon: 'dollhouse',
  ages: [2, 3, 4, 5, 6, 7, 8],
  async mount(container, profile, app) {
    let leaveRoom = null;

    function showHouse() {
      container.replaceChildren();
      const [W, H] = HOUSE_SIZE, [ww, wh] = WINDOW_SIZE;
      const windows = Object.entries(ROOMS).map(([key, room]) => {
        const [x, y] = room.window;
        const b = el('button.dh-window', {
          'aria-label': room.name,
          style: { left: (x / W) * 100 + '%', top: (y / H) * 100 + '%', width: (ww / W) * 100 + '%', height: (wh / H) * 100 + '%' },
          onclick: () => {
            app.sound.door();
            play(b, 'bounce');
            if (!profile.showText) app.speak(room.name);
            setTimeout(() => openRoom(key), 160);
          },
        }, el('img', { src: stickerUrl(room.icon), alt: '', draggable: false }),
        profile.showText ? el('span.dh-label', {}, room.name) : null);
        return b;
      });
      container.append(el(`div.dh-front.age-${profile.age}`, {},
        el('div.st-top', {}, app.exitButton(), app.homeButton(),
          profile.showText ? el('div.st-title', {}, 'Kitty Dollhouse') : el('span')),
        el('div.dh-stage', {}, el('div.dh-house', {}, el('div.dh-art', { innerHTML: BACKDROPS.house }), windows))));
    }

    async function openRoom(key) {
      const room = ROOMS[key];
      container.replaceChildren();
      leaveRoom = await mountStickerScene(container, profile, app, {
        key: `house:${profile.id}:${key}`,
        title: room.name,
        backdrop: BACKDROPS[`room-${key}`],
        items: [...CATS, ...room.items],
        sound: room.sound,
        sparks: room.sparks,
        back: { art: 'dollhouse', label: 'Back to the house', onClick: backToHouse },
      });
    }

    async function backToHouse() {
      const leave = leaveRoom;
      leaveRoom = null;
      if (leave) await leave();
      showHouse();
    }

    showHouse();
    return async () => { if (leaveRoom) await leaveRoom(); };
  },
};
