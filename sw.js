'use strict';
/*******************************/
/** Mind that there is another */
/**     SW file - iOSsw.js     */
/**   for iOS specifically     */
/*******************************/
const cacheVersion = '1.21';
let cacheAdditional = '';
let maxImgsInCache = 100;
const staticAssets = [
    '/static/www/fallback-pl.html',
    '/static/www/fallback-eng.html',
    '/index.php',
    '/sw.js'
];

let lang = 1;

self.addEventListener('install', async function () {
    const cache = await caches.open('staticCache-' + cacheVersion);
    cache.addAll(staticAssets);
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
    //Remove old caches so that they don't pile up
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => { 
                    if (cache.split('-')[1] !== cacheVersion) {
                        //Clear the cache entry
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) {
    //don't apply SW for specific URLs 
    if(event.request.url.match(/.*\/admin|basket|order|cupboard|myAccount|access\/.*/g)) {
        event.respondWith(fetch(event.request)
            .catch(function(err) {
                return caches.open('staticCache-' + cacheVersion).then(function (cache) {
                    if (lang === 1 || lang === "1") {
                        return cache.match('/static/www/fallback-pl.html');
                    } else {
                        return cache.match('/static/www/fallback-eng.html');
                    }
                })
            })
        )
    }
    // Omit POST requests
    else if(event.request.method !== "GET") {
        event.respondWith(fetch(event.request))
    }
    //Omit WAVE requests sent by browser add-ons
    else if(!(event.request.url.indexOf('http') === 0) || !(event.request.url.indexOf('https') === 0)){
        event.respondWith(fetch(event.request))
    } else {
        //Net first approach
        event.respondWith(
            fetch(event.request)
            .then(function(response) {
                event.request.destination === 'image' ? 
                cacheAdditional = 'ImgCache-'+cacheVersion : 
                cacheAdditional = 'AssetCache-'+cacheVersion;
                return caches.open(cacheAdditional)
                  .then(function(cache) {
                    if(event.request.destination === 'image') {
                        cache.keys()
                        .then(keys => {
                            keys.length >= maxImgsInCache ? cache.delete(keys[0]) : null
                        })
                    }
                    cache.put(event.request, response.clone());
                    return response;
                  })
                })
            .catch(function() {
                return caches.match(event.request)
                .then(res => {
                    if (res === undefined) {
                        return caches.open('staticCache-' + cacheVersion).then(function (cache) {
                            if (lang === 1 || lang === "1") {
                                return cache.match('/static/www/fallback-pl.html');
                            } else {
                                return cache.match('/static/www/fallback-eng.html');
                            }
                        })
                    }
                    return res;
                })
            })
          );
    }
});

self.addEventListener('message', function handler (event) {
    lang = event.data
});