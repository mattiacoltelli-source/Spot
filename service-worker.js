const CACHE_NAME = "madeira-planner-pro-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  const isAppShell =
    APP_SHELL.includes(url.href) ||
    APP_SHELL.includes(url.pathname) ||
    url.origin === location.origin;

  if (isAppShell) {
    event.respondWith(
      caches.match(request).then(cached => {
        return (
          cached ||
          fetch(request).then(response => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            return response;
          }).catch(() => caches.match("./index.html"))
        );
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => response)
      .catch(() => caches.match(request))
  );
});