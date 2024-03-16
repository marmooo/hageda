const CACHE_NAME = "2024-03-16 10:30";
const urlsToCache = [
  "/hageda/",
  "/hageda/index.js",
  "/hageda/data/1.xml",
  "/hageda/data/2.xml",
  "/hageda/data/3.xml",
  "/hageda/mp3/bgm.mp3",
  "/hageda/mp3/cat.mp3",
  "/hageda/mp3/correct.mp3",
  "/hageda/mp3/end.mp3",
  "/hageda/mp3/keyboard.mp3",
  "/hageda/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
  "https://cdn.jsdelivr.net/npm/simple-keyboard@3.4.52/build/index.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
