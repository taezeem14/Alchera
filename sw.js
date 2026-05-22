const CACHE_NAME = 'alchera-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.css',
  './app.js',
  './manifest.json',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap',
  'https://fonts.gstatic.com/s/instrumentserif/v2/Cl7wUj4fafRJmRzK64QLG284Jm31q-XwE8E.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.1/marked.min.js'
];

// Install Event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - cache-first with network fallback
self.addEventListener('fetch', (event) => {
  // Skip OpenRouter API calls
  if (event.request.url.includes('openrouter.ai')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache new successful requests for our domain
        if (
          networkResponse && 
          networkResponse.status === 200 && 
          (event.request.url.startsWith(self.location.origin) || event.request.url.includes('fonts.gstatic.com'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation if offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
