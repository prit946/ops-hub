const CACHE = 'pritos-v2';
const SHELL = [
  '/ops-hub/',
  '/ops-hub/index.html',
  '/ops-hub/drivecore.html',
  '/ops-hub/qa.html',
  '/ops-hub/gemini.html',
  '/ops-hub/context.html',
  '/ops-hub/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  // Network-first for CF Worker API calls
  if (e.request.url.includes('workers.dev') || e.request.url.includes('open-meteo') || e.request.url.includes('qrserver')) {
    return;
  }
  // Cache-first for shell files
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
