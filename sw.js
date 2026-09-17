const CACHE_NAME = 'crumbly-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/b2b-modal.css',
  '/assets/js/main.js',
  '/assets/js/b2b-modal.js',
  '/assets/img/brand-logo-square.png',
  '/assets/img/apple-touch-icon.png',
  '/assets/img/favicon-32x32.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch and update cache in background
          event.waitUntil(
            fetch(event.request).then((networkResponse) => {
              if(networkResponse && networkResponse.status === 200) {
                 caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            }).catch(() => {})
          );
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
  );
});
