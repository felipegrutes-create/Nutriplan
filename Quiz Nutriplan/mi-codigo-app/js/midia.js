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

  // ── Render function ──
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

    let html = '<div class="section">';

    // ── Motivational message ──
    html += Messages.renderCard(data, streak);

    // ── CUERPO section ──
    html += '<div class="label" style="color:var(--verde)">⚖️ CUERPO</div>';

    // Peso
    const lastWeight = Checkin.getLastWeight();
    const needsWeight = !lastWeight && !_peso;
    html += `
      <div class="card" style="display:flex;justify-content:space-between;align-items:center;${needsWeight ? 'border-color:var(--rosa);background:#fef2f2;' : ''}">
        <div>
          <div style="font-size:13px;font-weight:600">Peso</div>
          ${needsWeight
            ? '<div style="font-size:11px;color:var(--rosa);font-weight:600">⬅️ Ingresa tu peso</div>'
            : `<div style="font-size:11px;color:var(--texto-sub)">Último: ${lastWeight ? lastWeight + ' kg' : '--'}</div>`}
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <input type="number" id="mdPeso" step="0.1" min="30" max="300"
            value="${_peso || (lastWeight ? lastWeight : '')}" placeholder="Tu peso"
            style="background:#fff;border:${needsWeight ? '2px solid var(--rosa)' : '1px solid var(--borda)'};border-radius:var(--radius-sm);padding:6px 12px;font-size:16px;font-weight:700;width:80px;text-align:center;font-family:inherit"
            aria-label="Peso en kg">
          <span style="font-size:12px;color:var(--texto-sub)">kg</span>
        </div>
      </div>`;

    // Energía
    html += `
      <div class="card">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:13px;font-weight:600">Energía</span>
          <span id="mdEnergiaVal" style="font-size:13px;font-weight:700;color:var(--verde)">${_energia}/10</span>
        </div>
        <input type="range" id="mdEnergia" min="1" max="10" value="${_energia}"
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
              ${disabled ? 'opacity:.5;pointer-events:none;' : ''}
              ${active && p.id === 'menopausia' ? 'pointer-events:auto;opacity:1;' : ''}">
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
  let _peso = '';
  let _energia = 5;

  // Capture peso/energia from DOM before re-render to avoid losing user input
  function _captureDOMState() {
    const pesoEl = document.getElementById('mdPeso');
    if (pesoEl) _peso = pesoEl.value;
    const energiaEl = document.getElementById('mdEnergia');
    if (energiaEl) _energia = parseInt(energiaEl.value, 10);
  }

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
    _peso = checkin.peso || '';
    _energia = checkin.energia || 5;
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
    _captureDOMState();
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
    _captureDOMState();
    _meals[name] = !_meals[name];
    const today = todayKey();
    const store = getStore('mc_meals');
    store[today] = _meals;
    setStore('mc_meals', store);
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function toggleSupp() {
    _captureDOMState();
    _supp = !_supp;
    const today = todayKey();
    const store = getStore('mc_supplements');
    store[today] = _supp;
    setStore('mc_supplements', store);
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function toggleExercise() {
    _captureDOMState();
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
    _captureDOMState();

    // Toggle off: if already selected, deselect
    if (_phase === id) {
      _phase = null;
      if (id === 'menopausia') Cycle.clearMenopause();
      const today = todayKey();
      Cycle.save(today, { phase: null, symptoms: _symptoms });
      const el = document.getElementById('tabContent');
      if (el) render(el);
      return;
    }

    // Menopausia: confirm before activating
    if (id === 'menopausia') {
      if (!confirm('¿Estás en menopausia?\n\nEsto ajusta tu seguimiento hormonal. Puedes desactivarlo tocando de nuevo.')) {
        return;
      }
    }

    _phase = id;
    const today = todayKey();
    Cycle.save(today, { phase: id, symptoms: _symptoms });
    const el = document.getElementById('tabContent');
    if (el) render(el);
  }

  function toggleSymptom(name) {
    _captureDOMState();
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
