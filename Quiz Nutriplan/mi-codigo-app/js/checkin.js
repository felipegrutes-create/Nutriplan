const Checkin = (() => {
  const LS_KEY = 'mc_checkins';
  const AUTH_KEY = 'mc_auth';

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function save(date, entry) {
    const all = getAll();
    all[date] = { ...all[date], ...entry, updatedAt: Date.now() };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
    // If first weight ever, save as startWeight in auth data
    if (entry.peso) {
      try {
        const ud = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
        if (!ud.startWeight) {
          ud.startWeight = entry.peso;
          localStorage.setItem(AUTH_KEY, JSON.stringify(ud));
        }
      } catch {
        // fail silently
      }
    }
  }

  function getStreak() {
    const all = getAll();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (all[key]) {
        streak++;
      } else if (i > 0) {
        break; // gap found — stop counting
      }
    }
    return streak;
  }

  function getLastWeight() {
    const all = getAll();
    const dates = Object.keys(all).sort().reverse();
    for (const d of dates) {
      if (all[d].peso) return all[d].peso;
    }
    return null;
  }

  function getWeightHistory() {
    const all = getAll();
    return Object.keys(all)
      .sort()
      .map(d => ({ date: d, peso: all[d].peso }))
      .filter(x => x.peso);
  }

  return { getAll, save, getStreak, getLastWeight, getWeightHistory };
})();

// ─── Check-in Tab Renderer ───────────────────────────────────────────────────
// Called by app.js renderTab dispatch (renderCheckin is global)

function renderCheckin(el) {
  const todayKey = new Date().toISOString().split('T')[0];
  const checkins = Checkin.getAll();
  const existing = checkins[todayKey] || {};

  el.innerHTML = `
    <div class="section">
      <p style="font-size:13px;color:var(--texto-sub);margin-bottom:20px">Registra cómo te sientes hoy. Solo toma 60 segundos.</p>

      <!-- ENERGY SLIDER -->
      <div class="card">
        <div class="label">Energía de hoy (1–10)</div>
        <input type="range" id="ciEnergia" min="1" max="10" value="${existing.energia || 5}"
          style="width:100%;accent-color:var(--verde);margin:8px 0" aria-label="Nivel de energía">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--texto-sub)">
          <span>Sin energía</span>
          <span id="energiaVal" style="font-weight:700;color:var(--verde)">${existing.energia || 5}</span>
          <span>Llena de energía</span>
        </div>
      </div>

      <!-- HUMOR -->
      <div class="card">
        <div class="label">Humor</div>
        <div style="display:flex;gap:8px" role="group" aria-label="Estado de humor">
          ${['😊 Bien', '😐 Regular', '😔 Mal'].map(function(h) {
            const val = h.split(' ')[1];
            const active = existing.humor === val;
            return `<button onclick="selectHumor(this,'${val}')" data-humor="${val}"
              style="flex:1;padding:10px 6px;border-radius:var(--radius-sm);border:2px solid ${active ? 'var(--verde)' : 'var(--borda)'};background:${active ? 'var(--verde-light)' : '#fff'};cursor:pointer;font-size:14px;font-weight:${active ? '700' : '400'}"
              aria-pressed="${active}">${h}</button>`;
          }).join('')}
        </div>
      </div>

      <!-- SYMPTOMS -->
      <div class="card">
        <div class="label">Síntomas de hoy (selecciona todos los que apliquen)</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px" id="sintomasBtns" role="group" aria-label="Síntomas">
          ${['Hinchazón', 'Bien dormida', 'Antojo de dulce', 'Dolor de cabeza', 'Cansancio', 'Sin síntomas'].map(function(s) {
            const active = (existing.sintomas || []).includes(s);
            return `<button onclick="toggleSintoma(this,'${s}')" data-sintoma="${s}" data-active="${active ? '1' : '0'}"
              style="padding:6px 12px;border-radius:99px;border:1.5px solid ${active ? 'var(--verde)' : 'var(--borda)'};background:${active ? 'var(--verde-light)' : '#fff'};cursor:pointer;font-size:12px;color:${active ? 'var(--verde)' : 'var(--texto-sub)'};font-weight:${active ? '700' : '400'}"
              aria-pressed="${active}">${s}</button>`;
          }).join('')}
        </div>
      </div>

      <!-- WEIGHT -->
      <div class="card">
        <div class="label">Peso de hoy (kg) — opcional</div>
        <input type="number" id="ciPeso" step="0.1" min="30" max="300"
          value="${existing.peso || ''}" placeholder="ej: 75.5"
          style="width:100%;border:1.5px solid var(--borda);border-radius:var(--radius-sm);padding:12px;font-size:16px;font-family:'DM Sans',sans-serif;outline:none"
          onfocus="this.style.borderColor='var(--verde)'" onblur="this.style.borderColor='var(--borda)'"
          aria-label="Peso en kilogramos">
      </div>

      <button class="btn-primary" onclick="saveCheckin('${todayKey}')" style="margin-top:4px">Registrar check-in ✓</button>

      ${existing.energia ? `
      <p style="text-align:center;font-size:12px;color:var(--verde);font-weight:700;margin-top:12px">
        ✓ Ya registraste el check-in de hoy
      </p>` : ''}
    </div>
  `;

  // Live range update
  const slider = document.getElementById('ciEnergia');
  const valDisplay = document.getElementById('energiaVal');
  if (slider && valDisplay) {
    slider.addEventListener('input', function() {
      valDisplay.textContent = this.value;
    });
  }
}

