const CACHE_NAME="2025-04-06 01:35",urlsToCache=["/hageda/","/hageda/index.js","/hageda/data/1.xml","/hageda/data/2.xml","/hageda/data/3.xml","/hageda/mp3/bgm.mp3","/hageda/mp3/cat.mp3","/hageda/mp3/correct.mp3","/hageda/mp3/end.mp3","/hageda/mp3/keyboard.mp3","/hageda/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})