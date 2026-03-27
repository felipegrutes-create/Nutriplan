const CACHE = 'mi-codigo-v3';
const ASSETS = [
  '/mi-codigo-app/',
  '/mi-codigo-app/index.html',
  '/mi-codigo-app/css/app.css',
  '/mi-codigo-app/js/app.js',
  '/mi-codigo-app/js/auth.js',
  '/mi-codigo-app/js/checkin.js',
  '/mi-codigo-app/js/progress.js',
  '/mi-codigo-app/js/recetas.js',
  '/mi-codigo-app/js/midia.js',
  '/mi-codigo-app/js/shopping.js',
  '/mi-codigo-app/js/messages.js',
  '/mi-codigo-app/js/backup.js',
  '/mi-codigo-app/js/cycle.js',
  '/mi-codigo-app/js/mas.js',
  '/mi-codigo-app/data/dicas.json',
  '/mi-codigo-app/data/plano.json',
  '/mi-codigo-app/data/curso.json',
  '/mi-codigo-app/data/suplementos.json',
  '/mi-codigo-app/data/exercicios.json',
  '/mi-codigo-app/data/recetas.json',
  '/mi-codigo-app/data/mensajes.json',
  '/mi-codigo-app/data/categorias-compras.json',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
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
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/mi-codigo-app/index.html')))
  );
});