// ─── Global helpers (called from inline onclick) ──────────────────────────────

window.selectHumor = function(btn, val) {
  document.querySelectorAll('[data-humor]').forEach(function(b) {
    const isActive = b.dataset.humor === val;
    b.style.border = isActive ? '2px solid var(--verde)' : '2px solid var(--borda)';
    b.style.background = isActive ? 'var(--verde-light)' : '#fff';
    b.style.fontWeight = isActive ? '700' : '400';
    b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
};

window.toggleSintoma = function(btn, val) {
  const isActive = btn.dataset.active === '1';
  const newActive = !isActive;
  btn.dataset.active = newActive ? '1' : '0';
  btn.style.border = newActive ? '1.5px solid var(--verde)' : '1.5px solid var(--borda)';
  btn.style.background = newActive ? 'var(--verde-light)' : '#fff';
  btn.style.color = newActive ? 'var(--verde)' : 'var(--texto-sub)';
  btn.style.fontWeight = newActive ? '700' : '400';
  btn.setAttribute('aria-pressed', newActive ? 'true' : 'false');
};

window.saveCheckin = function(date) {
  const slider = document.getElementById('ciEnergia');
  const energia = slider ? parseInt(slider.value, 10) : 5;

  const activeHumor = document.querySelector('[data-humor][style*="verde-light"]');
  const humor = activeHumor ? activeHumor.dataset.humor : 'Regular';

  const sintomas = Array.from(
    document.querySelectorAll('[data-sintoma][data-active="1"]')
  ).map(function(b) { return b.dataset.sintoma; });

  const pesoInput = document.getElementById('ciPeso');
  const pesoVal = pesoInput ? pesoInput.value.trim() : '';
  const peso = pesoVal ? parseFloat(pesoVal) : null;

  const entry = { energia, humor, sintomas };
  if (peso && !isNaN(peso)) entry.peso = peso;

  Checkin.save(date, entry);

  // Success feedback then navigate home
  const btn = document.querySelector('.btn-primary');
  if (btn) {
    btn.textContent = '✓ ¡Guardado!';
    btn.style.background = 'var(--verde-dark)';
    btn.disabled = true;
  }
  setTimeout(function() { App.navigate('home'); }, 1200);
};
