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

function _renderGoalProgress(startWeight, goalWeight, lastWeight) {
  if (startWeight && goalWeight && lastWeight && startWeight > goalWeight) {
    const totalToLose = startWeight - goalWeight;
    const lostSoFar = startWeight - lastWeight;
    const pct = Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
    const motivMsg = pct === 0 ? '¡Tu viaje empieza hoy! 💪'
      : pct < 25 ? '¡Buen inicio! Cada paso cuenta 🌱'
      : pct < 50 ? '¡Vas avanzando! No te detengas 🔥'
      : pct < 75 ? '¡Más de la mitad! Increíble 🌟'
      : pct < 100 ? '¡Casi llegas a tu meta! 🏆'
      : '🎉 ¡Alcanzaste tu meta! ¡Felicidades!';
    return '<div style="margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<span style="font-size:11px;color:var(--texto-sub)">Progreso hacia tu meta</span>' +
        '<span style="font-size:12px;font-weight:800;color:var(--verde)">' + pct + '%</span>' +
      '</div>' +
      '<div style="height:12px;background:#E5E7EB;border-radius:6px;overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--verde),#4ade80);border-radius:6px;transition:width .5s"></div>' +
      '</div>' +
      '<div style="text-align:center;margin-top:8px;font-size:12px;font-weight:600;color:var(--dourado)">' + motivMsg + '</div>' +
    '</div>';
  }
  if (!goalWeight && lastWeight) {
    return '<div style="background:#fffbeb;border-radius:10px;padding:10px;text-align:center;margin-bottom:14px">' +
      '<div style="font-size:12px;color:#92400e">Define tu <strong>peso meta</strong> en Más → Perfil para ver tu progreso visual</div>' +
    '</div>';
  }
  return '';
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
  const goalWeight = ud.goalWeight || null;
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

  // Symptom frequency — current period vs previous period (isolated)
  const symptomFreq = Cycle.getSymptomFrequency(currentPeriod || 9999);
  // For comparison: get double-period and subtract current to isolate previous period
  const doublePeriodFreq = currentPeriod > 0 ? Cycle.getSymptomFrequency(currentPeriod * 2) : {};
  const prevSymptomFreq = {};
  Object.keys(doublePeriodFreq).forEach(s => {
    prevSymptomFreq[s] = (doublePeriodFreq[s] || 0) - (symptomFreq[s] || 0);
  });

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

      <!-- Weight hero section -->
      <div class="card" style="padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <span style="font-size:15px;font-weight:800">⚖️ Tu Peso</span>
          ${lost > 0 ? `<span style="background:var(--verde-light);color:var(--verde);font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px">🎉 −${lost} kg</span>` : ''}
        </div>

        <!-- Weight numbers -->
        <div style="display:flex;gap:0;margin-bottom:16px;text-align:center">
          <div style="flex:1;padding:10px 0;border-right:1px solid var(--borda)">
            <div style="font-size:10px;color:var(--texto-sub);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Inicio</div>
            <div style="font-size:22px;font-weight:800;color:var(--texto)">${startWeight || '--'}</div>
            <div style="font-size:10px;color:var(--texto-sub)">kg</div>
          </div>
          <div style="flex:1;padding:10px 0;border-right:1px solid var(--borda)">
            <div style="font-size:10px;color:var(--verde);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;font-weight:700">Actual</div>
            <div style="font-size:28px;font-weight:800;color:var(--verde)">${lastWeight || '--'}</div>
            <div style="font-size:10px;color:var(--verde)">kg</div>
          </div>
          <div style="flex:1;padding:10px 0">
            <div style="font-size:10px;color:var(--dourado);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;font-weight:700">Meta</div>
            <div style="font-size:22px;font-weight:800;color:var(--dourado)">${goalWeight || '--'}</div>
            <div style="font-size:10px;color:var(--dourado)">kg</div>
          </div>
        </div>

        ${_renderGoalProgress(startWeight, goalWeight, lastWeight)}

        <!-- Chart -->
        ${weightHistory.length >= 2
          ? '<canvas id="weightCanvas" height="160"></canvas>'
          : (weightHistory.length === 1
            ? `<div style="text-align:center;padding:12px 0;color:var(--texto-sub);font-size:12px">
                <div style="font-size:32px;margin-bottom:4px">📊</div>
                1 registro. El gráfico aparece con 2+ registros.<br>¡Sigue registrando en Mi Día!
              </div>`
            : `<div style="text-align:center;padding:12px 0;color:var(--texto-sub);font-size:12px">
                <div style="font-size:32px;margin-bottom:4px">⚖️</div>
                Registra tu peso en Mi Día para comenzar.
              </div>`)}
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

      <!-- Medical report button -->
      <div class="card" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-color:rgba(59,130,246,.2);cursor:pointer;display:flex;align-items:center;gap:12px" onclick="generateMedicalReport()">
        <div style="width:44px;height:44px;background:#3b82f6;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🩺</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:#1e3a5f">Reporte para mi médico</div>
          <div style="font-size:11px;color:#3b82f6">Genera un resumen con todos tus datos de salud</div>
        </div>
        <div style="font-size:18px;color:#3b82f6">›</div>
      </div>

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

function generateMedicalReport() {
  const allCheckins = Checkin.getAll();
  const allWater = JSON.parse(localStorage.getItem('mc_water') || '{}');
  const allSleep = JSON.parse(localStorage.getItem('mc_sleep') || '{}');
  const allCycle = Cycle.getAll();
  const ud = Auth.getUserData();
  const startWeight = ud.startWeight || null;
  const goalWeight = ud.goalWeight || null;
  const lastWeight = Checkin.getLastWeight();
  const weightHistory = Checkin.getWeightHistory();

  const dates = Object.keys(allCheckins).sort();
  const firstDate = dates[0] || '--';
  const lastDate = dates[dates.length - 1] || '--';
  const totalDays = dates.length;

  // Weight stats
  const weights = weightHistory.map(w => w.peso);
  const minWeight = weights.length ? Math.min(...weights) : '--';
  const maxWeight = weights.length ? Math.max(...weights) : '--';

  // Energy avg
  const entries = Object.values(allCheckins);
  const avgEnergy = entries.length
    ? (entries.reduce((s, e) => s + (e.energia || 0), 0) / entries.length).toFixed(1) : '--';

  // Sleep avg
  const sleepEntries = Object.values(allSleep).filter(s => s.hours);
  const avgSleep = sleepEntries.length
    ? (sleepEntries.reduce((s, e) => s + e.hours, 0) / sleepEntries.length).toFixed(1) : '--';
  const sleepQualityCounts = {};
  sleepEntries.forEach(s => {
    if (s.quality) sleepQualityCounts[s.quality] = (sleepQualityCounts[s.quality] || 0) + 1;
  });

  // Mood distribution
  const moodCounts = {};
  entries.forEach(e => { if (e.humor) moodCounts[e.humor] = (moodCounts[e.humor] || 0) + 1; });

  // Water avg
  const waterValues = Object.values(allWater);
  const avgWater = waterValues.length
    ? (waterValues.reduce((s, v) => s + v, 0) / waterValues.length).toFixed(1) : '--';

  // Symptoms
  const symptomFreq = Cycle.getSymptomFrequency(0);
  const symptomList = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1]);

  // Cycle phases
  const phaseCounts = {};
  Object.values(allCycle).forEach(c => {
    if (c.phase) phaseCounts[c.phase] = (phaseCounts[c.phase] || 0) + 1;
  });

  // Weight history table rows
  const weightRows = weightHistory.map(w =>
    '<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">' +
    new Date(w.date + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) +
    '</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">' +
    w.peso + ' kg</td></tr>'
  ).join('');

  const today = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });

  const reportHTML = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Reporte de Salud - Mi Código</title>' +
    '<style>' +
      'body{font-family:DM Sans,system-ui,sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#1f2937;font-size:14px;line-height:1.6}' +
      'h1{color:#2E7D52;font-size:22px;margin-bottom:4px}' +
      'h2{color:#2E7D52;font-size:16px;border-bottom:2px solid #2E7D52;padding-bottom:4px;margin-top:24px}' +
      '.meta{color:#6b7280;font-size:12px;margin-bottom:20px}' +
      '.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:12px 0}' +
      '.stat{background:#f9fafb;border-radius:8px;padding:10px;text-align:center}' +
      '.stat-label{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}' +
      '.stat-value{font-size:20px;font-weight:800;color:#2E7D52;margin:2px 0}' +
      '.stat-unit{font-size:10px;color:#6b7280}' +
      'table{width:100%;border-collapse:collapse;font-size:13px}' +
      'th{text-align:left;padding:6px 8px;background:#f3f4f6;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280}' +
      '.symptom{display:inline-block;background:#fef2f2;color:#E8445A;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;margin:2px}' +
      '.disclaimer{margin-top:24px;padding:12px;background:#fffbeb;border-radius:8px;font-size:11px;color:#92400e}' +
      '.actions{margin-top:20px;text-align:center}' +
      '.btn{background:#2E7D52;color:#fff;border:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin:4px}' +
      '@media print{.actions{display:none} body{padding:0}}' +
    '</style></head><body>' +
    '<h1>🩺 Reporte de Salud</h1>' +
    '<p class="meta">Generado el ' + today + ' · Período de seguimiento: ' + totalDays + ' días (' + firstDate + ' a ' + lastDate + ')</p>' +

    '<h2>⚖️ Peso Corporal</h2>' +
    '<div class="grid">' +
      '<div class="stat"><div class="stat-label">Inicio</div><div class="stat-value">' + (startWeight || '--') + '</div><div class="stat-unit">kg</div></div>' +
      '<div class="stat"><div class="stat-label">Actual</div><div class="stat-value">' + (lastWeight || '--') + '</div><div class="stat-unit">kg</div></div>' +
      '<div class="stat"><div class="stat-label">Variación</div><div class="stat-value">' + (startWeight && lastWeight ? (startWeight - lastWeight > 0 ? '−' : '+') + Math.abs(startWeight - lastWeight).toFixed(1) : '--') + '</div><div class="stat-unit">kg</div></div>' +
    '</div>' +
    (goalWeight ? '<p style="font-size:12px;color:#6b7280">Meta establecida: <strong>' + goalWeight + ' kg</strong></p>' : '') +
    (weightRows ? '<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px;color:#2E7D52;font-weight:600">Ver historial de peso (' + weightHistory.length + ' registros)</summary><table style="margin-top:8px"><tr><th>Fecha</th><th style="text-align:right">Peso</th></tr>' + weightRows + '</table></details>' : '') +

    '<h2>💧 Hidratación</h2>' +
    '<div class="grid">' +
      '<div class="stat"><div class="stat-label">Promedio diario</div><div class="stat-value">' + avgWater + '</div><div class="stat-unit">vasos/día</div></div>' +
      '<div class="stat"><div class="stat-label">Días registrados</div><div class="stat-value">' + waterValues.length + '</div><div class="stat-unit">días</div></div>' +
      '<div class="stat"><div class="stat-label">Meta</div><div class="stat-value">8</div><div class="stat-unit">vasos/día</div></div>' +
    '</div>' +

    '<h2>😊 Estado de Ánimo</h2>' +
    (Object.keys(moodCounts).length > 0 ?
      '<div class="grid">' + Object.entries(moodCounts).sort((a,b) => b[1] - a[1]).map(function(m) {
        var emojis = { Genial: '🤩', Bien: '😊', Regular: '😐', Mal: '😢' };
        var pct = Math.round((m[1] / entries.length) * 100);
        return '<div class="stat"><div style="font-size:24px">' + (emojis[m[0]] || '😐') + '</div><div class="stat-value" style="font-size:16px">' + pct + '%</div><div class="stat-unit">' + m[0] + ' (' + m[1] + 'd)</div></div>';
      }).join('') + '</div>'
    : '<p style="color:#6b7280">Sin datos de ánimo registrados.</p>') +

    '<h2>⚡ Energía</h2>' +
    '<div class="grid">' +
      '<div class="stat"><div class="stat-label">Promedio</div><div class="stat-value">' + avgEnergy + '</div><div class="stat-unit">de 10</div></div>' +
    '</div>' +

    '<h2>😴 Sueño</h2>' +
    '<div class="grid">' +
      '<div class="stat"><div class="stat-label">Promedio</div><div class="stat-value">' + avgSleep + '</div><div class="stat-unit">horas/noche</div></div>' +
      '<div class="stat"><div class="stat-label">Días registrados</div><div class="stat-value">' + sleepEntries.length + '</div><div class="stat-unit">noches</div></div>' +
    '</div>' +
    (Object.keys(sleepQualityCounts).length > 0 ?
      '<p style="font-size:12px;color:#6b7280;margin-top:6px">Calidad: ' + Object.entries(sleepQualityCounts).map(function(q) {
        var labels = { buena: '😴 Buena', regular: '😐 Regular', mala: '😫 Mala' };
        return (labels[q[0]] || q[0]) + ' (' + q[1] + ')';
      }).join(', ') + '</p>'
    : '') +

    '<h2>🌸 Ciclo y Síntomas Hormonales</h2>' +
    (Cycle.isMenopause() ? '<p style="font-size:13px;font-weight:600;color:#E8445A">Estado: Menopausia</p>' : '') +
    (Object.keys(phaseCounts).length > 0 ?
      '<p style="font-size:12px;color:#6b7280">Fases registradas: ' + Object.entries(phaseCounts).map(function(p) {
        return p[0] + ' (' + p[1] + ' días)';
      }).join(', ') + '</p>'
    : '') +
    (symptomList.length > 0 ?
      '<div style="margin-top:8px">' + symptomList.map(function(s) {
        return '<span class="symptom">' + s[0] + ' × ' + s[1] + '</span>';
      }).join('') + '</div>'
    : '<p style="color:#6b7280">Sin síntomas registrados.</p>') +

    '<div class="disclaimer">⚠️ Este reporte es un registro de hábitos generado por la app Mi Código. No constituye un diagnóstico médico. Consulte siempre con su profesional de salud.</div>' +

    '<div class="actions">' +
      '<button class="btn" onclick="window.print()">🖨️ Imprimir / PDF</button>' +
      '<button class="btn" style="background:#25D366" onclick="shareMedicalReport()">📱 Compartir</button>' +
    '</div>' +

    '<script>' +
    'function shareMedicalReport(){' +
      'var el=document.createElement("textarea");el.style.cssText="position:fixed;opacity:0";' +
      'el.value=document.body.innerText;document.body.appendChild(el);el.select();' +
      'document.execCommand("copy");el.remove();alert("✅ Reporte copiado. Pégalo en WhatsApp o email.")' +
    '}' +
    '<\/script>' +
    '</body></html>';

  var reportWindow = window.open('', '_blank');
  if (reportWindow) {
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  }
}
