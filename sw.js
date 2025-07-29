const CACHE_NAME = 'apache-log-viewer-v2.4.0';
const urlsToCache = [
  '.',
  'index.html',
  'css/styles.css',
  'js/script.js',
  'js/translations.js',
  'js/log-worker.js',
  'lang/en.js',
  'lang/es.js',
  'lang/fr.js',
  'lang/de.js',
  'lang/it.js',
  'lang/pt.js',
  'lang/ca.js',
  'icons/icon-192.svg',
  'icons/icon-512.svg',
  'manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
