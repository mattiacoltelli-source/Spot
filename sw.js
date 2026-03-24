const CACHE_NAME = "travel-sail-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./ui.js",
  "./sail.js",
  "./spots.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ─── INSTALL ─────────────────────────────────────

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ─── ACTIVATE ────────────────────────────────────

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH STRATEGY ──────────────────────────────
// Network first (sempre aggiornato) + fallback cache

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200) return response;

        const clone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});