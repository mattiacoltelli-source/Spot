const APP_CACHE = "travel-sail-app-v4";
const STATIC_CACHE = "travel-sail-static-v4";

// File locali dell'app da rendere disponibili offline
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./spots.js",
  "./ui.js",
  "./app.js",
  "./sail.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// File esterni stabili
const STATIC_FILES = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try {
      const appCache = await caches.open(APP_CACHE);
      await appCache.addAll(APP_FILES);

      const staticCache = await caches.open(STATIC_CACHE);
      await staticCache.addAll(STATIC_FILES);
    } catch (err) {
      // Non bloccare l'installazione se qualche risorsa esterna fallisce
      console.warn("Service worker install warning:", err);
    }
  })());

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys.map((key) => {
        if (key !== APP_CACHE && key !== STATIC_CACHE) {
          return caches.delete(key);
        }
      })
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  const isWeatherApi =
    url.hostname.includes("api.open-meteo.com") ||
    url.hostname.includes("marine-api.open-meteo.com");

  const isExternalStatic =
    url.hostname.includes("unpkg.com");

  const isNavigationRequest =
    request.mode === "navigate";

  const isLocalAppFile =
    url.origin === self.location.origin &&
    (
      url.pathname.endsWith("/") ||
      url.pathname.endsWith("/index.html") ||
      url.pathname.endsWith("/styles.css") ||
      url.pathname.endsWith("/spots.js") ||
      url.pathname.endsWith("/ui.js") ||
      url.pathname.endsWith("/app.js") ||
      url.pathname.endsWith("/sail.js") ||
      url.pathname.endsWith("/manifest.json") ||
      url.pathname.endsWith("/icon-192.png") ||
      url.pathname.endsWith("/icon-512.png")
    );

  // Meteo sempre live, senza cache
  if (isWeatherApi) {
    event.respondWith(fetch(request));
    return;
  }

  // Librerie esterne: cache first
  if (isExternalStatic) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  // Navigazione e file locali app: network first
  if (isNavigationRequest || isLocalAppFile) {
    event.respondWith(networkFirstApp(request));
    return;
  }

  // Fallback generico
  event.respondWith(genericFallback(request));
});

async function networkFirstApp(request) {
  const cache = await caches.open(APP_CACHE);

  try {
    const networkResponse = await fetch(request, { cache: "no-store" });

    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    const fallbackIndex =
      (await cache.match("./index.html")) ||
      (await cache.match("/index.html")) ||
      (await cache.match("./")) ||
      (await cache.match("/"));

    if (fallbackIndex) return fallbackIndex;

    throw error;
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) return cachedResponse;

  const networkResponse = await fetch(request);

  if (networkResponse && networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

async function genericFallback(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    return await fetch(request);
  } catch (error) {
    if (request.mode === "navigate") {
      const appCache = await caches.open(APP_CACHE);

      const fallbackIndex =
        (await appCache.match("./index.html")) ||
        (await appCache.match("/index.html")) ||
        (await appCache.match("./")) ||
        (await appCache.match("/"));

      if (fallbackIndex) return fallbackIndex;
    }

    throw error;
  }
}