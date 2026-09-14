const CACHE_NAME = 'crumbly-b2b-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Just pass through requests. We only need a fetch handler to satisfy PWA requirements.
  event.respondWith(fetch(event.request));
});
