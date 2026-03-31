const CACHE = 'codigo-hormonal-v13';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (res.ok && e.request.method === 'GET') {
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request).then(function(r) {
        return r || caches.match('./portal.html');
      });
    })
  );
});
