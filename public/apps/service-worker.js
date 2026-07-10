const CACHE_NAME = 'suntrack-v2';
const APP_SHELL = [
    './SunTrack.html',
    './suntrack.webmanifest',
    '../favicon.svg'
];
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js',
    'https://unpkg.com/lucide@0.462.0/dist/umd/lucide.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.addAll(APP_SHELL);
            await Promise.allSettled(EXTERNAL_ASSETS.map(asset => cache.add(asset)));
            await self.skipWaiting();
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames
                .filter(cacheName => cacheName !== CACHE_NAME)
                .map(cacheName => caches.delete(cacheName))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    const isLocationApi = url.hostname.includes('nominatim');
    const isStaticRequest = url.origin === self.location.origin || EXTERNAL_ASSETS.includes(request.url);

    if (isLocationApi) {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    if (!isStaticRequest) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match('./SunTrack.html'))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => cached || fetch(request).then(response => {
            if (response.ok || response.type === 'opaque') {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
        }))
    );
});
