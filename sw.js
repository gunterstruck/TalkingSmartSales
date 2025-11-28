// ============================================
// Podcast Player PWA - Service Worker
// Cache-on-Play/Download Strategy
// ============================================

const CACHE_VERSION = 'v1.02';
const CORE_CACHE = `podcast-core-${CACHE_VERSION}`;
const AUDIO_CACHE = `podcast-audio-${CACHE_VERSION}`;

// Core assets to cache on install
const CORE_ASSETS = [
    './',
    './index.html',
    './assets/app.js',
    './assets/style.css',
    './assets/episodes.json'
];

// Install Event - Cache core assets only
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CORE_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[Service Worker] Failed to cache core assets:', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old versions
                        if (cacheName !== CORE_CACHE && cacheName !== AUDIO_CACHE) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Audio files - Cache-first strategy
    if (url.pathname.endsWith('.mp3') || url.pathname.includes('/audio/')) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[Service Worker] Serving audio from cache:', url.pathname);
                        return cachedResponse;
                    }

                    // Not in cache - fetch from network
                    console.log('[Service Worker] Fetching audio from network:', url.pathname);
                    return fetch(request)
                        .then((networkResponse) => {
                            // Don't cache automatically on fetch - only when explicitly requested
                            return networkResponse;
                        })
                        .catch(() => {
                            console.log('[Service Worker] Audio fetch failed:', url.pathname);
                            return new Response('Audio not available offline', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
        return;
    }

    // Core assets - Cache-first with network fallback
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses
                        if (networkResponse.ok) {
                            return caches.open(CORE_CACHE)
                                .then((cache) => {
                                    cache.put(request, networkResponse.clone());
                                    return networkResponse;
                                });
                        }
                        return networkResponse;
                    });
            })
            .catch(() => {
                // Offline fallback
                if (request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Message Event - Handle cache requests from app
self.addEventListener('message', (event) => {
    const { type, url } = event.data;

    // Handle SKIP_WAITING message
    if (type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }

    // Handle CACHE_AUDIO message
    if (type === 'CACHE_AUDIO') {
        event.waitUntil(
            cacheAudio(url)
                .then(() => {
                    console.log('[Service Worker] Audio cached successfully:', url);

                    // Notify all clients
                    return self.clients.matchAll();
                })
                .then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'AUDIO_CACHED',
                            url: url
                        });
                    });
                })
                .catch((error) => {
                    console.error('[Service Worker] Failed to cache audio:', url, error);
                })
        );
    }
});

// Cache Audio Function
async function cacheAudio(url) {
    try {
        const cache = await caches.open(AUDIO_CACHE);

        // Check if already cached
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
            console.log('[Service Worker] Audio already cached:', url);
            return;
        }

        // Fetch and cache
        console.log('[Service Worker] Caching audio:', url);
        const response = await fetch(url);

        if (response.ok) {
            await cache.put(url, response);
            console.log('[Service Worker] Audio cached:', url);
        } else {
            throw new Error(`Failed to fetch audio: ${response.status}`);
        }
    } catch (error) {
        console.error('[Service Worker] Cache audio error:', error);
        throw error;
    }
}

// Background Sync (optional - for queued downloads)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-audio-downloads') {
        console.log('[Service Worker] Background sync triggered');

        event.waitUntil(
            // Process queued downloads here if needed
            Promise.resolve()
        );
    }
});

console.log('[Service Worker] Script loaded');

