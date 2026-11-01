// Offline copy of the app. The page and its script (app.js) are asked for fresh every time (a 304 when unchanged),
// so a new version shows on the next open and the two always match; icons come from the cache. Bump CACHE when icons change.
// The app has an address of its own (otsukai-memo.github.io); it first lived at tsumikasane.github.io/kaimono/,
// where つみかさね shared the cache storage, so only caches named kaimono-* are ever touched here.
const PREFIX = 'kaimono-';
const CACHE = PREFIX + 'v4'; // v4: the script moved out of the page into app.js
const INDEX = './index.html', SCRIPT = './app.js';
const ASSETS = ['./', INDEX, SCRIPT, './manifest.webmanifest', './icons/basket-192.png', './icons/basket-512.png', './icons/basket-maskable-512.png', './icons/basket-apple-touch.png'];

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
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // the app's page and app.js (whatever its ?v=) come from the network first, and from the copy when offline;
  // other pages here (tools/open-backup.html) go to the network as usual, never into the app's copy
  const scope = new URL(self.registration.scope).pathname;
  const isApp = req.mode === 'navigate' && (url.pathname === scope || url.pathname === scope + 'index.html');
  if (req.mode === 'navigate' && !isApp) return;
  const fresh = isApp ? INDEX : url.pathname.endsWith('/app.js') ? SCRIPT : '';
  if (fresh) {
    e.respondWith((async () => {
      try {
        let res = await fetch(req.url, { cache: 'no-cache' });
        // a navigation can't be answered with a redirected response, so ask again the plain way
        if (res.redirected) res = await fetch(req);
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(fresh, copy));
        }
        return res;
      } catch (err) {
        const c = await caches.open(CACHE);
        return (await c.match(fresh)) || (fresh === INDEX && await c.match('./')) || Response.error();
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
