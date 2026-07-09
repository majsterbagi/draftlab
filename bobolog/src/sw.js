/* Service worker BoboLog — precache buildu + Web Push. Bez workbox (własna, mała logika). */
/* global self, caches, clients */

const CACHE = 'bobolog-v0.6';
// Wstrzykiwane przez vite-plugin-pwa (strategia injectManifest)
const MANIFEST = self.__WB_MANIFEST || [];

self.addEventListener('install', event => {
    const urls = MANIFEST.map(e => (typeof e === 'string' ? e : e.url));
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(urls)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // Nawigacja → network first, offline → index.html z cache
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req).catch(() =>
                caches.match('index.html', { ignoreSearch: true })
                    .then(r => r || caches.match('./', { ignoreSearch: true }))
            )
        );
        return;
    }

    // Zasoby własne (build) → cache first
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(req, { ignoreSearch: false }).then(hit => hit || fetch(req).then(res => {
                if (res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(req, copy));
                }
                return res;
            }))
        );
    }
    // Supabase i inne originy: bez SW — offline obsługuje kolejka w store.js
});

// ── Web Push ─────────────────────────────────────────────────────────────────

self.addEventListener('push', event => {
    let payload = { title: 'BoboLab', body: 'Masz nowe powiadomienie', url: './' };
    try { payload = { ...payload, ...event.data.json() }; } catch { /* pusty push — pokaż domyślne */ }
    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            data: { url: payload.url },
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || './';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            const open = list.find(c => c.url.includes('bobolog'));
            return open ? open.focus() : clients.openWindow(url);
        })
    );
});
