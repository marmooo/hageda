var CACHE_NAME="2022-06-27 00:05",urlsToCache=["/hageda/","/hageda/index.js","/hageda/data/1.xml","/hageda/data/2.xml","/hageda/data/3.xml","/hageda/mp3/bgm.mp3","/hageda/mp3/cat.mp3","/hageda/mp3/correct.mp3","/hageda/mp3/end.mp3","/hageda/mp3/keyboard.mp3","/hageda/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2","https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/simple-keyboard@3.4.52/build/index.min.js"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})