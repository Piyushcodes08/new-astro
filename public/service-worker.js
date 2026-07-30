// Vahlay Astro - Service Worker
// Cache name with version for easy updates
const CACHE_NAME = 'vahlayastro-v1';

// Assets to pre-cache on install (critical static assets)
const PRECACHE_URLS = [
  '/',
  '/index.html'
];

const isHttpRequest = (request) => {
  try {
    const { protocol } = new URL(request.url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network-first strategy for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests or unsupported schemes
  if (request.method !== 'GET' || !isHttpRequest(request)) return;

  const url = new URL(request.url);

  // For same-origin navigation requests, use network-first (fallback to cache)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the navigation response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For static assets (js, css, images, fonts) - cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|svg|webp|png|jpg|jpeg|ico|json)$/) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/src/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          // Cache the fetched asset
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(request, clone);
            } catch {
              // Ignore unsupported or failed cache writes
            }
          });
          return response;
        });
      })
    );
    return;
  }

  // For external resources (Firebase, etc.) - network-only, don't cache
  // Default: network-only for everything else
  return;
});

