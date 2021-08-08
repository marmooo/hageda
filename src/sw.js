var CACHE_NAME = '2021-08-09 00:08';
var urlsToCache = [
  '/hageda/',
  '/hageda/index.js',
  '/hageda/1.xml',
  '/hageda/2.xml',
  '/hageda/3.xml',
  '/hageda/bgm.mp3',
  '/hageda/cat.mp3',
  '/hageda/correct.mp3',
  '/hageda/end.mp3',
  '/hageda/keyboard.mp3',
  '/kana-meiro/favicon/favicon-48x48.png',
  'https://marmooo.github.io/fonts/textar-light.woff2',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/index.js',
  'https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/css/index.css',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
