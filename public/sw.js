/* AfriDevHub - service worker minimal : réseau d'abord, repli sur le cache hors ligne */
const CACHE = 'afridevhub-v2';
// Seules les pages publiques sont gardées hors ligne : jamais une page personnelle (profil, notifications…).
const PUBLIC = ['/', '/login', '/download', '/conditions', '/mentions-legales', '/confidentialite'];
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE_URL, '/icons/icon-192.png'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase et autres: toujours le réseau

  // Pages: réseau d'abord, puis copie en cache, puis page hors ligne
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && PUBLIC.includes(url.pathname)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => (PUBLIC.includes(url.pathname) && (await caches.match(req))) || caches.match(OFFLINE_URL)),
    );
    return;
  }

  // Fichiers statiques Next (hashés) et icônes: cache d'abord
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
  }
});
