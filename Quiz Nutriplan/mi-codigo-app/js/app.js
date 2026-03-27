const App = (() => {
  let data = {};
  let currentTab = 'home';

  async function loadData() {
    const files = ['dicas', 'plano', 'curso', 'suplementos', 'exercicios', 'recetas', 'mensajes', 'categoriasCompras'];
    await Promise.all(files.map(async f => {
      try {
        const filename = f === 'categoriasCompras' ? 'categorias-compras' : f;
        const r = await fetch(`data/${filename}.json`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        data[f] = await r.json();
      } catch (err) {
        console.warn('Failed to load data/' + f + '.json:', err.message);
        data[f] = f === 'categoriasCompras' ? {} : [];
      }
    }));
  }

  function navigate(tab) {
    if (currentTab === tab && tab !== 'midia') return;
    currentTab = tab;

    document.querySelectorAll('.nav-btn, .nav-fab').forEach(function(b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    const titles = {
      home: 'Mi Código',
      progress: 'Mi Progreso',
      midia: '☀️ Mi Día',
      compras: '🛒 Mi Lista',
      mas: 'Más'
    };
    const headerEl = document.getElementById('headerTitle');
    if (headerEl) headerEl.textContent = titles[tab] || 'Mi Código';

    const main = document.getElementById('tabContent');
    if (!main) return;
    main.scrollTop = 0;
    renderTab(tab, main);
  }

  function renderTab(tab, container) {
    const renders = {
      home: renderHome,
      progress: renderProgress,
      midia: function(el) { MiDia.initState(); MiDia.render(el); },
      compras: function(el) { Shopping.render(el); },
      mas: function(el) { Mas.render(el); },
      recetas: renderRecetas
    };
    const fn = renders[tab];
    if (fn) fn(container);
  }

  function getDicaHoje() {
    if (!data.dicas || !data.dicas.length) return 'Cargando tu dica de hoy...';
    const idx = new Date().getDate() % data.dicas.length;
    const item = data.dicas[idx];
    return item.texto || item;
  }

  function _getDailyRecipe(category, dayOffset) {
    const recetas = (data.recetas || []).filter(function(r) { return r.categoria === category; });
    if (!recetas.length) return null;
    // Use day-of-year + offset to rotate daily, different per meal
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var dayOfYear = Math.floor((now - start) / 86400000);
    var idx = (dayOfYear + dayOffset * 7) % recetas.length;
    return recetas[idx];
  }

  function _renderDailyMenu() {
    var meals = [
      { cat: 'desayuno', label: 'Desayuno', emoji: '🍳', offset: 0 },
      { cat: 'jugo',     label: 'Jugo/Batido', emoji: '🥤', offset: 1 },
      { cat: 'almuerzo', label: 'Almuerzo', emoji: '🥗', offset: 2 },
      { cat: 'snack',    label: 'Snack', emoji: '🍎', offset: 3 },
      { cat: 'cena',     label: 'Cena', emoji: '🍽️', offset: 4 }
    ];

    var html = '<div class="card" style="padding:16px">' +
      '<div style="margin-bottom:12px">' +
        '<div style="font-size:15px;font-weight:800">🍴 Tu Menú de Hoy</div>' +
        '<div style="font-size:11px;color:var(--texto-sub);margin-top:2px">Seleccionado para ti</div>' +
      '</div>';

    var menuKey = 'mc_menu_' + new Date().toISOString().split('T')[0];
    var customMenu = null;
    try { customMenu = JSON.parse(localStorage.getItem(menuKey)); } catch(e) {}

    meals.forEach(function(meal) {
      var recipe = null;
      if (customMenu && customMenu[meal.cat]) {
        recipe = (data.recetas || []).find(function(r) { return r.id === customMenu[meal.cat]; });
      }
      if (!recipe) recipe = _getDailyRecipe(meal.cat, meal.offset);
      if (!recipe) return;

      html += '<div onclick="Recetas.showDetail(' + recipe.id + ')" style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--borda);cursor:pointer">' +
        '<div style="font-size:22px;width:32px;text-align:center">' + meal.emoji + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:10px;color:var(--verde);font-weight:700;text-transform:uppercase;letter-spacing:.5px">' + meal.label + '</div>' +
          '<div style="font-size:13px;font-weight:600;color:var(--texto)">' + recipe.nombre + '</div>' +
        '</div>' +
        '<div style="font-size:14px;color:var(--texto-sub)">›</div>' +
      '</div>';
    });

    html += '<div style="text-align:center;margin-top:10px">' +
      '<div style="font-size:11px;color:var(--texto-sub)">Toca un plato para ver la receta</div>' +
    '</div></div>';

    return html;
  }

  function renderHome(el) {
    const ud = Auth.getUserData();
    const streak = Checkin.getStreak();
    const lastWeight = Checkin.getLastWeight();
    const completion = MiDia.getCompletionCount();
    const todayKey = new Date().toISOString().split('T')[0];
    const checkin = Checkin.getAll()[todayKey] || {};
    const waterToday = (JSON.parse(localStorage.getItem('mc_water') || '{}'))[todayKey] || 0;
    const settings = JSON.parse(localStorage.getItem('mc_settings') || '{}');
    const waterGoal = settings.waterGoal || 8;

    const headerStreak = document.getElementById('headerStreak');
    if (headerStreak) headerStreak.textContent = '🔥 ' + streak;

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? '¡Buenos días!' : hour < 18 ? '¡Buenas tardes!' : '¡Buenas noches!';
    const dateStr = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

    el.innerHTML = `
      <div class="section">
        <div style="margin-bottom:16px">
          <div style="font-size:20px;font-weight:800">☀️ ${greeting}</div>
          <div style="font-size:13px;color:var(--texto-sub);margin-top:2px">${dateStr}</div>
        </div>

        <!-- Quick stats -->
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
            <div style="font-size:20px">💧</div>
            <div style="font-size:18px;font-weight:800;color:var(--verde)">${waterToday}/${waterGoal}</div>
            <div style="font-size:10px;color:var(--texto-sub)">vasos</div>
          </div>
          <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
            <div style="font-size:20px">⚖️</div>
            <div style="font-size:18px;font-weight:800;color:var(--rosa)">${lastWeight || '--'}</div>
            <div style="font-size:10px;color:var(--texto-sub)">kg</div>
          </div>
          <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
            <div style="font-size:20px">${checkin.humor === 'Genial' ? '🤩' : checkin.humor === 'Bien' ? '😊' : checkin.humor === 'Mal' ? '😢' : '😐'}</div>
            <div style="font-size:18px;font-weight:800;color:var(--dourado)">${checkin.humor || '--'}</div>
            <div style="font-size:10px;color:var(--texto-sub)">humor</div>
          </div>
        </div>

        <!-- Mi Día progress card -->
        <div class="card" style="cursor:pointer" onclick="App.navigate('midia')">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-weight:700;font-size:14px">Mi Día</span>
            <span style="font-size:12px;color:var(--verde);font-weight:600">${completion.done}/${completion.total} ✓</span>
          </div>
          <div style="background:var(--borda);border-radius:8px;height:8px;margin-bottom:12px">
            <div style="background:linear-gradient(90deg,var(--verde),var(--verde-dark));width:${Math.round((completion.done / completion.total) * 100)}%;height:100%;border-radius:8px;transition:width .3s"></div>
          </div>
          <div style="font-size:12px;color:var(--verde);font-weight:600">Toca para completar tu día →</div>
        </div>

        <!-- Streak -->
        <div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:rgba(201,146,42,.2)">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:32px">🔥</div>
            <div>
              <div style="font-size:24px;font-weight:900;color:var(--dourado)">${streak}</div>
              <div style="font-size:11px;color:#92400e">días seguidos</div>
            </div>
          </div>
        </div>

        <!-- Daily menu suggestion -->
        ${_renderDailyMenu()}

        <!-- Daily tip -->
        <div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:rgba(201,146,42,.2)">
          <div style="font-size:11px;font-weight:700;color:var(--dourado);margin-bottom:4px">💡 CONSEJO DEL DÍA</div>
          <div style="font-size:13px;color:#78350f;line-height:1.4">${getDicaHoje()}</div>
        </div>
      </div>`;
  }

  function showLesson(idx) {
    const lesson = (data.curso || [])[idx];
    if (!lesson) return;
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', lesson.titulo);
    modal.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:300;overflow-y:auto;max-width:480px;margin:0 auto';
    modal.innerHTML = `
      <div style="padding:20px">
        <button onclick="this.closest('[role=dialog]').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;margin-bottom:16px;color:var(--texto)" aria-label="Volver">←</button>
        <div style="font-size:11px;font-weight:700;color:var(--verde);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Lección ${idx + 1}</div>
        <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">${lesson.titulo}</h2>
        <div style="font-size:14px;color:var(--texto);line-height:1.8">${(lesson.contenido || '').replace(/\n/g, '<br>')}</div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async function init() {
    const authed = Auth.init();
    if (!authed) return;
    await loadData();
    // Navigate to home without the same-tab guard (initial load)
    currentTab = '';
    navigate('home');
  }

  function _refreshMenu() {
    var menuKey = 'mc_menu_' + new Date().toISOString().split('T')[0];
    var cats = ['desayuno', 'jugo', 'almuerzo', 'snack', 'cena'];
    var custom = {};
    cats.forEach(function(cat) {
      var recetas = (data.recetas || []).filter(function(r) { return r.categoria === cat; });
      if (recetas.length) {
        custom[cat] = recetas[Math.floor(Math.random() * recetas.length)].id;
      }
    });
    localStorage.setItem(menuKey, JSON.stringify(custom));
    navigate('home');
  }

  return { init, navigate, showLesson, getData: function() { return data; }, _refreshMenu: _refreshMenu };
})();

document.addEventListener('DOMContentLoaded', App.init);
