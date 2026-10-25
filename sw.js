// Service worker: caches every app file on first load so the app opens with no network.
// Bump CACHE on every release; the next open on Wi-Fi fetches the new files.

const CACHE = 'kids-play-v2';

const FILES = [
  './',
  'index.html',
  'manifest.json',
  'css/app.css',
  'js/app.js',
  'js/art.js',
  'js/canvas.js',
  'js/profiles.js',
  'js/registry.js',
  'js/sound.js',
  'js/storage.js',
  'js/ui.js',
  'games/draw/index.js',
  'games/draw/colour.js',
  'games/draw/editor.js',
  'games/gallery/index.js',
  'assets/pages/pages.js',
  'assets/art/stickers.js',
  'assets/fonts/fredoka-700.woff2',
  'assets/icons/icon-180.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('index.html').then(hit => hit || fetch(req)));
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    })),
  );
});
