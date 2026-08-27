const CACHE_NAME = "codecraft-python-runtime-314.0.5";
const RUNTIME_PATH = "/pyodide-314.0.5/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then((names) => Promise.all(
      names
        .filter((name) => name.startsWith("codecraft-python-runtime-") && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    )),
  ]));
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(RUNTIME_PATH)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) return cached;

    const response = await fetch(event.request);
    if (response.ok) event.waitUntil(cache.put(event.request, response.clone()));
    return response;
  })());
});
