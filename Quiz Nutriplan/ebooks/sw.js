const CACHE = 'codigo-hormonal-v1';
const ASSETS = [
  './',
  './portal.html',
  './comience-aqui.html',
  './200-recetas.html',
  './panes-vol1.html',
  './panes-vol2.html',
  './recetas-quema-grasa.html',
  './recetas-fitness-vol1.html',
  './recetas-fitness-vol2.html',
  './plan-31-dias.html',
  './guia-alimentos.html',
  './tabla-ig.html',
  './checklist.html',
  './mitos-verdades.html',
  './preview-bonos.html',
  './bono-avena.html',
  './bono-bebidas.html',
  './bono-carnes.html',
  './bono-desparasitacion.html',
  './bono-ejercicios.html',
  './bono-emociones.html',
  './bono-frutas.html',
  './bono-jugos.html',
  './bono-masa-muscular.html',
  './bono-navidad.html',
  './data/00-comience-aqui.json',
  './data/01-panes-vol1.json',
  './data/02-panes-vol2.json',
  './data/03-recetas-quema-grasa.json',
  './data/04-recetas-fitness-vol1.json',
  './data/05-recetas-fitness-vol2.json',
  './data/06-plan-31-dias.json',
  './data/07-guia-alimentos.json',
  './data/08-tabla-indice-glucemico.json',
  './data/09-checklist-hipoglucemia.json',
  './data/10-mitos-verdades-insulina.json',
  './data/bonos-avena.json',
  './data/bonos-bebidas.json',
  './data/bonos-carnes.json',
  './data/bonos-desparasitacion.json',
  './data/bonos-ejercicios.json',
  './data/bonos-emociones.json',
  './data/bonos-frutas.json',
  './data/bonos-jugos.json',
  './data/bonos-masa-muscular.json',
  './data/bonos-navidad.json',
  './data/feed.json',
  './data/comunidad-seed.json',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE).then(c => c.put(e.request, clone));
            }
            return response;
          })
          .catch(() => caches.match('./portal.html'));
      })
  );
});
