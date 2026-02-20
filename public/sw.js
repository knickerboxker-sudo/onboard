// Sortir Service Worker
// Cache-first for static assets, Network-first for API and navigation

const CACHE_NAME = 'sortir-v1';

const STATIC_PATTERNS = [
  /\/_next\/static\//,
  /\/sortir-logo/,
  /\/manifest\.json$/,
  /\/apple-touch-icon/,
];

const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/auth\//,
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isStatic = STATIC_PATTERNS.some((p) => p.test(url.pathname));
  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some((p) => p.test(url.pathname));

  if (isStatic) {
    // Cache-first strategy
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  if (isNetworkFirst) {
    // Network-first strategy
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Default: network with cache fallback for navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/') || fetch('/'))
    );
  }
});
