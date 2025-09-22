// Simple cache-first service worker tailored for GitHub Pages subpath.
// Bump the CACHE version when you change files to force an update.
const CACHE = 'narsinha-sales-cache-v4';

// Detect the base path automatically (e.g., "/SaleRecords/")
const BASE = self.location.pathname.replace(/sw\.js$/, '');

// Minimal app shell to pre-cache. (Vite-hashed files are handled at runtime.)
const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GET requests; network for others
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Put a copy in cache for future (skip opaque/error responses)
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => {
        // Optional: offline fallback for root
        if (req.mode === 'navigate') return caches.match(BASE + 'index.html');
      });
    })
  );
});
