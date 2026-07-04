const CACHE_NAME = 'food-guide-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Robust caching: try to cache each asset, but do not fail the installation if one fails
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Let standard API calls, dynamic modules, and hot-updates pass through directly to the network
  if (
    url.includes('/api/') || 
    url.includes('/node_modules/') || 
    url.includes('/src/') || 
    url.includes('/@') || 
    url.includes('hot-update') ||
    event.request.method !== 'GET'
  ) {
    return; // Pass through to network
  }
  
  // Network-First Strategy for HTML and assets to ensure instant updates in dev, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid standard GET responses of basic type
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network request fails (e.g., offline), try matching from cache
        return caches.match(event.request);
      })
  );
});
