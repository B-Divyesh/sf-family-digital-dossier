const CACHE = 'dossier-shell-v2';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/assets/app.js', '/assets/styles.js', '/assets/app.css', '/assets/hero-archive.avif', '/assets/hero-archive.webp', '/assets/hero-archive.jpg', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/icon-maskable.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]).then(async () => {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED' }));
  }));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      if (event.request.mode === 'navigate') return (await caches.match('/index.html')) || caches.match('/offline.html');
      return Response.error();
    }
  })());
});
