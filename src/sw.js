var CACHE_NAME = '2021-04-29 13:00';
var urlsToCache = [
  '/hageda/',
  '/hageda/1.xml',
  '/hageda/2.xml',
  '/hageda/3.xml',
  '/hageda/bgm.mp3',
  '/hageda/cat.mp3',
  '/hageda/correct.mp3',
  '/hageda/end.mp3',
  '/hageda/index.js',
  '/hageda/keyboard.mp3',
  'https://marmooo.github.io/fonts/textar-light.ttf',
  'https://marmooo.github.io/fonts/textar-light.woff',
  'https://marmooo.github.io/fonts/textar-light.woff2',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.slim.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js',
  'https://polyfill.io/v3/polyfill.min.js?features=Promise%2Cfetch',
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
