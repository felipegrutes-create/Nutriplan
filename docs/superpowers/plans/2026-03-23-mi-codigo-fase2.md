# Mi Código Fase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Mi Código PWA from a basic check-in app into a comprehensive daily companion with expanded trackers, motivational messages, shopping list, and redesigned navigation.

**Architecture:** Incremental evolution of existing vanilla JS app using IIFE module pattern, localStorage persistence, no backend. New modules added alongside existing ones. Navigation redesigned from 5 flat tabs to 5 tabs with central FAB button. All new JS/data files registered in Service Worker cache.

**Tech Stack:** Vanilla JS (IIFE modules), CSS3 custom properties, Chart.js 4.4, Service Worker, localStorage, HTML5

**Spec:** `docs/superpowers/specs/2026-03-23-mi-codigo-fase2-design.md`

**App root:** `Quiz Nutriplan/mi-codigo-app/`

---

## File Structure

### New files to create:
| File | Responsibility |
|------|---------------|
| `js/midia.js` | Mi Día unified check-in screen: body metrics, habits, sleep, cycle, save logic |
| `js/shopping.js` | Shopping list: add/remove items, recipe extraction, categories, share, persist |
| `js/messages.js` | Daily motivational message selection from JSON, milestone celebrations |
| `js/backup.js` | Export all `mc_*` data to JSON file download, import from file upload |
| `js/cycle.js` | Hormonal cycle phase selection, symptom tracking, menopausia persistence |
| `js/mas.js` | "Más" tab renderer: settings-style grouped list linking to existing content screens |
| `data/mensajes.json` | 365 daily motivational messages + milestone celebration messages |
| `data/categorias-compras.json` | Ingredient keyword → shopping category mapping |

### Existing files to modify:
| File | Changes |
|------|---------|
| `index.html` | New bottom nav (5 tabs + FAB), add new `<script>` tags |
| `css/app.css` | FAB styles, new component styles (water cups, toggle pills, etc.) |
| `js/app.js` | New tab routing (home/progress/midia/compras/mas), updated home dashboard, load new data files |
| `js/checkin.js` | Deprecate render; keep data module (getAll, save, getStreak, etc.) for backward compat |
| `js/progress.js` | Expand with period filter, water chart, mood/energy/sleep averages, symptom frequency, streak card |
| `sw.js` | Add all new JS and data files to ASSETS cache list, bump cache version |

---

### Task 1: Data Files — Messages and Shopping Categories

**Files:**
- Create: `data/mensajes.json`
- Create: `data/categorias-compras.json`

These are pure data with no dependencies. Create them first so all other modules can consume them.

- [ ] **Step 1: Create `data/mensajes.json`**

Create file with 365 messages (mixed types: motivacional, educativa, accion) plus milestone celebrations. Messages must be in LATAM Spanish, focused on hormonal balance (NEVER diabetes/ADA/CDC). Structure:

```json
{
  "messages": [
    {"day": 1, "type": "motivacional", "emoji": "💪", "text": "Cada día que eliges cuidarte, tu cuerpo aprende a confiar en ti de nuevo."},
    {"day": 2, "type": "educativa", "emoji": "💡", "text": "¿Sabías que caminar 15 minutos después de comer reduce tu glucosa en un 30%?"},
    {"day": 3, "type": "accion", "emoji": "🎯", "text": "Hoy intenta esto: bebe un vaso de agua con limón antes del desayuno."},
    ...365 total entries, rotating through the 3 types
  ],
  "celebrations": [
    {"streak": 3, "emoji": "⭐", "title": "¡3 días seguidos!", "text": "Ya creaste un hábito. Tu cuerpo lo nota."},
    {"streak": 7, "emoji": "🎉", "title": "¡Racha de 7 días!", "text": "Una semana completa. Eres imparable."},
    {"streak": 14, "emoji": "🏆", "title": "¡2 semanas!", "text": "Tu constancia es tu superpoder."},
    {"streak": 21, "emoji": "👑", "title": "¡21 días!", "text": "Dicen que 21 días forman un hábito. Tú lo lograste."},
    {"streak": 30, "emoji": "🌟", "title": "¡Un mes completo!", "text": "30 días cuidándote. Tu cuerpo te lo agradece."},
    {"streak": 60, "emoji": "💎", "title": "¡60 días!", "text": "Dos meses de compromiso. Eso es disciplina real."},
    {"streak": 90, "emoji": "🔥", "title": "¡90 días!", "text": "Tres meses. Ya no es un esfuerzo — es tu estilo de vida."},
    {"streak": 180, "emoji": "🦋", "title": "¡6 meses!", "text": "Medio año transformándote. Mira lo lejos que has llegado."},
    {"streak": 365, "emoji": "🏅", "title": "¡UN AÑO!", "text": "365 días. Eres una leyenda del autocuidado."}
  ]
}
```

Content guidelines for the 365 messages:
- ~120 motivacional (empowerment, self-care, hormonal journey)
- ~120 educativa (cortisol, insulin, sleep, metabolism, menopause facts)
- ~125 accion (specific daily challenges: drink water, walk, breathe, try a recipe)
- All framed for women 40+ LATAM, hormonal balance focus
- NEVER mention diabetes, diabético, ADA, CDC

- [ ] **Step 2: Create `data/categorias-compras.json`**

```json
{
  "frutas_verduras": ["espinaca", "brócoli", "tomate", "aguacate", "limón", "lima", "cebolla", "ajo", "pepino", "zanahoria", "apio", "lechuga", "repollo", "coliflor", "pimentón", "chile", "perejil", "cilantro", "albahaca", "jengibre", "remolacha", "calabacín", "berenjena", "champiñón", "manzana", "pera", "naranja", "mandarina", "plátano", "banana", "fresa", "arándano", "frambuesa", "mora", "papaya", "mango", "piña", "sandía", "melón", "kiwi", "uva", "durazno", "ciruela", "cereza", "guayaba", "maracuyá", "coco", "espárrago", "rúcula", "chayote", "jícama", "nabo", "rábano", "batata", "camote", "papa", "yuca"],
  "proteinas": ["pollo", "pechuga", "muslo", "carne", "res", "cerdo", "salmón", "atún", "sardina", "camarón", "pescado", "tilapia", "huevo", "huevos", "pavo", "tofu", "tempeh", "lomo", "filete", "molida"],
  "lacteos": ["leche", "yogur", "yogurt", "queso", "cottage", "mozzarella", "crema", "mantequilla", "nata", "requesón", "kéfir"],
  "despensa": ["avena", "harina", "arroz", "pasta", "pan", "tortilla", "quinoa", "lentejas", "frijol", "frijoles", "garbanzo", "chía", "linaza", "almendra", "nuez", "nueces", "cacahuate", "maní", "semillas", "aceite", "vinagre", "stevia", "miel", "azúcar", "cacao", "chocolate", "proteína", "polvo", "levadura", "bicarbonato", "gelatina", "avellana", "pistache", "ajonjolí", "tahini", "mantequilla de maní", "caldo"],
  "condimentos": ["sal", "pimienta", "canela", "cúrcuma", "comino", "orégano", "paprika", "pimentón", "tomillo", "romero", "laurel", "clavo", "anís", "nuez moscada", "mostaza", "salsa", "soya", "sriracha", "vainilla", "extracto"]
}
```

- [ ] **Step 3: Verify JSON files are valid**

Run: `python -c "import json; json.load(open('data/mensajes.json','r',encoding='utf-8')); json.load(open('data/categorias-compras.json','r',encoding='utf-8')); print('OK')"` from `Quiz Nutriplan/mi-codigo-app/`

Expected: `OK`

---

### Task 2: Messages Module (`js/messages.js`)

**Files:**
- Create: `js/messages.js`

Small, self-contained module. Depends only on `data/mensajes.json` being loaded by `App.getData()`.

- [ ] **Step 1: Create `js/messages.js`**

