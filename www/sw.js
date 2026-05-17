const CACHE_NAME = 'vn-catering-v1';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './catering-b.ico',
    './location.png',
    './waiter.png',
    './bar.png',
    './cook.png',
    './clean.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    if (url.includes('events_data.json') || url.includes('staff_database.json')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
        );
    }
});
