const APP_CACHE = "travel-sail-app-v2";
const STATIC_CACHE = "travel-sail-static-v2";

const STATIC_FILES = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_FILES)).catch(() => {})
  );
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

  const isAppFile =
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/spots.js") ||
    url.pathname.endsWith("/ui.js") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/sail.js") ||
    url.pathname.endsWith("/manifest.json") ||
    url.pathname.endsWith("/icon-192.png") ||
    url.pathname.endsWith("/icon-512.png");

  if (isWeatherApi) {
    event.respondWith(fetch(request));
    return;
  }

  if (isAppFile) {
    event.respondWith(networkFirstApp(request));
    return;
  }

  if (isExternalStatic) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

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
    const cached = await cache.match(request);
    if (cached) return cached;

    const fallbackIndex = await cache.match("./index.html");
    if (fallbackIndex) return fallbackIndex;

    throw error;
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function genericFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    return await fetch(request);
  } catch (error) {
    if (request.mode === "navigate") {
      const appCache = await caches.open(APP_CACHE);
      const fallbackIndex = await appCache.match("./index.html");
      if (fallbackIndex) return fallbackIndex;
    }
    throw error;
  }
}