// Service Worker for AeroVista
const CACHE_NAME = 'aerovista-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/service-worker.js',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js'
];

// Install Event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache).catch(err => {
                    console.log('Error caching files:', err);
                });
            })
            .catch(err => console.log('Error opening cache:', err))
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Cache First Strategy with Network Fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(response => {
                            // Cache successful responses
                            if (response && response.status === 200) {
                                const clonedResponse = response.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(request, clonedResponse);
                                });
                            }
                            return response;
                        })
                        .catch(() => {
                            // Return offline page if available
                            return caches.match(request);
                        });
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
        return;
    }

    // Handle API requests - Network First, then Cache
    if (request.url.includes('/api/') || request.url.includes('googleapis.com')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, clonedResponse);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached version or offline fallback
                    return caches.match(request)
                        .then(response => {
                            return response || new Response('Offline - Service not available', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({
                                    'Content-Type': 'text/plain'
                                })
                            });
                        });
                })
        );
        return;
    }

    // Handle static assets - Cache First
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(request)
                    .then(response => {
                        // Cache valid responses
                        if (response && response.status === 200 && !request.url.includes('chrome-extension')) {
                            const clonedResponse = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, clonedResponse);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return cached version or a placeholder
                        if (request.destination === 'image') {
                            return caches.match('/images/placeholder.png');
                        }
                        return caches.match(request);
                    });
            })
            .catch(() => {
                // Final fallback
                if (request.destination === 'image') {
                    return new Response('', { status: 404 });
                }
                return new Response('Offline', { status: 503 });
            })
    );
});

// Message Handler for Updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background Sync for Form Submissions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(
            // Handle form sync here
            Promise.resolve()
        );
    }
});
