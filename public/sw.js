// Simple, safe cache-first service worker for a Vite PWA on GitHub Pages.
// Put this file in: public/sw.js
// Bump CACHE_VERSION any time you change files to force an update.
const CACHE_VERSION = 'v6';
const CACHE_NAME = `narsinha-sales-${CACHE_VERSION}`;

// Detect the deployed base path automatically (e.g., "/SaleRecords/")
const BASE = self.location.pathname.replace(/sw\.js$/, '');

const PRECACHE_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  // minimal icons; add more if you have them
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key))))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GET requests; network for others
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Try cache, then network; offline fallback to index.html for navigations
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Cache good responses
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => {
        // If navigating while offline, serve app shell
        if (req.mode === 'navigate') {
          return caches.match(BASE + 'index.html');
        }
      });
    })
  );
});
