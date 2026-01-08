/* ===========================================
   Service Worker for Dental Institute PWA
   =========================================== */

const CACHE_NAME = 'dental-institute-v2';
const BASE_PATH = '/laughing-chainsaw';
const OFFLINE_URL = BASE_PATH + '/offline.html';

// Resources to cache on install
const PRECACHE_RESOURCES = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/about.html',
    BASE_PATH + '/services.html',
    BASE_PATH + '/appointments.html',
    BASE_PATH + '/contact.html',
    BASE_PATH + '/patient-portal.html',
    BASE_PATH + '/emergency.html',
    BASE_PATH + '/virtual-consultation.html',
    BASE_PATH + '/gallery.html',
    BASE_PATH + '/blog.html',
    BASE_PATH + '/insurance.html',
    BASE_PATH + '/css/style.css',
    BASE_PATH + '/js/script.js',
    BASE_PATH + '/js/admin.js',
    BASE_PATH + '/js/patient-portal.js',
    BASE_PATH + '/js/chat-widget.js',
    BASE_PATH + '/js/seo-enhancements.js',
    BASE_PATH + '/favicon.svg',
    BASE_PATH + '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Pre-caching resources');
                return cache.addAll(PRECACHE_RESOURCES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached response and fetch update in background
                    event.waitUntil(
                        fetch(event.request)
                            .then(response => {
                                if (response && response.status === 200) {
                                    const responseClone = response.clone();
                                    caches.open(CACHE_NAME)
                                        .then(cache => cache.put(event.request, responseClone));
                                }
                            })
                            .catch(() => {/* Network failed, cached version served */})
                    );
                    return cachedResponse;
                }

                // Not in cache, try network
                return fetch(event.request)
                    .then(response => {
                        // Cache successful responses
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseClone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Network failed, try to return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for appointment bookings
self.addEventListener('sync', event => {
    if (event.tag === 'sync-appointments') {
        event.waitUntil(syncAppointments());
    }
});

async function syncAppointments() {
    const pendingAppointments = await getPendingAppointments();
    for (const appointment of pendingAppointments) {
        try {
            await fetch(BASE_PATH + '/api/appointments', {
                method: 'POST',
                body: JSON.stringify(appointment),
                headers: { 'Content-Type': 'application/json' }
            });
            await removePendingAppointment(appointment.id);
        } catch (error) {
            console.error('Failed to sync appointment:', error);
        }
    }
}

// Push notification handling
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from Dental Institute',
        icon: BASE_PATH + '/icons/icon-192x192.png',
        badge: BASE_PATH + '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'view', title: 'View' },
            { action: 'close', title: 'Close' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Dental Institute', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(BASE_PATH + '/patient-portal.html')
        );
    }
});

// Utility functions for IndexedDB operations
async function getPendingAppointments() {
    // Implementation would use IndexedDB
    return [];
}

async function removePendingAppointment(id) {
    // Implementation would use IndexedDB
}

console.log('[ServiceWorker] Loaded');
