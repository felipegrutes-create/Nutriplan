const Shopping = (() => {
  const LS_KEY = 'mc_shopping';

  function getItems() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveItems(items) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  function categorize(text, catMap) {
    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(catMap)) {
      if (keywords.some(kw => lower.includes(kw))) return cat;
    }
    return 'otros';
  }

  function _mergeIngredients(raw) {
    const merged = [];
    for (let i = 0; i < raw.length; i++) {
      const line = raw[i].trim();
      if (!line) continue;
      // Line that starts with parenthesis is a note for the previous ingredient — append
      if (line.startsWith('(') && merged.length > 0) {
        merged[merged.length - 1] += ' ' + line;
        continue;
      }
      // Line that doesn't start with a number/fraction/letter-quantity is a continuation
      if (merged.length > 0 && !/^[\d½¼¾⅓⅔⅛⅜⅝⅞]/.test(line) && !/^[A-ZÁÉÍÓÚÑ]/.test(line)) {
        merged[merged.length - 1] += ' ' + line;
        continue;
      }
      merged.push(line);
    }
    return merged;
  }

  function _isValidIngredient(text) {
    const t = text.trim();
    if (t.length < 4) return false;
    if (t.endsWith(':')) return false;
    // Pure parenthetical notes
    if (/^\(.*\)$/.test(t)) return false;
    // Just a descriptor/fragment without quantity
    if (/^(extra|mitad|julianas? finas?|rallado|picado|al gusto)$/i.test(t)) return false;
    return true;
  }

  function addFromRecipe(recipe, catMap) {
    const items = getItems();
    const merged = _mergeIngredients(recipe.ingredientes || []);
    merged.forEach(ing => {
      if (!_isValidIngredient(ing)) return;
      const cat = categorize(ing, catMap);
      const exists = items.some(item => item.name.toLowerCase() === ing.toLowerCase());
      if (!exists) {
        items.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          name: ing,
          category: cat,
          checked: false,
          source: recipe.nombre
        });
      }
    });
    saveItems(items);
  }

  function addManual(name) {
    const items = getItems();
    items.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      category: 'otros',
      checked: false,
      source: null
    });
    saveItems(items);
  }

  function toggleCheck(id) {
    const items = getItems();
    const item = items.find(i => String(i.id) === String(id));
    if (item) item.checked = !item.checked;
    saveItems(items);
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function removeItem(id) {
    saveItems(getItems().filter(i => i.id !== id));
  }

  function clearChecked() {
    saveItems(getItems().filter(i => !i.checked));
  }

  function getShareText() {
    const items = getItems();
    const cats = groupByCategory(items);
    const catLabels = getCategoryLabels();
    const catOrder = ['frutas_verduras', 'proteinas', 'lacteos', 'despensa', 'condimentos', 'otros'];
    let text = '🛒 Mi Lista de Compras\n\n';
    catOrder.forEach(cat => {
      const list = cats[cat];
      if (!list || !list.length) return;
      text += catLabels[cat].emoji + ' ' + catLabels[cat].label + '\n';
      list.forEach(i => { text += (i.checked ? '  ✅ ' : '  ☐ ') + i.name + '\n'; });
      text += '\n';
    });
    text += '— Mi Código App';
    return text;
  }

  function share() {
    const text = getShareText();
    showShareModal(text);
  }

  function showShareModal(text) {
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:20px;max-width:400px;width:100%;max-height:80vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 style="font-size:16px;font-weight:700">📋 Tu lista de compras</h3>
          <button onclick="this.closest('[role=dialog]').remove()" style="background:none;border:none;font-size:20px;cursor:pointer">✕</button>
        </div>
        <textarea id="shareText" readonly style="width:100%;height:300px;border:1px solid var(--borda);border-radius:10px;padding:12px;font-size:13px;font-family:inherit;resize:none">${text}</textarea>
        <button onclick="document.getElementById('shareText').select();document.execCommand('copy');alert('✅ Copiado!')" style="width:100%;margin-top:10px;padding:12px;background:var(--verde);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">📋 Copiar lista</button>
      </div>`;
    document.body.appendChild(modal);
  }

  function getCategoryLabels() {
    return {
      frutas_verduras: { emoji: '🥬', label: 'Frutas y Verduras', color: 'var(--verde)' },
      proteinas: { emoji: '🥩', label: 'Proteínas', color: 'var(--rosa)' },
      despensa: { emoji: '🏪', label: 'Despensa', color: 'var(--dourado)' },
      lacteos: { emoji: '🥛', label: 'Lácteos', color: '#3b82f6' },
      condimentos: { emoji: '🧂', label: 'Condimentos', color: '#8b5cf6' },
      otros: { emoji: '📦', label: 'Otros', color: 'var(--texto-sub)' }
    };
  }

  function groupByCategory(items) {
    const groups = {};
    items.forEach(i => {
      if (!groups[i.category]) groups[i.category] = [];
      groups[i.category].push(i);
    });
    for (const cat of Object.keys(groups)) {
      groups[cat].sort((a, b) => a.checked - b.checked);
    }
    return groups;
  }

  let _showRecipePicker = false;

  function render(el) {
    const items = getItems();
    const checked = items.filter(i => i.checked).length;
    const total = items.length;
    const cats = groupByCategory(items);
    const catLabels = getCategoryLabels();

    let html = '<div class="section">';

    html += `
      <div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:rgba(201,146,42,.2);cursor:pointer;display:flex;align-items:center;gap:12px" onclick="Shopping.showRecipePicker()">
        <div style="width:44px;height:44px;background:var(--dourado);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;flex-shrink:0">📖</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:#78350f">Agregar desde recetas</div>
          <div style="font-size:11px;color:#92400e">Elige recetas y agregamos los ingredientes</div>
        </div>
        <div style="font-size:18px;color:var(--dourado)">›</div>
      </div>`;

    html += `
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <input type="text" id="shoppingInput" placeholder="Agregar item..."
          style="flex:1;background:#fff;border:1px solid var(--borda);border-radius:12px;padding:10px 14px;font-size:13px;font-family:inherit"
          onkeydown="if(event.key==='Enter')Shopping.addManualFromInput()">
        <button onclick="Shopping.addManualFromInput()"
          style="background:var(--verde);color:#fff;width:42px;border-radius:12px;border:none;font-size:20px;font-weight:700;cursor:pointer">+</button>
      </div>`;

    if (total > 0) {
      html += `
        <div style="background:#f0fdf4;border:1px solid rgba(46,125,82,.15);border-radius:10px;padding:10px 14px;margin-bottom:12px;text-align:center">
          <div style="font-size:12px;color:var(--verde);font-weight:600">✅ Toca cada item cuando lo compres</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:12px;color:var(--texto-sub)">${total - checked} por comprar · ${checked} comprados</span>
          <div style="display:flex;gap:8px">
            <button onclick="Shopping.share()" style="background:none;border:1px solid var(--borda);border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer">📤 Compartir</button>
            <button onclick="Shopping.confirmClearAll()" style="background:none;border:1px solid var(--borda);border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer">🗑️ Limpiar</button>
          </div>
        </div>`;
    }

    const catOrder = ['frutas_verduras', 'proteinas', 'lacteos', 'despensa', 'condimentos', 'otros'];
    catOrder.forEach(cat => {
      const list = cats[cat];
      if (!list || !list.length) return;
      const meta = catLabels[cat];
      html += `
        <div style="margin-bottom:14px">
          <div style="font-size:11px;font-weight:700;color:${meta.color};margin-bottom:6px;letter-spacing:.5px;display:flex;align-items:center;gap:6px">
            ${meta.emoji} ${meta.label.toUpperCase()}
            <span style="background:var(--bg);padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600">${list.length}</span>
          </div>`;

      list.forEach(item => {
        const ch = item.checked;
        html += `
          <div onclick="Shopping.toggleCheck('${item.id}')" style="background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:4px;border:1px solid var(--borda);display:flex;align-items:center;gap:10px;cursor:pointer;${ch ? 'opacity:.5;' : ''}">
            <div style="width:22px;height:22px;border-radius:6px;border:${ch ? 'none' : '2px solid #D1D5DB'};
              background:${ch ? 'var(--verde)' : 'transparent'};flex-shrink:0;display:flex;align-items:center;justify-content:center;
              font-size:12px;color:#fff">${ch ? '✓' : ''}</div>
            <span style="font-size:13px;color:var(--texto);${ch ? 'text-decoration:line-through;color:var(--texto-sub);' : ''}flex:1">${item.name}</span>
            ${item.source ? `<span style="font-size:10px;background:var(--bg);color:var(--texto-sub);padding:2px 6px;border-radius:8px;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis">📖 ${item.source}</span>` : ''}
          </div>`;
      });

      html += '</div>';
    });

    if (total === 0) {
      html += `
        <div style="text-align:center;padding:40px 20px;color:var(--texto-sub)">
          <div style="font-size:40px;margin-bottom:8px">🛒</div>
          <div style="font-size:14px;font-weight:700;margin-bottom:4px">Tu lista está vacía</div>
          <div style="font-size:12px">Agrega items manualmente o desde tus recetas favoritas</div>
        </div>`;
    }

    html += '</div>';
    el.innerHTML = html;
  }

  function addManualFromInput() {
    const input = document.getElementById('shoppingInput');
    if (!input || !input.value.trim()) return;
    addManual(input.value);
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function confirmClear() {
    if (confirm('¿Eliminar todos los items comprados?')) {
      clearChecked();
      const el = document.getElementById('tabContent');
      if (el) render(el);
    }
  }

  function confirmClearAll() {
    if (confirm('¿Eliminar toda la lista de compras?')) {
      saveItems([]);
      const el = document.getElementById('tabContent');
      if (el) render(el);
    }
  }

  let _selectedRecipeIds = [];

  function showRecipePicker() {
    const recetas = App.getData().recetas || [];
    _selectedRecipeIds = [];

    const modal = document.createElement('div');
    modal.id = 'recipePicker';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:300;overflow-y:auto;max-width:480px;margin:0 auto';

    function renderPickerList(query) {
      const q = (query || '').toLowerCase();
      let filtered = q ? recetas.filter(r => r.nombre.toLowerCase().includes(q)) : recetas;
      // Only show recipes that have ingredients
      filtered = filtered.filter(r => (r.ingredientes || []).length > 0);
      if (!filtered.length) return '<p style="text-align:center;color:var(--texto-sub);padding:20px">Sin resultados</p>';
      return filtered.map(r => {
        const sel = _selectedRecipeIds.includes(r.id);
        const ingCount = _mergeIngredients(r.ingredientes || []).filter(_isValidIngredient).length;
        return `<div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:6px;border:1px solid ${sel ? 'var(--verde)' : 'var(--borda)'};display:flex;align-items:center;gap:10px;${sel ? 'background:#f0fdf4;' : ''}">
          <div onclick="Shopping._toggleRecipeSelection(${r.id})" style="width:26px;height:26px;border-radius:6px;border:${sel ? 'none' : '2px solid #D1D5DB'};background:${sel ? 'var(--verde)' : 'transparent'};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;cursor:pointer">${sel ? '✓' : ''}</div>
          <div onclick="Shopping._toggleRecipeSelection(${r.id})" style="flex:1;cursor:pointer">
            <div style="font-weight:600;font-size:13px">${r.nombre}</div>
            <div style="font-size:11px;color:var(--texto-sub)">${ingCount} ingredientes</div>
          </div>
          <button onclick="event.stopPropagation();Shopping._viewRecipe(${r.id})" style="background:none;border:1px solid var(--borda);border-radius:8px;padding:4px 10px;font-size:11px;color:var(--texto-sub);cursor:pointer;flex-shrink:0">Ver 👁️</button>
        </div>`;
      }).join('');
    }

    function renderModal() {
      const count = _selectedRecipeIds.length;
      modal.innerHTML = `
        <div style="padding:20px;padding-bottom:${count > 0 ? '80px' : '20px'}">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <button onclick="document.getElementById('recipePicker').remove()" style="background:none;border:none;font-size:24px;cursor:pointer">←</button>
            <h2 style="font-size:18px;font-weight:800;flex:1">Elegir Recetas</h2>
            ${count > 0 ? `<span style="background:var(--verde);color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:700">${count}</span>` : ''}
          </div>
          <input type="search" id="rpSearch" placeholder="Buscar receta..." style="width:100%;padding:10px 12px;border:1px solid var(--borda);border-radius:12px;font-size:14px;font-family:inherit;margin-bottom:12px"
            oninput="Shopping._updatePickerList()">
          <div id="rpList">${renderPickerList()}</div>
        </div>
        ${count > 0 ? `
        <div style="position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;padding:12px 20px;background:#fff;border-top:1px solid var(--borda);z-index:301">
          <button onclick="Shopping._addSelectedRecipes()" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--verde),var(--verde-dark));color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">
            ➕ Agregar ${count} receta${count > 1 ? 's' : ''} a la lista
          </button>
        </div>` : ''}`;
    }

    Shopping._toggleRecipeSelection = function(id) {
      const idx = _selectedRecipeIds.indexOf(id);
      if (idx === -1) _selectedRecipeIds.push(id);
      else _selectedRecipeIds.splice(idx, 1);
      renderModal();
      // Restore search
      const search = document.getElementById('rpSearch');
      if (search && search.value) {
        const rpList = document.getElementById('rpList');
        if (rpList) rpList.innerHTML = renderPickerList(search.value);
      }
    };

    Shopping._viewRecipe = function(id) {
      // Open recipe detail on top of picker (Recetas module handles it)
      Recetas.showDetail(id);
    };

    Shopping._updatePickerList = function() {
      const search = document.getElementById('rpSearch');
      const rpList = document.getElementById('rpList');
      if (rpList && search) rpList.innerHTML = renderPickerList(search.value);
    };

    Shopping._addSelectedRecipes = function() {
      const recetas = App.getData().recetas || [];
      const catMap = App.getData().categoriasCompras || {};
      _selectedRecipeIds.forEach(id => {
        const recipe = recetas.find(r => r.id === id);
        if (recipe) addFromRecipe(recipe, catMap);
      });
      _selectedRecipeIds = [];
      document.getElementById('recipePicker').remove();
      const el = document.getElementById('tabContent');
      if (el) render(el);
    };

    renderModal();
    document.body.appendChild(modal);
  }

  return {
    render, getItems, addManual, addManualFromInput, toggleCheck,
    removeItem, clearChecked, share, confirmClear, confirmClearAll, showRecipePicker,
    _toggleRecipeSelection: () => {}, _updatePickerList: () => {}, _addSelectedRecipes: () => {}, _viewRecipe: () => {}
  };
})();
