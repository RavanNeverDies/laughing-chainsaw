/* ===========================================
   Service Worker for Dental Institute PWA
   =========================================== */

const CACHE_NAME = 'dental-institute-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache on install
const PRECACHE_RESOURCES = [
    '/',
    '/index.html',
    '/about.html',
    '/services.html',
    '/appointments.html',
    '/contact.html',
    '/patient-portal.html',
    '/emergency.html',
    '/virtual-consultation.html',
    '/gallery.html',
    '/blog.html',
    '/insurance.html',
    '/css/style.css',
    '/js/script.js',
    '/js/admin.js',
    '/js/patient-portal.js',
    '/js/chat-widget.js',
    '/favicon.svg',
    '/manifest.json'
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
            await fetch('/api/appointments', {
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
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
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
            clients.openWindow('/patient-portal.html')
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
