var CACHE_NAME = '2021-12-18 11:25';
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
  "/hageda/favicon/favicon-48x48.png",
  "https://marmooo.github.io/fonts/textar-light.woff2",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/index.js",
  "https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/css/index.css",
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
