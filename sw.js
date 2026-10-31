// Offline copy of the app. The page is asked for fresh every time (a 304 when unchanged),
// so a new version shows on the next open; icons come from the cache. Bump CACHE when icons change.
// The app has an address of its own (otsukai-memo.github.io); it first lived at tsumikasane.github.io/kaimono/,
// where つみかさね shared the cache storage, so only caches named kaimono-* are ever touched here.
const PREFIX = 'kaimono-';
const CACHE = PREFIX + 'v2'; // v2: the Material 3 design (new manifest colours)
const INDEX = './index.html';
const ASSETS = ['./', INDEX, './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
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
        const c = await caches.open(CACHE);
        return (await c.match(INDEX)) || (await c.match('./')) || Response.error();
      }
    })());
    return;
  }
  // from this app's own cache only (never つみかさね's), filled again as things are used
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok) c.put(req, res.clone());
    return res;
  }))));
});