```javascript
const Messages = (() => {
  function getTodayMessage(data) {
    const msgs = (data.mensajes && data.mensajes.messages) || [];
    if (!msgs.length) return null;
    const dayOfYear = getDayOfYear();
    const idx = (dayOfYear - 1) % msgs.length;
    return msgs[idx];
  }

  function getCelebration(data, streak) {
    const celebrations = (data.mensajes && data.mensajes.celebrations) || [];
    // Find exact match for current streak
    return celebrations.find(c => c.streak === streak) || null;
  }

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    return Math.floor(diff / 86400000);
  }

  function renderCard(data, streak) {
    const celebration = getCelebration(data, streak);
    if (celebration) {
      return `
        <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:14px;padding:14px 16px;margin-bottom:16px;border:1px solid rgba(201,146,42,.2);text-align:center;position:relative;overflow:hidden">
          <div style="font-size:36px;margin-bottom:4px">${celebration.emoji}</div>
          <div style="font-size:16px;font-weight:800;color:#78350f">${celebration.title}</div>
          <div style="font-size:13px;color:#92400e;margin-top:4px">${celebration.text}</div>
        </div>`;
    }

    const msg = getTodayMessage(data);
    if (!msg) return '';

    return `
      <div style="background:linear-gradient(135deg,var(--verde),var(--verde-dark));border-radius:14px;padding:14px 16px;margin-bottom:16px;color:#fff;position:relative;overflow:hidden">
        <div style="position:absolute;right:-10px;top:-10px;font-size:60px;opacity:.1">${msg.emoji}</div>
        <div style="font-size:11px;font-weight:700;opacity:.8;margin-bottom:4px">🌟 TU MENSAJE DEL DÍA</div>
        <div style="font-size:14px;line-height:1.5;font-weight:500">"${msg.text}"</div>
      </div>`;
  }

  return { getTodayMessage, getCelebration, renderCard };
})();
```

- [ ] **Step 2: Verify syntax**

Run: `node -c "Quiz Nutriplan/mi-codigo-app/js/messages.js"` from project root

Expected: No syntax errors

---

### Task 3: Cycle Module (`js/cycle.js`)

**Files:**
- Create: `js/cycle.js`

Self-contained module for hormonal cycle tracking.

- [ ] **Step 1: Create `js/cycle.js`**

```javascript
const Cycle = (() => {
  const LS_KEY = 'mc_cycle';
  const SETTINGS_KEY = 'mc_settings';

  const PHASES = [
    { id: 'menstruacion', label: 'Menstruación', emoji: '🔴' },
    { id: 'folicular', label: 'Folicular', emoji: '🟡' },
    { id: 'ovulacion', label: 'Ovulación', emoji: '🟢' },
    { id: 'lutea', label: 'Lútea', emoji: '🟣' },
    { id: 'menopausia', label: 'Menopausia', emoji: '🔵' }
  ];

  const SYMPTOMS = [
    'Bochornos', 'Hinchazón', 'Insomnio', 'Dolor de cabeza',
    'Antojo de dulce', 'Irritabilidad', 'Fatiga', 'Retención de líquidos'
  ];

  function getAll() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
    catch { return {}; }
  }

  function getToday() {
    const all = getAll();
    const key = new Date().toISOString().split('T')[0];
    return all[key] || {};
  }

  function save(date, entry) {
    const all = getAll();
    all[date] = { ...all[date], ...entry };
    localStorage.setItem(LS_KEY, JSON.stringify(all));

    // If menopausia selected, persist in settings
    if (entry.phase === 'menopausia') {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      settings.menopause = true;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }

  function isMenopause() {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return settings.menopause === true;
    } catch { return false; }
  }

  function clearMenopause() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    delete settings.menopause;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function getSymptomFrequency(days) {
    const all = getAll();
    const dates = Object.keys(all).sort().reverse().slice(0, days);
    const freq = {};
    dates.forEach(d => {
      (all[d].symptoms || []).forEach(s => {
        freq[s] = (freq[s] || 0) + 1;
      });
    });
    return freq;
  }

  return { PHASES, SYMPTOMS, getAll, getToday, save, isMenopause, clearMenopause, getSymptomFrequency };
})();
```

- [ ] **Step 2: Verify syntax**

Run: `node -c "Quiz Nutriplan/mi-codigo-app/js/cycle.js"`

---

### Task 4: Backup Module (`js/backup.js`)

**Files:**
- Create: `js/backup.js`

Self-contained export/import module.

- [ ] **Step 1: Create `js/backup.js`**

```javascript
const Backup = (() => {
  const KEYS = [
    'mc_auth', 'mc_checkins', 'mc_water', 'mc_meals',
    'mc_supplements', 'mc_exercise', 'mc_sleep', 'mc_cycle',
    'mc_shopping', 'mc_settings', 'mc_favs'
  ];

  function exportData() {
    const backup = { version: '2.0', exportedAt: new Date().toISOString() };
    KEYS.forEach(key => {
      const short = key.replace('mc_', '');
      try { backup[short] = JSON.parse(localStorage.getItem(key) || 'null'); }
      catch { backup[short] = null; }
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mi-codigo-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    localStorage.setItem('mc_backup_date', new Date().toISOString().split('T')[0]);
  }

  function importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.version) { reject('Archivo no válido'); return; }

          KEYS.forEach(key => {
            const short = key.replace('mc_', '');
            if (data[short] !== undefined && data[short] !== null) {
              localStorage.setItem(key, JSON.stringify(data[short]));
            }
          });

          localStorage.setItem('mc_backup_date', new Date().toISOString().split('T')[0]);
          resolve(data);
        } catch (err) {
          reject('Error al leer el archivo: ' + err.message);
        }
      };
      reader.onerror = function() { reject('Error al leer el archivo'); };
      reader.readAsText(file);
    });
  }

  function getLastBackupDate() {
    return localStorage.getItem('mc_backup_date') || null;
  }

  return { exportData, importData, getLastBackupDate };
})();
```

- [ ] **Step 2: Verify syntax**

Run: `node -c "Quiz Nutriplan/mi-codigo-app/js/backup.js"`

---

### Task 5: Mi Día Module (`js/midia.js`)

**Files:**
- Create: `js/midia.js`

The core check-in screen. Depends on: `Checkin` (save/getAll), `Cycle` (phases/symptoms), `Messages` (renderCard). Uses localStorage keys: `mc_checkins`, `mc_water`, `mc_meals`, `mc_supplements`, `mc_exercise`, `mc_sleep`, `mc_cycle`.

- [ ] **Step 1: Create `js/midia.js` — data helpers**

```javascript
const MiDia = (() => {
  // ── localStorage helpers ──
  function getStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); }
    catch { return {}; }
  }
  function setStore(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function todayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // ── Per-tracker getters for today ──
  function getWaterToday() {
    return getStore('mc_water')[todayKey()] || 0;
  }
  function getMealsToday() {
    return getStore('mc_meals')[todayKey()] || {};
  }
  function getSupplementToday() {
    return getStore('mc_supplements')[todayKey()] || false;
  }
  function getExerciseToday() {
    return getStore('mc_exercise')[todayKey()] || false;
  }
  function getSleepToday() {
    return getStore('mc_sleep')[todayKey()] || {};
  }

  // ── Count completed items for progress ──
  function getCompletionCount() {
    const today = todayKey();
    const checkin = Checkin.getAll()[today] || {};
    const water = getWaterToday();
    const meals = getMealsToday();
    const supp = getSupplementToday();
    const exercise = getExerciseToday();
    const sleep = getSleepToday();
    const waterGoal = (JSON.parse(localStorage.getItem('mc_settings') || '{}')).waterGoal || 8;

    let done = 0;
    let total = 7; // water, meals(any), supplement, exercise, sleep, mood, energy
    if (water >= waterGoal) done++;
    if (meals.desayuno || meals.almuerzo || meals.cena || meals.snack) done++;
    if (supp) done++;
    if (exercise) done++;
    if (sleep.hours) done++;
    if (checkin.humor) done++;
    if (checkin.energia) done++;
    return { done, total };
  }
```

- [ ] **Step 2: Create `js/midia.js` — render function (part 1: message + body)**

Continue the same file, add the render function:

