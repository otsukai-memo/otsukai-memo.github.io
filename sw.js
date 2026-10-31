// Offline copy of the app. The page is asked for fresh every time (a 304 when unchanged),
// so a new version shows on the next open; icons come from the cache. Bump CACHE when icons change.
const CACHE = 'kaimono-v1';
const INDEX = './index.html';
const ASSETS = ['./', INDEX, './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        let res = await fetch(req.url, { cache: 'no-cache' });
        // a navigation can't be answered with a redirected response, so ask again the plain way
        if (res.redirected) res = await fetch(req);
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(INDEX, copy));
        }
        return res;
      } catch (err) {
        return (await caches.match(INDEX)) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
