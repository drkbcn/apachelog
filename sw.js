// Service Worker for Apache Log Viewer PWA
importScripts('./js/version.js'); // single source of the app version

const CACHE_NAME = `apache-log-viewer-v${self.APP_VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/parser.js',
  './js/script.js',
  './js/translations.js',
  './js/log-worker.js',
  './js/version.js',
  './lang/en.js',
  './lang/es.js',
  './lang/fr.js',
  './lang/de.js',
  './lang/it.js',
  './lang/pt.js',
  './lang/ca.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './manifest.json'
];

// Install: if any file fails to cache, the install fails and the previous version keeps running
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate: drop old caches and take control of open pages
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name !== CACHE_NAME && name.startsWith('apache-log-viewer-'))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: same-origin GETs are served from cache and refreshed in the background
// (stale-while-revalidate), so edits show up on the next load even without a version bump.
// The two CDN scripts (Tailwind, Alpine) are cached the same way so the app works offline.
const CDN_ORIGINS = ['https://cdn.tailwindcss.com', 'https://unpkg.com'];
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { origin } = new URL(request.url);
  if (request.method !== 'GET' || (origin !== self.location.origin && !CDN_ORIGINS.includes(origin))) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((response) => {
          if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
