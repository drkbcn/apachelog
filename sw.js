// Service Worker for Apache Log Viewer PWA
// Note: Version is duplicated here to avoid dependency on external files
const APP_VERSION = '2.4.1';
const CACHE_NAME = `apache-log-viewer-v${APP_VERSION}`;
const CACHE_VERSION = `v${APP_VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
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

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event - Version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[ServiceWorker] Files cached successfully');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache files:', error);
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
  console.log('[ServiceWorker] Activate event - Version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('apache-log-viewer-')) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[ServiceWorker] Old caches cleaned up');
      // Take control of all pages
      return self.clients.claim();
    })
    .then(() => {
      // Notify all clients about the update
      return self.clients.matchAll();
    })
    .then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: CACHE_VERSION
        });
      });
    })
  );
});

// Message handler for communication with main thread
self.addEventListener('message', event => {
  const { data } = event;
  
  switch (data.type) {
    case 'CHECK_FOR_UPDATE':
      checkForUpdates(event);
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION_INFO',
        version: CACHE_VERSION,
        cacheName: CACHE_NAME
      });
      break;
      
    default:
      console.log('[ServiceWorker] Unknown message type:', data.type);
  }
});

// Check for updates function
async function checkForUpdates(event) {
  try {
    console.log('[ServiceWorker] Checking for updates...');
    
    // Check if there's a newer version of the main files
    const response = await fetch('./js/version.js', { cache: 'no-cache' });
    
    if (response.ok) {
      const currentCache = await caches.open(CACHE_NAME);
      const cachedVersion = await currentCache.match('./js/version.js');
      
      if (!cachedVersion || response.headers.get('etag') !== cachedVersion.headers.get('etag')) {
        // New version detected
        console.log('[ServiceWorker] New version detected');
        
        // Notify the client
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            version: CACHE_VERSION
          });
        });
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Update check failed:', error);
  }
}
