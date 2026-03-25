const CACHE_NAME = "travel-sail-cache-v12";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./ui.js",
  "./sail.js",
  "./spots.js",
  "./manifest.json",
  "./icon-192.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

// ─────────────────────────────────────────
// INSTALL
// ─────────────────────────────────────────
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ─────────────────────────────────────────
// ACTIVATE
// ─────────────────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────
// FETCH STRATEGY
// ─────────────────────────────────────────
self.addEventListener("fetch", event => {
  const req = event.request;

  // SOLO GET
  if (req.method !== "GET") return;

  // API → network first
  if (req.url.includes("open-meteo.com")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // HTML → network first
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // STATIC → cache first
  event.respondWith(cacheFirst(req));
});

// ─────────────────────────────────────────
// STRATEGIE
// ─────────────────────────────────────────

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch {
    return cached;
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    return cached || new Response("Offline", { status: 503 });
  }
}