```javascript
  function render(el) {
    const today = todayKey();
    const data = App.getData();
    const streak = Checkin.getStreak();
    // Read from in-memory state (preserved across re-renders) rather than localStorage
    // so unsaved selections (mood, sleep, energy) aren't lost on partial re-renders
    const water = _waterCount;
    const meals = _meals;
    const supp = _supp;
    const exercise = _exercise;
    const sleep = { hours: _sleepHours, quality: _sleepQuality };
    const cycleToday = { phase: _phase, symptoms: _symptoms };
    const isMeno = Cycle.isMenopause();
    const settings = JSON.parse(localStorage.getItem('mc_settings') || '{}');
    const waterGoal = settings.waterGoal || 8;
    // For peso + energia, read from DOM if available (preserved as input values), else from state
    const checkinStored = Checkin.getAll()[today] || {};

    let html = '<div class="section">';

    // ── Motivational message ──
    html += Messages.renderCard(data, streak);

    // ── CUERPO section ──
    html += '<div class="label" style="color:var(--verde)">⚖️ CUERPO</div>';

    // Peso
    const lastWeight = Checkin.getLastWeight();
    html += `
      <div class="card" style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:13px;font-weight:600">Peso</div>
          <div style="font-size:11px;color:var(--texto-sub)">Último: ${lastWeight ? lastWeight + ' kg' : '--'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <input type="number" id="mdPeso" step="0.1" min="30" max="300"
            value="${checkinStored.peso || ''}" placeholder="${lastWeight || '70.0'}"
            style="background:var(--bg);border:1px solid var(--borda);border-radius:var(--radius-sm);padding:6px 12px;font-size:16px;font-weight:700;width:80px;text-align:center;font-family:inherit"
            aria-label="Peso en kg">
          <span style="font-size:12px;color:var(--texto-sub)">kg</span>
        </div>
      </div>`;

    // Energía
    html += `
      <div class="card">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:13px;font-weight:600">Energía</span>
          <span id="mdEnergiaVal" style="font-size:13px;font-weight:700;color:var(--verde)">${checkinStored.energia || 5}/10</span>
        </div>
        <input type="range" id="mdEnergia" min="1" max="10" value="${checkinStored.energia || 5}"
          style="width:100%;accent-color:var(--verde)" aria-label="Nivel de energía">
      </div>`;

    // Humor
    const moods = [
      { val: 'Mal', emoji: '😢' },
      { val: 'Regular', emoji: '😐' },
      { val: 'Bien', emoji: '😊' },
      { val: 'Genial', emoji: '🤩' }
    ];
    html += `
      <div class="card">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">¿Cómo te sientes?</div>
        <div style="display:flex;gap:8px;justify-content:center" id="mdMoodGroup">
          ${moods.map(m => {
            const active = _selectedMood === m.val;
            return `<button data-mood="${m.val}" onclick="MiDia.selectMood('${m.val}')"
              style="text-align:center;padding:8px 12px;border-radius:12px;border:2px solid ${active ? 'var(--verde)' : 'var(--borda)'};background:${active ? 'var(--verde-light)' : '#fff'};cursor:pointer">
              <div style="font-size:24px">${m.emoji}</div>
              <div style="font-size:10px;color:${active ? 'var(--verde)' : 'var(--texto-sub)'};font-weight:${active ? '700' : '400'};margin-top:2px">${m.val}</div>
            </button>`;
          }).join('')}
        </div>
      </div>`;
```

- [ ] **Step 3: Create `js/midia.js` — render function (part 2: habits)**

Continue file:

```javascript
    // ── HÁBITOS section ──
    html += '<div class="label" style="color:var(--dourado);margin-top:8px">✅ HÁBITOS DEL DÍA</div>';

    // Agua
    html += `
      <div class="card">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:13px;font-weight:600">💧 Agua</span>
          <span style="font-size:13px;font-weight:700;color:var(--verde)">${water} de ${waterGoal} vasos</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap" id="mdWaterCups">
          ${Array.from({length: waterGoal}, (_, i) => {
            const filled = i < water;
            return `<button onclick="MiDia.setWater(${i + 1})"
              style="width:32px;height:32px;border-radius:8px;border:none;cursor:pointer;font-size:16px;
              background:${filled ? 'var(--verde)' : 'var(--borda)'};opacity:${filled ? '1' : '.4'}"
              aria-label="Vaso ${i + 1}">💧</button>`;
          }).join('')}
        </div>
      </div>`;

    // Comidas
    const mealNames = ['desayuno', 'almuerzo', 'cena', 'snack'];
    const mealLabels = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snack: 'Snack' };
    html += `
      <div class="card">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">🍽️ Comidas del Plan</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px" id="mdMeals">
          ${mealNames.map(m => {
            const done = meals[m];
            return `<button data-meal="${m}" onclick="MiDia.toggleMeal('${m}')"
              style="padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;
              border:1px solid ${done ? 'rgba(46,125,82,.2)' : 'var(--borda)'};
              background:${done ? 'var(--verde-light)' : 'var(--bg)'};
              color:${done ? 'var(--verde)' : 'var(--texto-sub)'}">
              ${done ? '✅' : '⬜'} ${mealLabels[m]}</button>`;
          }).join('')}
        </div>
      </div>`;

    // Suplemento + Ejercicio
    html += `
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <div class="card" style="flex:1;text-align:center;cursor:pointer;margin-bottom:0" onclick="MiDia.toggleSupp()">
          <div style="font-size:24px;margin-bottom:4px">💊</div>
          <div style="font-size:12px;font-weight:600">Suplemento</div>
          <div id="mdSuppStatus" style="margin-top:6px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block;
            background:${supp ? 'var(--verde-light)' : 'var(--bg)'};color:${supp ? 'var(--verde)' : 'var(--texto-sub)'}">
            ${supp ? '✅ Tomado' : '⬜ Pendiente'}</div>
        </div>
        <div class="card" style="flex:1;text-align:center;cursor:pointer;margin-bottom:0" onclick="MiDia.toggleExercise()">
          <div style="font-size:24px;margin-bottom:4px">🏃‍♀️</div>
          <div style="font-size:12px;font-weight:600">Ejercicio</div>
          <div id="mdExerciseStatus" style="margin-top:6px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block;
            background:${exercise ? 'var(--verde-light)' : 'var(--bg)'};color:${exercise ? 'var(--verde)' : 'var(--texto-sub)'}">
            ${exercise ? '✅ Hecho' : '⬜ Pendiente'}</div>
        </div>
      </div>`;
```

- [ ] **Step 4: Create `js/midia.js` — render function (part 3: sleep + cycle + save)**

Continue file:

```javascript
    // ── DESCANSO section ──
    html += '<div class="label" style="color:#6366f1;margin-top:8px">🌙 DESCANSO</div>';

    html += `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:13px;font-weight:600">Horas de sueño</span>
          <div style="display:flex;align-items:center;gap:4px">
            <button onclick="MiDia.adjustSleep(-0.5)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--borda);background:#fff;cursor:pointer;font-size:16px">−</button>
            <span id="mdSleepVal" style="font-size:16px;font-weight:700;color:#6366f1;min-width:30px;text-align:center">${sleep.hours || 7}</span>
            <button onclick="MiDia.adjustSleep(0.5)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--borda);background:#fff;cursor:pointer;font-size:16px">+</button>
            <span style="font-size:12px;color:var(--texto-sub)">h</span>
          </div>
        </div>
        <div style="font-size:13px;font-weight:600;margin-bottom:6px">Calidad:</div>
        <div style="display:flex;gap:8px" id="mdSleepQuality">
          ${['bien', 'regular', 'mal'].map(q => {
            const emojis = { bien: '😴', regular: '😐', mal: '😫' };
            const labels = { bien: 'Bien', regular: 'Regular', mal: 'Mal' };
            const active = sleep.quality === q;
            return `<button data-sleep-q="${q}" onclick="MiDia.selectSleepQuality('${q}')"
              style="flex:1;padding:8px;border-radius:10px;border:2px solid ${active ? '#6366f1' : 'var(--borda)'};
              background:${active ? '#eef2ff' : '#fff'};cursor:pointer;text-align:center">
              <div style="font-size:18px">${emojis[q]}</div>
              <div style="font-size:10px;color:${active ? '#6366f1' : 'var(--texto-sub)'};font-weight:${active ? '700' : '400'}">${labels[q]}</div>
            </button>`;
          }).join('')}
        </div>
      </div>`;

    // ── CICLO HORMONAL section ──
    html += '<div class="label" style="color:var(--rosa);margin-top:8px">🌸 CICLO HORMONAL</div>';

    // Phase selection
    html += `
      <div class="card">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">Fase actual</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap" id="mdCyclePhase">
          ${Cycle.PHASES.map(p => {
            const active = isMeno ? p.id === 'menopausia' : cycleToday.phase === p.id;
            const disabled = isMeno && p.id !== 'menopausia';
            return `<button data-phase="${p.id}" onclick="MiDia.selectPhase('${p.id}')"
              style="padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer;
              border:1px solid ${active ? 'rgba(232,68,90,.3)' : 'var(--borda)'};
              background:${active ? '#fef2f2' : disabled ? '#f9fafb' : 'var(--bg)'};
              color:${active ? 'var(--rosa)' : disabled ? '#d1d5db' : 'var(--texto-sub)'};
              font-weight:${active ? '600' : '400'};
              ${disabled ? 'opacity:.5;pointer-events:none;' : ''}">
              ${p.emoji} ${p.label}</button>`;
          }).join('')}
        </div>
      </div>`;

    // Symptoms
    html += `
      <div class="card">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">Síntomas hoy</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap" id="mdSymptoms">
          ${Cycle.SYMPTOMS.map(s => {
            const active = (cycleToday.symptoms || []).includes(s);
            return `<button data-symptom="${s}" onclick="MiDia.toggleSymptom('${s}')"
              style="padding:5px 10px;border-radius:20px;font-size:11px;cursor:pointer;
              border:1px solid ${active ? 'rgba(232,68,90,.3)' : 'var(--borda)'};
              background:${active ? '#fef2f2' : 'var(--bg)'};
              color:${active ? 'var(--rosa)' : 'var(--texto-sub)'};
              font-weight:${active ? '600' : '400'}">
              ${active ? '✅' : ''} ${s}</button>`;
          }).join('')}
        </div>
      </div>`;

    // ── Save button ──
    html += `
      <button class="btn-primary" onclick="MiDia.save()" style="margin-top:8px;background:linear-gradient(135deg,var(--verde),var(--verde-dark));border-radius:14px;padding:16px;font-size:16px;box-shadow:0 4px 15px rgba(46,125,82,.3)">
        💾 Guardar Mi Día
      </button>`;

    html += '</div>';
    el.innerHTML = html;

    // ── Event listeners ──
    const slider = document.getElementById('mdEnergia');
    const sliderVal = document.getElementById('mdEnergiaVal');
    if (slider && sliderVal) {
      slider.addEventListener('input', function() {
        sliderVal.textContent = this.value + '/10';
      });
    }
  }
```

- [ ] **Step 5: Create `js/midia.js` — interaction handlers + save + close IIFE**

Continue and close the module:

```javascript
  // ── In-memory state for unsaved changes ──
  let _selectedMood = null;
  let _waterCount = 0;
  let _meals = {};
  let _supp = false;
  let _exercise = false;
  let _sleepHours = 7;
  let _sleepQuality = null;
  let _phase = null;
  let _symptoms = [];

  function initState() {
    const today = todayKey();
    const checkin = Checkin.getAll()[today] || {};
    _selectedMood = checkin.humor || null;
    _waterCount = getWaterToday();
    _meals = getMealsToday();
    _supp = getSupplementToday();
    _exercise = getExerciseToday();
    const sleep = getSleepToday();
    _sleepHours = sleep.hours || 7;
    _sleepQuality = sleep.quality || null;
    const cycle = Cycle.getToday();
    _phase = Cycle.isMenopause() ? 'menopausia' : (cycle.phase || null);
    _symptoms = cycle.symptoms || [];
  }

  function selectMood(val) {
    _selectedMood = val;
    document.querySelectorAll('#mdMoodGroup button').forEach(b => {
      const active = b.dataset.mood === val;
      b.style.border = `2px solid ${active ? 'var(--verde)' : 'var(--borda)'}`;
      b.style.background = active ? 'var(--verde-light)' : '#fff';
      b.querySelector('div:last-child').style.color = active ? 'var(--verde)' : 'var(--texto-sub)';
      b.querySelector('div:last-child').style.fontWeight = active ? '700' : '400';
    });
  }

  function setWater(count) {
    _waterCount = (_waterCount === count) ? count - 1 : count; // tap same = unfill
    const today = todayKey();
    const store = getStore('mc_water');
    store[today] = _waterCount;
    setStore('mc_water', store);
    // Re-render just the water section
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function toggleMeal(name) {
    _meals[name] = !_meals[name];
    const today = todayKey();
    const store = getStore('mc_meals');
    store[today] = _meals;
    setStore('mc_meals', store);
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function toggleSupp() {
    _supp = !_supp;
    const today = todayKey();
    const store = getStore('mc_supplements');
    store[today] = _supp;
    setStore('mc_supplements', store);
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function toggleExercise() {
    _exercise = !_exercise;
    const today = todayKey();
    const store = getStore('mc_exercise');
    store[today] = _exercise;
    setStore('mc_exercise', store);
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function adjustSleep(delta) {
    _sleepHours = Math.max(0, Math.min(14, _sleepHours + delta));
    const valEl = document.getElementById('mdSleepVal');
    if (valEl) valEl.textContent = _sleepHours;
  }

  function selectSleepQuality(q) {
    _sleepQuality = q;
    document.querySelectorAll('#mdSleepQuality button').forEach(b => {
      const active = b.dataset.sleepQ === q;
      b.style.border = `2px solid ${active ? '#6366f1' : 'var(--borda)'}`;
      b.style.background = active ? '#eef2ff' : '#fff';
    });
  }

  function selectPhase(id) {
    _phase = id;
    const today = todayKey();
    Cycle.save(today, { phase: id, symptoms: _symptoms });
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function toggleSymptom(name) {
    const idx = _symptoms.indexOf(name);
    if (idx === -1) _symptoms.push(name);
    else _symptoms.splice(idx, 1);
    const today = todayKey();
    Cycle.save(today, { phase: _phase, symptoms: _symptoms });
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function save() {
    const today = todayKey();
    const pesoInput = document.getElementById('mdPeso');
    const pesoVal = pesoInput ? pesoInput.value.trim() : '';
    const peso = pesoVal ? parseFloat(pesoVal) : null;
    const slider = document.getElementById('mdEnergia');
    const energia = slider ? parseInt(slider.value, 10) : 5;

    // Save checkin (weight, energy, mood)
    const entry = { energia, humor: _selectedMood || 'Regular' };
    if (peso && !isNaN(peso)) entry.peso = peso;
    Checkin.save(today, entry);

    // Save sleep
    const sleepStore = getStore('mc_sleep');
    sleepStore[today] = { hours: _sleepHours, quality: _sleepQuality };
    setStore('mc_sleep', sleepStore);

    // Cycle already saved on each interaction

    // Success feedback
    const btn = document.querySelector('.btn-primary');
    if (btn) {
      btn.textContent = '✓ ¡Guardado!';
      btn.style.background = 'var(--verde-dark)';
      btn.disabled = true;
    }
    // Update header streak
    const headerStreak = document.getElementById('headerStreak');
    if (headerStreak) headerStreak.textContent = '🔥 ' + Checkin.getStreak();

    setTimeout(() => { App.navigate('home'); }, 1200);
  }

  return {
    render, save, getCompletionCount, initState,
    selectMood, setWater, toggleMeal, toggleSupp, toggleExercise,
    adjustSleep, selectSleepQuality, selectPhase, toggleSymptom
  };
})();
```

- [ ] **Step 6: Verify syntax**

Run: `node -c "Quiz Nutriplan/mi-codigo-app/js/midia.js"`

---

### Task 6: Shopping Module (`js/shopping.js`)

**Files:**
- Create: `js/shopping.js`

Depends on: `App.getData()` for recipe data, `data/categorias-compras.json` loaded as `data.categoriasCompras`.

- [ ] **Step 1: Create `js/shopping.js`**

```javascript
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

  function addFromRecipe(recipe, catMap) {
    const items = getItems();
    (recipe.ingredientes || []).forEach(ing => {
      // Filter out sub-headers like "Relleno:", "Para la salsa:"
      if (ing.endsWith(':') || ing.length < 3) return;
      const cat = categorize(ing, catMap);
      // Avoid duplicates by name match
      const exists = items.some(item => item.name.toLowerCase() === ing.toLowerCase());
      if (!exists) {
        items.push({
          id: Date.now() + Math.random(),
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
      id: Date.now() + Math.random(),
      name: name.trim(),
      category: 'otros',
      checked: false,
      source: null
    });
    saveItems(items);
  }

  function toggleCheck(id) {
    const items = getItems();
    const item = items.find(i => i.id === id);
    if (item) item.checked = !item.checked;
    saveItems(items);
  }

  function removeItem(id) {
    saveItems(getItems().filter(i => i.id !== id));
  }

  function clearChecked() {
    saveItems(getItems().filter(i => !i.checked));
  }

  function getShareText() {
    const items = getItems().filter(i => !i.checked);
    const cats = groupByCategory(items);
    const catLabels = getCategoryLabels();
    let text = '🛒 Mi Lista de Compras\n\n';
    for (const [cat, list] of Object.entries(cats)) {
      text += catLabels[cat].emoji + ' ' + catLabels[cat].label + '\n';
      list.forEach(i => { text += '  ☐ ' + i.name + '\n'; });
      text += '\n';
    }
    text += '— Mi Código App';
    return text;
  }

  function share() {
    const text = getShareText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Lista copiada al portapapeles');
      }).catch(() => {});
    }
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
    // Sort: unchecked first within each category
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

    // Add from recipes button
    html += `
      <div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:rgba(201,146,42,.2);cursor:pointer;display:flex;align-items:center;gap:12px" onclick="Shopping.showRecipePicker()">
        <div style="width:44px;height:44px;background:var(--dourado);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;flex-shrink:0">📖</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:#78350f">Agregar desde recetas</div>
          <div style="font-size:11px;color:#92400e">Elige recetas y agregamos los ingredientes</div>
        </div>
        <div style="font-size:18px;color:var(--dourado)">›</div>
      </div>`;

    // Manual add input
    html += `
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <input type="text" id="shoppingInput" placeholder="Agregar item..."
          style="flex:1;background:#fff;border:1px solid var(--borda);border-radius:12px;padding:10px 14px;font-size:13px;font-family:inherit"
          onkeydown="if(event.key==='Enter')Shopping.addManualFromInput()">
        <button onclick="Shopping.addManualFromInput()"
          style="background:var(--verde);color:#fff;width:42px;border-radius:12px;border:none;font-size:20px;font-weight:700;cursor:pointer">+</button>
      </div>`;

    // Counter
    if (total > 0) {
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:12px;color:var(--texto-sub)">${total} items · ${checked} comprados</span>
          <div style="display:flex;gap:8px">
            <button onclick="Shopping.share()" style="background:none;border:1px solid var(--borda);border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer">📤 Compartir</button>
            ${checked > 0 ? `<button onclick="Shopping.confirmClear()" style="background:none;border:1px solid var(--borda);border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer">🗑️ Limpiar</button>` : ''}
          </div>
        </div>`;
    }

    // Items by category
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
          <div style="background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:4px;border:1px solid var(--borda);display:flex;align-items:center;gap:10px;${ch ? 'opacity:.5;' : ''}">
            <button onclick="Shopping.toggleCheck(${item.id})"
              style="width:22px;height:22px;border-radius:6px;border:${ch ? 'none' : '2px solid #D1D5DB'};
              background:${ch ? 'var(--verde)' : 'transparent'};cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;
              font-size:12px;color:#fff">${ch ? '✓' : ''}</button>
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

  function showRecipePicker() {
    const recetas = App.getData().recetas || [];
    const catMap = App.getData().categoriasCompras || {};

    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:300;overflow-y:auto;max-width:480px;margin:0 auto';

    let search = '';
    function renderList() {
      let filtered = recetas;
      if (search) {
        const q = search.toLowerCase();
        filtered = recetas.filter(r => r.nombre.toLowerCase().includes(q));
      }
      return filtered.map(r =>
        `<div class="card" style="padding:10px 12px;cursor:pointer" onclick="Shopping.addRecipeAndClose(${r.id})">
          <div style="font-weight:600;font-size:13px">${r.nombre}</div>
          <div style="font-size:11px;color:var(--texto-sub)">${(r.ingredientes || []).length} ingredientes</div>
        </div>`
      ).join('');
    }

    modal.innerHTML = `
      <div style="padding:20px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <button onclick="this.closest('[role=dialog]').remove()" style="background:none;border:none;font-size:24px;cursor:pointer">←</button>
          <h2 style="font-size:18px;font-weight:800;flex:1">Elegir Recetas</h2>
        </div>
        <input type="search" placeholder="Buscar receta..." style="width:100%;padding:10px 12px;border:1px solid var(--borda);border-radius:12px;font-size:14px;font-family:inherit;margin-bottom:12px"
          oninput="this.closest('[role=dialog]').querySelector('#rpList').innerHTML=Shopping._filterRecipes(this.value)">
        <div id="rpList">${renderList()}</div>
      </div>`;

    document.body.appendChild(modal);

    // Expose filter helper
    Shopping._filterRecipes = function(val) {
      const q = val.toLowerCase();
      const filtered = q ? recetas.filter(r => r.nombre.toLowerCase().includes(q)) : recetas;
      return filtered.map(r =>
        `<div class="card" style="padding:10px 12px;cursor:pointer" onclick="Shopping.addRecipeAndClose(${r.id})">
          <div style="font-weight:600;font-size:13px">${r.nombre}</div>
          <div style="font-size:11px;color:var(--texto-sub)">${(r.ingredientes || []).length} ingredientes</div>
        </div>`
      ).join('') || '<p style="text-align:center;color:var(--texto-sub);padding:20px">Sin resultados</p>';
    };
  }

  function addRecipeAndClose(id) {
    const recetas = App.getData().recetas || [];
    const catMap = App.getData().categoriasCompras || {};
    const recipe = recetas.find(r => r.id === id);
    if (recipe) addFromRecipe(recipe, catMap);
    // Close modal
    const modal = document.querySelector('[role=dialog]');
    if (modal) modal.remove();
    // Re-render
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  return {
    render, getItems, addManual, addManualFromInput, toggleCheck,
    removeItem, clearChecked, share, confirmClear, showRecipePicker,
    addRecipeAndClose, _filterRecipes: () => ''
  };
})();
```

- [ ] **Step 2: Verify syntax**

Run: `node -c "Quiz Nutriplan/mi-codigo-app/js/shopping.js"`

---

### Task 7: Más Tab Module (`js/mas.js`)

**Files:**
- Create: `js/mas.js`

Settings-style list that links to existing content screens and provides backup access.

- [ ] **Step 1: Create `js/mas.js`**

```javascript
const Mas = (() => {
  function render(el) {
    const lastBackup = Backup.getLastBackupDate();
    const backupText = lastBackup
      ? 'Último backup: ' + new Date(lastBackup + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
      : 'Sin backups aún';

    el.innerHTML = `
      <div class="section">

        <!-- Profile card -->
        <div class="card" style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="Mas.showProfile()">
          <div style="width:44px;height:44px;background:linear-gradient(135deg,var(--verde),var(--verde-dark));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff">👩</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700">Mi Perfil</div>
            <div style="font-size:11px;color:var(--texto-sub)">Peso meta, datos personales</div>
          </div>
          <span style="color:var(--texto-sub)">›</span>
        </div>

        <!-- CONTENIDO section -->
        <div class="label" style="color:var(--verde)">CONTENIDO</div>
        <div class="card" style="padding:0;overflow:hidden">
          ${masItem('🍽️', 'Recetas', '500+ recetas saludables', "App.navigate('recetas')")}
          ${masItem('📚', 'Biblioteca', '22 ebooks completos', "Mas.openLibrary()")}
          ${masItem('🎓', 'Mini-curso', 'Equilibrio hormonal paso a paso', "Mas.showContent('curso')")}
          ${masItem('💊', 'Suplementos', 'Guía de suplementación', "Mas.showContent('suplementos')", true)}
        </div>

        <!-- HERRAMIENTAS section -->
        <div class="label" style="color:var(--dourado)">HERRAMIENTAS</div>
        <div class="card" style="padding:0;overflow:hidden">
          ${masItem('📅', 'Plan de 31 Días', 'Tu menú semanal completo', "Mas.showContent('plano')")}
          ${masItem('📊', 'Tabla Índice Glucémico', 'Referencia rápida de IG', "Mas.openIG()")}
          ${masItem('🏋️', 'Ejercicios', 'Rutinas semanales', "Mas.showContent('ejercicios')", true)}
        </div>

        <!-- AJUSTES section -->
        <div class="label" style="color:var(--texto-sub)">AJUSTES</div>
        <div class="card" style="padding:0;overflow:hidden">
          ${masItem('💾', 'Exportar / Importar', backupText, "Mas.showBackup()")}
          ${masItem('🔔', 'Recordatorios', 'Próximamente', null)}
          ${masItem('ℹ️', 'Sobre Mi Código', 'v2.0 · El Código Hormonal', "Mas.showAbout()", true)}
        </div>

      </div>`;
  }

  function masItem(emoji, title, subtitle, onclick, isLast) {
    return `
      <div style="padding:12px 14px;display:flex;align-items:center;gap:10px;${isLast ? '' : 'border-bottom:1px solid #f3f4f6;'}${onclick ? 'cursor:pointer' : 'opacity:.5'}"
        ${onclick ? `onclick="${onclick}"` : ''}>
        <span style="font-size:18px">${emoji}</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600">${title}</div>
          <div style="font-size:11px;color:var(--texto-sub)">${subtitle}</div>
        </div>
        ${onclick ? '<span style="color:var(--texto-sub)">›</span>' : ''}
      </div>`;
  }

  function showContent(key) {
    const el = document.getElementById('tabContent');
    if (!el) return;
    const data = App.getData();

    const backBtn = '<button onclick="Mas.render(document.getElementById(\'tabContent\'))" style="background:none;border:none;font-size:24px;cursor:pointer;margin-bottom:16px;color:var(--texto)">←</button>';

    if (key === 'curso') {
      el.innerHTML = '<div class="section">' + backBtn +
        '<h2 style="font-size:20px;font-weight:800;margin-bottom:16px">🎓 Mini-Curso</h2>' +
        (data.curso || []).map(function(lesson, i) {
          return '<div class="card" style="cursor:pointer" onclick="App.showLesson(' + i + ')">' +
            '<div style="display:flex;align-items:center;gap:12px">' +
              '<div style="background:var(--verde);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">' + (i+1) + '</div>' +
              '<div><div style="font-weight:700;font-size:13px">' + lesson.titulo + '</div>' +
              '<div style="font-size:11px;color:var(--texto-sub)">' + (lesson.duracion || '5 min') + '</div></div>' +
              '<span style="margin-left:auto;color:var(--texto-sub)">›</span></div></div>';
        }).join('') + '</div>';
    } else if (key === 'suplementos') {
      el.innerHTML = '<div class="section">' + backBtn +
        '<h2 style="font-size:20px;font-weight:800;margin-bottom:16px">💊 Suplementos</h2>' +
        (data.suplementos || []).map(function(s) {
          return '<div class="card" style="padding:12px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">' + s.nombre + '</div>' +
            '<div style="font-size:12px;color:var(--texto-sub);margin-bottom:4px">' + s.beneficio + '</div>' +
            '<div style="font-size:11px;color:var(--verde);font-weight:600">Dosis: ' + s.dosis + '</div></div>';
        }).join('') + '</div>';
    } else if (key === 'plano') {
      el.innerHTML = '<div class="section">' + backBtn +
        '<h2 style="font-size:20px;font-weight:800;margin-bottom:16px">📅 Plan Semanal</h2>' +
        (data.plano || []).map(function(day) {
          return '<div class="card" style="padding:12px"><div style="font-weight:700;font-size:13px;color:var(--verde);margin-bottom:6px">' + day.dia + '</div>' +
            '<div style="font-size:12px;color:var(--texto-sub)">' + day.desayuno + ' · ' + day.almuerzo + ' · ' + day.cena + '</div></div>';
        }).join('') + '</div>';
    } else if (key === 'ejercicios') {
      el.innerHTML = '<div class="section">' + backBtn +
        '<h2 style="font-size:20px;font-weight:800;margin-bottom:16px">🏋️ Ejercicios</h2>' +
        (data.exercicios || []).map(function(e) {
          return '<a href="' + e.url + '" target="_blank" rel="noopener noreferrer" class="card" style="display:block;text-decoration:none;color:inherit;padding:12px">' +
            '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:20px">' + (e.emoji || '🧘‍♀️') + '</div>' +
            '<div><div style="font-weight:700;font-size:13px">' + e.nombre + '</div>' +
            '<div style="font-size:11px;color:var(--texto-sub)">' + e.duracion + ' · ' + e.nivel + '</div></div>' +
            '<span style="margin-left:auto;color:var(--verde)">▶</span></div></a>';
        }).join('') + '</div>';
    }
  }

  function showBackup() {
    const el = document.getElementById('tabContent');
    if (!el) return;
    const lastBackup = Backup.getLastBackupDate();

    el.innerHTML = `
      <div class="section">
        <button onclick="Mas.render(document.getElementById('tabContent'))" style="background:none;border:none;font-size:24px;cursor:pointer;margin-bottom:16px;color:var(--texto)">←</button>
        <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">💾 Mis Datos</h2>
        <p style="font-size:13px;color:var(--texto-sub);margin-bottom:20px">Exporta un backup de todos tus datos para no perderlos. Puedes restaurar en cualquier momento.</p>

        <button class="btn-primary" onclick="Backup.exportData()" style="margin-bottom:12px">
          📤 Exportar Backup
        </button>

        <div class="card" style="text-align:center">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px">📥 Importar Backup</div>
          <input type="file" id="backupFileInput" accept=".json" style="display:none"
            onchange="Mas.handleImport(this.files[0])">
          <button onclick="document.getElementById('backupFileInput').click()"
            style="background:#fff;color:var(--verde);border:2px solid var(--verde);border-radius:var(--radius);padding:12px;font-size:14px;font-weight:700;cursor:pointer;width:100%;font-family:inherit">
            Seleccionar archivo .json
          </button>
        </div>

        <p style="text-align:center;font-size:12px;color:var(--texto-sub);margin-top:12px">
          ${lastBackup ? 'Último backup: ' + lastBackup : 'Sin backups aún'}
        </p>
      </div>`;
  }

  function handleImport(file) {
    if (!file) return;
    if (!confirm('¿Restaurar datos desde backup? Esto reemplazará tus datos actuales.')) return;
    Backup.importData(file).then(() => {
      alert('✅ Datos restaurados correctamente');
      location.reload();
    }).catch(err => {
      alert('❌ Error: ' + err);
    });
  }

  function showProfile() {
    const el = document.getElementById('tabContent');
    if (!el) return;
    const ud = Auth.getUserData();
    const settings = JSON.parse(localStorage.getItem('mc_settings') || '{}');

    el.innerHTML = `
      <div class="section">
        <button onclick="Mas.render(document.getElementById('tabContent'))" style="background:none;border:none;font-size:24px;cursor:pointer;margin-bottom:16px;color:var(--texto)">←</button>
        <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">👩 Mi Perfil</h2>

        <div class="card">
          <div class="label">Peso meta (kg)</div>
          <input type="number" id="profileGoalWeight" step="0.1" min="30" max="300"
            value="${ud.goalWeight || ''}" placeholder="ej: 65.0"
            style="width:100%;border:1px solid var(--borda);border-radius:var(--radius-sm);padding:12px;font-size:16px;font-family:inherit">
        </div>

        <div class="card">
          <div class="label">Meta de agua (vasos/día)</div>
          <input type="number" id="profileWaterGoal" min="4" max="16"
            value="${settings.waterGoal || 8}" placeholder="8"
            style="width:100%;border:1px solid var(--borda);border-radius:var(--radius-sm);padding:12px;font-size:16px;font-family:inherit">
        </div>

        ${Cycle.isMenopause() ? `
        <div class="card">
          <div class="label">Menopausia</div>
          <p style="font-size:13px;color:var(--texto-sub);margin-bottom:8px">Tienes "Menopausia" activada. Esto oculta las otras fases del ciclo en Mi Día.</p>
          <button onclick="Cycle.clearMenopause();Mas.showProfile()"
            style="background:var(--rosa);color:#fff;border:none;border-radius:var(--radius-sm);padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer">
            Desactivar menopausia
          </button>
        </div>` : ''}

        <button class="btn-primary" onclick="Mas.saveProfile()">Guardar perfil</button>
      </div>`;
  }

  function saveProfile() {
    const goalWeight = parseFloat(document.getElementById('profileGoalWeight').value) || null;
    const waterGoal = parseInt(document.getElementById('profileWaterGoal').value, 10) || 8;

    if (goalWeight) Auth.saveUserData({ goalWeight });

    const settings = JSON.parse(localStorage.getItem('mc_settings') || '{}');
    settings.waterGoal = waterGoal;
    localStorage.setItem('mc_settings', JSON.stringify(settings));

    alert('✅ Perfil guardado');
    render(document.getElementById('tabContent'));
  }

  function openLibrary() {
    window.open('../ebooks/portal.html', '_blank');
  }

  function openIG() {
    window.open('../ebooks/tabla-ig.html', '_blank');
  }

  function showAbout() {
    const el = document.getElementById('tabContent');
    if (!el) return;
    el.innerHTML = `
      <div class="section" style="text-align:center;padding-top:60px">
        <button onclick="Mas.render(document.getElementById('tabContent'))" style="background:none;border:none;font-size:24px;cursor:pointer;position:absolute;left:20px;top:20px;color:var(--texto)">←</button>
        <div style="font-size:48px;margin-bottom:12px">🧬</div>
        <h2 style="font-size:22px;font-weight:800;margin-bottom:4px">Mi Código</h2>
        <p style="font-size:13px;color:var(--texto-sub);margin-bottom:4px">v2.0 · El Código Hormonal</p>
        <p style="font-size:12px;color:var(--texto-sub)">Tu compañera diaria para el equilibrio hormonal</p>
        <div style="margin-top:32px;font-size:12px;color:var(--texto-sub)">© 2026 El Código Hormonal</div>
      </div>`;
  }

  return { render, showContent, showBackup, handleImport, showProfile, saveProfile, openLibrary, openIG, showAbout };
})();
```

- [ ] **Step 2: Verify syntax**

Run: `node -c "Quiz Nutriplan/mi-codigo-app/js/mas.js"`

---

### Task 8: Update `css/app.css` — New Component Styles

**Files:**
- Modify: `css/app.css`

- [ ] **Step 1: Add FAB and new navigation styles**

Append to end of `css/app.css`:

```css
/* =====================
   FAB (Floating Action Button)
   ===================== */
.nav-fab {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0;
  position: relative;
}

.fab-circle {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--verde), var(--verde-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  box-shadow: 0 4px 15px rgba(46, 125, 82, .4);
  margin-top: -20px;
  transition: transform .2s, box-shadow .2s;
}

.nav-fab:active .fab-circle {
  transform: scale(.92);
  box-shadow: 0 2px 8px rgba(46, 125, 82, .3);
}

.nav-fab .nav-label {
  color: var(--verde);
  font-weight: 700;
  margin-top: 2px;
}

.nav-fab.active .fab-circle {
  box-shadow: 0 4px 20px rgba(46, 125, 82, .5);
}
```

- [ ] **Step 2: Verify CSS is valid**

Run: Open in browser and verify no console errors (manual step)

---

### Task 9: Update `index.html` — New Navigation + Script Tags

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace bottom nav HTML**

Replace the existing `<nav class="bottom-nav">` block with the new 5-tab + FAB layout:

```html
  <!-- BOTTOM NAV -->
  <nav class="bottom-nav" aria-label="Navegación principal">
    <button class="nav-btn active" onclick="App.navigate('home')" data-tab="home" aria-label="Inicio">
      <span class="nav-icon" aria-hidden="true">🏠</span>
      <span class="nav-label">Home</span>
    </button>
    <button class="nav-btn" onclick="App.navigate('progress')" data-tab="progress" aria-label="Mi progreso">
      <span class="nav-icon" aria-hidden="true">📊</span>
      <span class="nav-label">Progreso</span>
    </button>
    <button class="nav-fab" onclick="App.navigate('midia')" data-tab="midia" aria-label="Mi Día">
      <div class="fab-circle" aria-hidden="true">☀️</div>
      <span class="nav-label">Mi Día</span>
    </button>
    <button class="nav-btn" onclick="App.navigate('compras')" data-tab="compras" aria-label="Lista de compras">
      <span class="nav-icon" aria-hidden="true">🛒</span>
      <span class="nav-label">Compras</span>
    </button>
    <button class="nav-btn" onclick="App.navigate('mas')" data-tab="mas" aria-label="Más opciones">
      <span class="nav-icon" aria-hidden="true">📖</span>
      <span class="nav-label">Más</span>
    </button>
  </nav>
```

- [ ] **Step 2: Add new script tags**

Before the existing `<script src="js/app.js">` line, add the new module scripts. Order matters — dependencies first:

```html
<script src="js/cycle.js"></script>
<script src="js/messages.js"></script>
<script src="js/backup.js"></script>
<script src="js/midia.js"></script>
<script src="js/shopping.js"></script>
<script src="js/mas.js"></script>
```

Full script order becomes:
1. chart.js (CDN)
2. auth.js
3. checkin.js
4. progress.js
5. recetas.js
6. cycle.js
7. messages.js
8. backup.js
9. midia.js
10. shopping.js
11. mas.js
12. app.js (last — orchestrator)

---

### Task 10: Update `js/app.js` — New Navigation and Home Dashboard

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Update `loadData` to include new data files**

In `loadData()`, update the files array:

```javascript
const files = ['dicas', 'plano', 'curso', 'suplementos', 'exercicios', 'recetas', 'mensajes', 'categoriasCompras'];
```

And update the fetch path for `categoriasCompras`:

```javascript
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
```

- [ ] **Step 2: Update `navigate` function**

Replace the `titles` object and `renderTab` dispatch:

```javascript
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
```

- [ ] **Step 3: Update `renderTab` dispatch**

```javascript
function renderTab(tab, container) {
  const renders = {
    home: renderHome,
    progress: renderProgress,
    midia: function(el) { MiDia.initState(); MiDia.render(el); },
    compras: function(el) { Shopping.render(el); },
    mas: function(el) { Mas.render(el); }
  };
  const fn = renders[tab];
  if (fn) fn(container);
}
```

- [ ] **Step 4: Rewrite `renderHome` for new dashboard**

Replace the entire `renderHome` function with the new dashboard that shows greeting, quick stats, Mi Día progress card, and daily tip:

```javascript
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

      <!-- Daily tip -->
      <div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:rgba(201,146,42,.2)">
        <div style="font-size:11px;font-weight:700;color:var(--dourado);margin-bottom:4px">💡 CONSEJO DEL DÍA</div>
        <div style="font-size:13px;color:#78350f;line-height:1.4">${getDicaHoje()}</div>
      </div>
    </div>`;
}
```

- [ ] **Step 5: Remove old renderContent and renderCheckin references**

Delete the `renderContent` function from `app.js` (its logic is now in `Mas.showContent()`). Keep `getDicaHoje` and `showLesson` as they are still used by Home dashboard and Mini-curso.

No `_renderContentSection` helper is needed — `Mas.showContent()` handles all sub-section rendering directly.

- [ ] **Step 6: Verify the app loads without errors**

Open `mi-codigo-app/index.html` in browser, check console for errors. Verify:
- 5 tabs visible with FAB center button
- Home dashboard renders with greeting, stats, progress card
- Clicking FAB opens Mi Día check-in
- Clicking Compras shows empty shopping list
- Clicking Más shows settings-style list

---

### Task 11: Update `js/progress.js` — Expanded Charts

**Files:**
- Modify: `js/progress.js`

- [ ] **Step 1: Rewrite `renderProgress` with period filter, expanded charts and stats**

Replace the entire contents of `progress.js` with:

```javascript
let weightChart = null;
let waterChart = null;
let currentPeriod = 30;

function filterByPeriod(allData, days) {
  if (days === 0) return allData; // "Todo"
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const filtered = {};
  Object.keys(allData).forEach(d => {
    if (d >= cutoffStr) filtered[d] = allData[d];
  });
  return filtered;
}

function getBestStreak(checkins) {
  const dates = Object.keys(checkins).sort();
  let best = 0, current = 0;
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { current = 1; }
    else {
      const prev = new Date(dates[i-1] + 'T12:00:00');
      const curr = new Date(dates[i] + 'T12:00:00');
      const diff = (curr - prev) / 86400000;
      current = (diff === 1) ? current + 1 : 1;
    }
    if (current > best) best = current;
  }
  return best;
}

function renderProgress(el) {
  const allCheckins = Checkin.getAll();
  const checkins = filterByPeriod(allCheckins, currentPeriod);
  const allWater = JSON.parse(localStorage.getItem('mc_water') || '{}');
  const water = filterByPeriod(allWater, currentPeriod);
  const allSleep = JSON.parse(localStorage.getItem('mc_sleep') || '{}');
  const sleepData = filterByPeriod(allSleep, currentPeriod);
  const ud = Auth.getUserData();
  const startWeight = ud.startWeight || null;
  const lastWeight = Checkin.getLastWeight();
  const lost = (startWeight && lastWeight) ? (startWeight - lastWeight).toFixed(1) : 0;
  const streak = Checkin.getStreak();
  const bestStreak = getBestStreak(allCheckins);
  const totalCheckins = Object.keys(allCheckins).length;
  // Monthly check-in %
  const now = new Date();
  const daysThisMonth = now.getDate();
  const monthStart = now.toISOString().split('T')[0].slice(0,8) + '01';
  const monthCheckins = Object.keys(allCheckins).filter(d => d >= monthStart).length;
  const monthPct = daysThisMonth > 0 ? Math.round((monthCheckins / daysThisMonth) * 100) : 0;

  // Averages
  const entries = Object.values(checkins);
  const avgEnergy = entries.length
    ? (entries.reduce((s,e) => s + (e.energia || 0), 0) / entries.length).toFixed(1) : '--';
  const sleepEntries = Object.values(sleepData).filter(s => s.hours);
  const avgSleep = sleepEntries.length
    ? (sleepEntries.reduce((s,e) => s + e.hours, 0) / sleepEntries.length).toFixed(1) : '--';
  // Mood frequency
  const moodCounts = {};
  entries.forEach(e => { if (e.humor) moodCounts[e.humor] = (moodCounts[e.humor]||0) + 1; });
  const topMood = Object.keys(moodCounts).sort((a,b) => moodCounts[b] - moodCounts[a])[0] || '--';
  const topMoodPct = entries.length && topMood !== '--' ? Math.round((moodCounts[topMood] / entries.length) * 100) : 0;
  const moodEmojis = { Genial: '🤩', Bien: '😊', Regular: '😐', Mal: '😢' };

  // Symptom frequency
  const symptomFreq = Cycle.getSymptomFrequency(currentPeriod || 9999);
  const prevSymptomFreq = Cycle.getSymptomFrequency(currentPeriod ? currentPeriod * 2 : 9999);

  // Weight history for chart
  const weightHistory = Object.keys(checkins).sort()
    .map(d => ({ date: d, peso: checkins[d].peso })).filter(x => x.peso);
  // Water history for chart (last 7 days of period)
  const waterDates = Object.keys(water).sort().slice(-7);

  // Period tabs
  const periods = [
    { val: 7, label: '7 días' }, { val: 30, label: '30 días' },
    { val: 90, label: '90 días' }, { val: 0, label: 'Todo' }
  ];

  el.innerHTML = `
    <div class="section">
      <!-- Period filter -->
      <div style="display:flex;background:#fff;border-radius:10px;padding:3px;margin-bottom:16px;border:1px solid var(--borda)">
        ${periods.map(p => `
          <div onclick="currentPeriod=${p.val};renderProgress(document.getElementById('tabContent'))"
            style="flex:1;text-align:center;padding:6px;font-size:12px;cursor:pointer;border-radius:8px;
            ${currentPeriod === p.val ? 'color:#fff;background:var(--verde);font-weight:700' : 'color:var(--texto-sub)'}">${p.label}</div>
        `).join('')}
      </div>

      <!-- Summary cards -->
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
          <div style="font-size:10px;color:var(--texto-sub);margin-bottom:2px">Peso inicial</div>
          <div style="font-size:18px;font-weight:800;color:var(--texto-sub)">${startWeight || '--'}</div>
          <div style="font-size:10px;color:var(--texto-sub)">kg</div>
        </div>
        <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
          <div style="font-size:10px;color:var(--texto-sub);margin-bottom:2px">Peso actual</div>
          <div style="font-size:18px;font-weight:800;color:var(--verde)">${lastWeight || '--'}</div>
          <div style="font-size:10px;color:var(--texto-sub)">kg</div>
        </div>
        <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0;background:var(--verde-light);border-color:rgba(46,125,82,.2)">
          <div style="font-size:10px;color:var(--verde);margin-bottom:2px">Perdidos</div>
          <div style="font-size:18px;font-weight:800;color:var(--verde)">${lost > 0 ? '−' + lost : '0'}</div>
          <div style="font-size:10px;color:var(--verde)">kg ${lost > 0 ? '🎉' : ''}</div>
        </div>
      </div>

      <!-- Weight chart -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:13px;font-weight:700">⚖️ Peso</span>
          ${weightHistory.length >= 2 ? '<span style="font-size:11px;color:var(--verde);font-weight:600">↓ tendencia</span>' : ''}
        </div>
        ${weightHistory.length < 2
          ? '<p style="font-size:13px;color:var(--texto-sub);text-align:center;padding:20px 0">Registra tu peso en Mi Día.<br>El gráfico aparece con 2+ registros.</p>'
          : '<canvas id="weightCanvas" height="180"></canvas>'}
      </div>

      <!-- Water chart -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:13px;font-weight:700">💧 Agua</span>
          <span style="font-size:11px;color:#3b82f6;font-weight:600">${waterDates.length ? (waterDates.reduce((s,d) => s + (water[d]||0), 0) / waterDates.length).toFixed(1) : '--'} vasos/día</span>
        </div>
        ${waterDates.length === 0
          ? '<p style="font-size:13px;color:var(--texto-sub);text-align:center;padding:20px 0">Registra tu agua en Mi Día para ver el gráfico.</p>'
          : '<canvas id="waterCanvas" height="120"></canvas>'}
      </div>

      <!-- Averages -->
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
          <div style="font-size:11px;color:var(--texto-sub);margin-bottom:4px">Humor</div>
          <div style="font-size:22px">${moodEmojis[topMood] || '😐'}</div>
          <div style="font-size:11px;font-weight:600;color:var(--dourado)">${topMood} (${topMoodPct}%)</div>
        </div>
        <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
          <div style="font-size:11px;color:var(--texto-sub);margin-bottom:4px">Energía</div>
          <div style="font-size:18px;font-weight:800;color:var(--verde)">${avgEnergy}</div>
          <div style="font-size:11px;font-weight:600;color:var(--verde)">promedio</div>
        </div>
        <div class="card" style="flex:1;text-align:center;padding:10px;margin-bottom:0">
          <div style="font-size:11px;color:var(--texto-sub);margin-bottom:4px">Sueño</div>
          <div style="font-size:18px;font-weight:800;color:#6366f1">${avgSleep}h</div>
          <div style="font-size:11px;font-weight:600;color:#6366f1">promedio</div>
        </div>
      </div>

      <!-- Streak card -->
      <div class="card" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:rgba(201,146,42,.2)">
        <div style="font-size:13px;font-weight:700;color:#78350f;margin-bottom:8px">🔥 Racha y Constancia</div>
        <div style="display:flex;gap:12px">
          <div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--dourado)">${streak}</div><div style="font-size:10px;color:#92400e">días seguidos</div></div>
          <div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--dourado)">${monthPct}%</div><div style="font-size:10px;color:#92400e">check-ins este mes</div></div>
          <div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--dourado)">${bestStreak}</div><div style="font-size:10px;color:#92400e">mejor racha</div></div>
        </div>
      </div>

      <!-- Hormonal symptoms -->
      ${Object.keys(symptomFreq).length > 0 ? `
      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">🌸 Síntomas Hormonales</div>
        <div style="font-size:11px;color:var(--texto-sub);margin-bottom:8px">Frecuencia en el período:</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${Object.entries(symptomFreq).sort((a,b) => b[1] - a[1]).map(([s, count]) => {
            const prevCount = prevSymptomFreq[s] || 0;
            const diff = currentPeriod > 0 && prevCount > 0 ? Math.round(((count - prevCount) / prevCount) * 100) : null;
            const highFreq = count >= 5;
            return '<span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;' +
              (highFreq ? 'background:#fef2f2;color:var(--rosa)' : 'background:var(--bg);color:var(--texto-sub)') +
              '">' + s + ' × ' + count +
              (diff !== null && diff !== 0 ? ' <span style="font-size:10px">' + (diff < 0 ? '↓' : '↑') + Math.abs(diff) + '%</span>' : '') +
              '</span>';
          }).join('')}
        </div>
      </div>` : ''}

    </div>`;

  // ── Render Charts ──
  setTimeout(function() {
    // Weight chart
    if (weightHistory.length >= 2) {
      const canvas = document.getElementById('weightCanvas');
      if (canvas) {
        if (weightChart) { weightChart.destroy(); weightChart = null; }
        weightChart = new Chart(canvas, {
          type: 'line',
          data: {
            labels: weightHistory.map(h => new Date(h.date + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })),
            datasets: [{ label: 'Peso (kg)', data: weightHistory.map(h => h.peso),
              borderColor: '#2E7D52', backgroundColor: 'rgba(46,125,82,.08)', borderWidth: 2,
              pointRadius: 4, pointBackgroundColor: '#2E7D52', tension: 0.3, fill: true }]
          },
          options: { responsive: true, plugins: { legend: { display: false } },
            scales: { y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 } } },
              x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } } } }
        });
      }
    }
    // Water chart
    if (waterDates.length > 0) {
      const wCanvas = document.getElementById('waterCanvas');
      if (wCanvas) {
        if (waterChart) { waterChart.destroy(); waterChart = null; }
        waterChart = new Chart(wCanvas, {
          type: 'bar',
          data: {
            labels: waterDates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('es', { weekday: 'short' })),
            datasets: [{ label: 'Vasos', data: waterDates.map(d => water[d] || 0),
              backgroundColor: '#93c5fd', borderRadius: 4, borderSkipped: false }]
          },
          options: { responsive: true, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 12, grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 }, stepSize: 2 } },
              x: { grid: { display: false }, ticks: { font: { size: 10 } } } } }
        });
      }
    }
  }, 50);
}
```

