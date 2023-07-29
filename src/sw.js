var CACHE_NAME = "2023-07-29 10:17";
var urlsToCache = [
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

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
