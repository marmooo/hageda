var CACHE_NAME = '2020-08-24 21:40';
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
  'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.slim.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.min.js',
  'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.min.js',
  'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js',
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