---

### Task 12: Update `sw.js` — Cache New Files

**Files:**
- Modify: `sw.js`

- [ ] **Step 1: Bump cache version and add new assets**

Change cache name and add all new files:

```javascript
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
```

---

### Task 13: Integration Testing

- [ ] **Step 1: Test navigation**

Open app in browser. Verify all 5 tabs navigate correctly. FAB button opens Mi Día. Header title updates for each tab.

- [ ] **Step 2: Test Mi Día check-in flow**

Fill in all fields: peso, energia slider, mood, water cups, meals, supplement, exercise, sleep hours + quality, cycle phase, symptoms. Hit "Guardar Mi Día". Verify:
- Data persists in localStorage (check DevTools → Application → Local Storage)
- Success feedback shows
- Redirects to Home
- Home dashboard shows updated stats

- [ ] **Step 3: Test shopping list**

Add manual item → verify it appears. Add from recipe → verify ingredients appear with category grouping and source tag. Check items → verify strikethrough. Share → verify text is generated. Clear → verify checked items removed.

- [ ] **Step 4: Test progress screen**

After 2+ check-ins with weight data, verify weight chart renders. Toggle period selector. Verify streak card shows correct data.

- [ ] **Step 5: Test backup**

Go to Más → Exportar/Importar. Export → verify JSON file downloads. Clear localStorage. Import file → verify all data restored.

- [ ] **Step 6: Test Más tab**

Verify all links work: Recetas opens recipe browser, Biblioteca opens portal, Profile saves settings, About shows version info.

- [ ] **Step 7: Test PWA offline**

Close server. Verify app still loads from Service Worker cache with new files.
