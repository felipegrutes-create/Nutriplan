/* =====================
   Recetas Module
   ===================== */
const Recetas = (() => {
  const LS_FAV = 'mc_favs';
  let currentFilter = 'todas';
  let searchQuery = '';

  function getFavs() {
    try { return JSON.parse(localStorage.getItem(LS_FAV)) || []; }
    catch(e) { return []; }
  }

  function toggleFav(id) {
    const favs = getFavs();
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id);
    else favs.splice(idx, 1);
    localStorage.setItem(LS_FAV, JSON.stringify(favs));
    return favs.includes(id);
  }

  function isFav(id) {
    return getFavs().includes(id);
  }

  function getCategoryLabel(cat) {
    var labels = {
      desayuno: 'Desayuno',
      almuerzo: 'Almuerzo',
      cena: 'Cena',
      snack: 'Snack',
      jugo: 'Jugo'
    };
    return labels[cat] || cat;
  }

  function getCategoryColor(cat) {
    var colors = {
      desayuno: '#F59E0B',
      almuerzo: '#2E7D52',
      cena: '#6366F1',
      snack: '#EC4899',
      jugo: '#06B6D4'
    };
    return colors[cat] || '#6B7280';
  }

  function getRecetaDelDia(recetas) {
    if (!recetas || !recetas.length) return null;
    var idx = new Date().getDate() % recetas.length;
    return recetas[idx];
  }

  function filterRecetas(recetas) {
    var list = recetas || [];
    if (currentFilter === 'favs') {
      var favs = getFavs();
      list = list.filter(function(r) { return favs.indexOf(r.id) !== -1; });
    } else if (currentFilter !== 'todas') {
      list = list.filter(function(r) { return r.categoria === currentFilter; });
    }
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      list = list.filter(function(r) {
        return r.nombre.toLowerCase().indexOf(q) !== -1 ||
          (r.ingredientes || []).some(function(ing) { return ing.toLowerCase().indexOf(q) !== -1; });
      });
    }
    return list;
  }

  function renderCards(recetas, container) {
    var filtered = filterRecetas(recetas);
    var listEl = container.querySelector('#recetasList');
    var countEl = container.querySelector('#recetasCount');
    if (countEl) countEl.textContent = filtered.length + ' receta' + (filtered.length !== 1 ? 's' : '');
    if (!listEl) return;

    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:32px 16px;color:var(--texto-sub)">' +
        '<div style="font-size:32px;margin-bottom:8px" aria-hidden="true">' +
        (currentFilter === 'favs' ? '💛' : '🔍') + '</div>' +
        '<div style="font-size:14px;font-weight:700;margin-bottom:4px">' +
        (currentFilter === 'favs' ? 'Sin favoritos aún' : 'Sin resultados') + '</div>' +
        '<div style="font-size:12px">' +
        (currentFilter === 'favs' ? 'Toca el corazón en cualquier receta para guardarla' : 'Prueba con otra palabra') +
        '</div></div>';
      return;
    }

    listEl.innerHTML = filtered.map(function(r) {
      var fav = isFav(r.id);
      var ingCount = (r.ingredientes && r.ingredientes.length) ? r.ingredientes.length + ' ingr.' : '';
      var stepsCount = (r.preparacion && r.preparacion.length) ? r.preparacion.length + ' pasos' : '';
      var meta = [ingCount, stepsCount].filter(Boolean).join(' · ');
      return '<div class="card" style="padding:12px;cursor:pointer;position:relative" onclick="Recetas.showDetail(' + r.id + ')">' +
        '<div style="display:flex;align-items:flex-start;gap:10px">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
              '<span style="font-size:9px;font-weight:700;color:#fff;background:' + getCategoryColor(r.categoria) +
                ';padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap">' +
                getCategoryLabel(r.categoria) + '</span>' +
            '</div>' +
            '<div style="font-weight:700;font-size:13px;line-height:1.3;margin-bottom:2px">' + r.nombre + '</div>' +
            '<div style="font-size:11px;color:var(--texto-sub)">' + meta + '</div>' +
          '</div>' +
          '<button onclick="event.stopPropagation();Recetas.toggleAndRefresh(' + r.id + ')" ' +
            'style="background:none;border:none;font-size:20px;cursor:pointer;padding:4px;flex-shrink:0" ' +
            'aria-label="' + (fav ? 'Quitar de favoritos' : 'Agregar a favoritos') + '">' +
            (fav ? '❤️' : '🤍') +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  return {
    render: function(el) {
      var recetas = App.getData().recetas || [];
      var recetaDia = getRecetaDelDia(recetas);
      var categories = [
        { key: 'todas', label: 'Todas' },
        { key: 'desayuno', label: 'Desayuno' },
        { key: 'almuerzo', label: 'Almuerzo' },
        { key: 'cena', label: 'Cena' },
        { key: 'snack', label: 'Snack' },
        { key: 'jugo', label: 'Jugo' },
        { key: 'favs', label: '❤️ Favs' }
      ];

      el.innerHTML =
        '<div class="section" style="padding-bottom:8px">' +
          '<div style="position:relative;margin-bottom:12px">' +
            '<input type="search" id="recetasSearch" placeholder="Buscar receta o ingrediente..." ' +
              'style="width:100%;padding:10px 12px 10px 36px;border:1px solid var(--borda);border-radius:var(--radius);font-size:14px;font-family:inherit;background:#fff;outline:none" ' +
              'oninput="Recetas.onSearch(this.value)">' +
            '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none" aria-hidden="true">🔍</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch" role="tablist" aria-label="Filtrar por categoría">' +
            categories.map(function(c) {
              var active = currentFilter === c.key;
              return '<button role="tab" aria-selected="' + active + '" onclick="Recetas.setFilter(\'' + c.key + '\')" ' +
                'style="white-space:nowrap;padding:6px 12px;border-radius:99px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid ' +
                (active ? 'var(--verde)' : 'var(--borda)') + ';background:' +
                (active ? 'var(--verde)' : '#fff') + ';color:' +
                (active ? '#fff' : 'var(--texto-sub)') + '">' +
                c.label + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        (recetaDia && currentFilter === 'todas' && !searchQuery ? (
          '<div class="section" style="padding-top:0;padding-bottom:8px">' +
            '<div class="label">Receta del Día</div>' +
            '<div class="card" style="background:var(--verde-light);border-color:#BBF7D0;cursor:pointer;padding:12px" onclick="Recetas.showDetail(' + recetaDia.id + ')">' +
              '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
                '<span style="font-size:9px;font-weight:700;color:#fff;background:' + getCategoryColor(recetaDia.categoria) +
                  ';padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.5px">' +
                  getCategoryLabel(recetaDia.categoria) + '</span>' +
              '</div>' +
              '<div style="font-weight:700;font-size:14px;margin-bottom:2px">' + recetaDia.nombre + '</div>' +
              '<div style="font-size:12px;color:var(--verde);font-weight:600">Ver receta →</div>' +
            '</div>' +
          '</div>'
        ) : '') +

        '<div class="section" style="padding-top:0">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
            '<span id="recetasCount" style="font-size:12px;color:var(--texto-sub);font-weight:600"></span>' +
          '</div>' +
          '<div id="recetasList"></div>' +
        '</div>';

      renderCards(recetas, el);

      var searchInput = document.getElementById('recetasSearch');
      if (searchInput && searchQuery) searchInput.value = searchQuery;
    },

    setFilter: function(key) {
      currentFilter = key;
      var el = document.getElementById('tabContent');
      if (el) this.render(el);
    },

    onSearch: function(val) {
      searchQuery = val.trim();
      var recetas = App.getData().recetas || [];
      var el = document.getElementById('tabContent');
      if (el) renderCards(recetas, el);
    },

    toggleAndRefresh: function(id) {
      toggleFav(id);
      var recetas = App.getData().recetas || [];
      var el = document.getElementById('tabContent');
      if (el) renderCards(recetas, el);
    },

    showDetail: function(id) {
      var recetas = App.getData().recetas || [];
      var r = recetas.find(function(x) { return x.id === id; });
      if (!r) return;
      var fav = isFav(id);

      var modal = document.createElement('div');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', r.nombre);
      modal.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:300;overflow-y:auto;max-width:480px;margin:0 auto';

      var hasIngredients = r.ingredientes && r.ingredientes.length > 0;
      var hasSteps = r.preparacion && r.preparacion.length > 0;

      modal.innerHTML =
        '<div style="padding:20px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
            '<button onclick="this.closest(\'[role=dialog]\').remove()" ' +
              'style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--texto)" aria-label="Volver">←</button>' +
            '<button onclick="Recetas.toggleFavInDetail(' + id + ',this)" ' +
              'style="background:none;border:none;font-size:24px;cursor:pointer" ' +
              'aria-label="' + (fav ? 'Quitar de favoritos' : 'Agregar a favoritos') + '">' +
              (fav ? '❤️' : '🤍') +
            '</button>' +
          '</div>' +

          '<span style="font-size:10px;font-weight:700;color:#fff;background:' + getCategoryColor(r.categoria) +
            ';padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.5px">' +
            getCategoryLabel(r.categoria) + '</span>' +

          '<h2 style="font-size:20px;font-weight:800;margin:12px 0 16px">' + r.nombre + '</h2>' +

          (hasIngredients ? (
            '<div style="margin-bottom:20px">' +
              '<div style="font-size:12px;font-weight:700;color:var(--verde);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Ingredientes</div>' +
              '<ul style="padding-left:20px;font-size:14px;line-height:1.8;color:var(--texto)">' +
                r.ingredientes.map(function(ing) {
                  return '<li>' + ing + '</li>';
                }).join('') +
              '</ul>' +
            '</div>'
          ) : '') +

          (hasSteps ? (
            '<div style="margin-bottom:20px">' +
              '<div style="font-size:12px;font-weight:700;color:var(--verde);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Preparación</div>' +
              '<ol style="padding-left:20px;font-size:14px;line-height:1.8;color:var(--texto)">' +
                r.preparacion.map(function(step) {
                  return '<li style="margin-bottom:6px">' + step + '</li>';
                }).join('') +
              '</ol>' +
            '</div>'
          ) : '') +

          (r.consejo ? (
            '<div class="card" style="background:#FFFBEB;border-color:#FDE68A">' +
              '<div style="font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Consejo Nutricional</div>' +
              '<div style="font-size:13px;color:#78350F;line-height:1.6">' + r.consejo + '</div>' +
            '</div>'
          ) : '') +
        '</div>';

      document.body.appendChild(modal);
    },

    toggleFavInDetail: function(id, btn) {
      var nowFav = toggleFav(id);
      btn.innerHTML = nowFav ? '❤️' : '🤍';
      btn.setAttribute('aria-label', nowFav ? 'Quitar de favoritos' : 'Agregar a favoritos');
    }
  };
})();

function renderRecetas(el) {
  Recetas.render(el);
}
