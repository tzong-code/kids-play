// Free draw: a blank canvas with the profile's brushes, colours and stamps.
// Also re-opens a saved drawing when the gallery passes { drawingId }.

import { mountEditor } from './editor.js';

export default {
  id: 'draw',
  name: 'Draw',
  icon: '🖍️',
  ages: [2, 3, 4, 5, 6, 7, 8],
  mount: (container, profile, app, params) => mountEditor(container, profile, app, params),
};
