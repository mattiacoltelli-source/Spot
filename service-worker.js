const CACHE_NAME = "madeira-spot-planner-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./spots.js",
  "./ui.js",
  "./app.js",
  "./sail.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API sempre live (NO CACHE)
  if (
    request.url.includes("api.open-meteo.com") ||
    request.url.includes("marine-api.open-meteo.com") ||
    request.url.includes("google.com/maps")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // FILE APP → NETWORK FIRST (SEMPRE AGGIORNATI)
  if (
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/spots.js") ||
    url.pathname.endsWith("/ui.js") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/sail.js") ||
    url.pathname.endsWith("/manifest.json") ||
    url.pathname.endsWith("/icon-192.png") ||
    url.pathname.endsWith("/icon-512.png") ||
    url.pathname === "/" ||
    url.pathname.endsWith("/")
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return networkResponse;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  // STATIC ESTERNI (leaflet ecc.)
  if (request.url.includes("unpkg.com")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // DEFAULT
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).catch(() => {
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
        })
      );
    })
  );
});