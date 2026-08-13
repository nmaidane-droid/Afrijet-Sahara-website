/* Afrijet Sahara — service worker en stratégie RÉSEAU D'ABORD.
   Le cache ne sert que si le réseau est injoignable : un visiteur en ligne
   reçoit toujours la version fraîche du serveur. C'est cette règle qui rend
   la migration vers un autre hébergeur sans danger — aucun client ne restera
   bloqué sur l'ancienne version.
   Pour retirer complètement le service worker le jour de la migration,
   remplacer le contenu de ce fichier par le bloc de désinscription fourni. */
var VERSION = 'afrijet-v1';
var CACHE = 'secours-' + VERSION;

var SECOURS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SECOURS.map(function (f) {
        return c.add(f)['catch'](function () { /* fichier absent : on ignore */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(noms.map(function (n) {
        if (n !== CACHE) { return caches.delete(n); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') { return; }
  if (new URL(req.url).origin !== location.origin) { return; }

  e.respondWith(
    fetch(req).then(function (rep) {
      var copie = rep.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copie); });
      return rep;
    })['catch'](function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
