// Service Worker for Offline Support
// Cache version - increment to force cache refresh
const CACHE_VERSION = 'v1';
const CACHE_NAME = `enchipai-cache-${CACHE_VERSION}`;

// Pages to cache immediately
const PAGES_TO_CACHE = [
  '/',
  '/admin',
  '/admin/bookings',
  '/admin/guests',
  '/admin/tents',
  '/admin/invoices',
  '/admin/analytics',
  '/admin/experiences',
  '/admin/inventory',
  '/admin/settings',
  '/admin/wildlife',
  '/admin/transfers',
  '/admin/channels',
  '/admin/emails',
  '/admin/notifications',
  '/admin/reports',
  '/admin/blog',
];

// Assets to cache
const ASSETS_TO_CACHE = [
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/icon.svg',
  '/apple-icon.png',
];

// API routes to cache (with longer TTL)
const API_CACHE_PATTERNS = [
  /\/api\/admin\/bookings/,
  /\/api\/admin\/guests/,
  /\/api\/admin\/tents/,
  /\/api\/admin\/invoices/,
  /\/api\/admin\/analytics/,
  /\/api\/admin\/experiences/,
  /\/api\/admin\/inventory/,
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching pages and assets');
      return cache.addAll([...PAGES_TO_CACHE, ...ASSETS_TO_CACHE]);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy: Cache First for static assets, Network First for API
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(request.url)) {
    event.respondWith(networkFirstWithCache(request));
  } else {
    // For pages: Network first, fallback to cache
    event.respondWith(networkFirstWithCache(request));
  }
});

// Cache First strategy - for static assets
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    // Return offline page if available
    const offlinePage = await cache.match('/offline');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Network First with Cache fallback - for pages and API
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      // Clone response before caching (responses can only be read once)
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    
    // Try cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // If it's a page request, try to return a cached version of the page
    if (request.mode === 'navigate') {
      const cachedPage = await cache.match('/admin');
      if (cachedPage) {
        return cachedPage;
      }
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'You are currently offline. Please check your connection.' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Helper functions
function isStaticAsset(url) {
  return (
    url.includes('/_next/static/') ||
    url.includes('/images/') ||
    url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i)
  );
}

function isApiRequest(url) {
  return url.includes('/api/');
}

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // This would sync any pending bookings when connection is restored
  console.log('[Service Worker] Syncing bookings...');
  // Implementation would go here
}

