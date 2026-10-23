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

// ---- Web Push : notification reçue site fermé, puis ouverture de la bonne page au clic
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { /* charge utile illisible */ }
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Site ouvert et visible : l'application affiche déjà sa propre alerte, pas de doublon.
      if (list.some((c) => c.visibilityState === 'visible')) return undefined;
      return self.registration.showNotification(d.title || 'AfriDevHub', {
      body: d.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: d.id || undefined,
      data: { url: d.url || '/notifications' },
      });
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.url) || '/notifications';
  const url = new URL(raw, self.location.origin);
  if (url.origin !== self.location.origin) return; // jamais de redirection externe
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url.href).catch(() => {}); return c.focus(); }
      }
      return self.clients.openWindow(url.href);
    }),
  );
});
