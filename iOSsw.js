'use strict';
const cacheVersion = '1.2';
const staticAssets = [
    '/static/www/fallback-ios-pl.html',
    '/static/www/fallback-ios-eng.html',
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
        event.respondWith(
            fetch(event.request)
            .then(function(response) {
                    return response
                })
            .catch(function() {
                return caches.match(event.request)
                .then(res => {
                    if (res === undefined) {
                        return caches.open('staticCache-' + cacheVersion).then(function (cache) {
                            if (lang === 1 || lang === "1") {
                                return cache.match('/static/www/fallback-ios-pl.html');
                            } else {
                                return cache.match('/static/www/fallback-ios-eng.html');
                            }
                        })
                    }
                    return res;
                })
            })
          );
    });

self.addEventListener('message', function handler (event) {
    lang = event.data
});