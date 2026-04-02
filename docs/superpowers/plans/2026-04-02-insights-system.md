# Insights "Tus Descubrimientos" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a correlation-based insights system ("Tus Descubrimientos") to Mi Codigo that turns daily check-in data into personalized, empathetic health insights.

**Architecture:** Three layers inside the existing MiCodigo IIFE in `portal.html`: (1) InsightsEngine — pure functions computing 8 correlations from localStorage, (2) InsightsGenerator — templates producing human-readable Spanish text with positive/empathetic tone, (3) UI — cards in renderHome + inline tooltips in renderMiDia. All client-side, no backend.

**Tech Stack:** Vanilla JS (ES5, matching existing codebase), inline styles (matching existing pattern), localStorage.

**Key file:** `Quiz Nutriplan/ebooks/portal.html` — all changes go in this single file inside the `MiCodigo` IIFE (lines ~2476–4170).

---

### Task 1: Insights Engine — Data Helpers and Level System

**Files:**
- Modify: `Quiz Nutriplan/ebooks/portal.html` — insert after line ~2708 (after `function isFav(id)` block, before recipe helpers)

- [ ] **Step 1: Add the insights level calculator and cache variable**

Insert this code block after the `isFav` function (around line 2708):

```javascript
  // ════════════════════════════════════════════════════════════
  // INSIGHTS ENGINE — "Tus Descubrimientos"
  // ════════════════════════════════════════════════════════════
  var _cachedInsights = null;
  var _insightsCacheDay = '';

  function getInsightsLevel() {
    var days = Object.keys(getCheckins()).length;
    if (days >= 30) return 4;
    if (days >= 14) return 3;
    if (days >= 7) return 2;
    if (days >= 3) return 1;
    return 0;
  }

  function getCheckinDays() {
    return Object.keys(getCheckins()).length;
  }
```

- [ ] **Step 2: Verify no syntax errors**

Open portal.html in browser, open console, type `MiCodigo.isPremium()`. Should return without JS errors on the page.

- [ ] **Step 3: Commit**

```bash
git add "Quiz Nutriplan/ebooks/portal.html"
git commit -m "feat(insights): add level calculator and cache scaffolding"
```

---

### Task 2: Insights Engine — The 8 Correlation Functions

**Files:**
- Modify: `Quiz Nutriplan/ebooks/portal.html` — insert directly after the code added in Task 1

- [ ] **Step 1: Add all 8 correlation functions**

Insert after the `getCheckinDays` function:

```javascript
  function calcWeightTrend() {
    var checkins = getCheckins();
    var dates = Object.keys(checkins).sort().reverse();
    var recent = [], prev = [];
    for (var i = 0; i < dates.length && recent.length < 7; i++) {
      if (checkins[dates[i]].peso) recent.push(checkins[dates[i]].peso);
    }
    for (var j = recent.length; j < dates.length && prev.length < 7; j++) {
      if (checkins[dates[j]].peso) prev.push(checkins[dates[j]].peso);
    }
    if (recent.length < 2 || prev.length < 2) return null;
    var avgRecent = recent.reduce(function(s,v){return s+v;},0) / recent.length;
    var avgPrev = prev.reduce(function(s,v){return s+v;},0) / prev.length;
    var diff = Math.round((avgRecent - avgPrev) * 10) / 10;
    return {
      id: 'weight_trend', found: true,
      positive: diff <= 0, emoji: '⚖️', title: 'Tu Peso',
      diff: diff, avgRecent: Math.round(avgRecent * 10) / 10
    };
  }

  function calcWaterEnergy() {
    var water = getStore('mc_water');
    var checkins = getCheckins();
    var dates = Object.keys(checkins);
    var highE = [], lowE = [];
    dates.forEach(function(d) {
      var w = water[d] || 0;
      var e = checkins[d].energia;
      if (typeof e !== 'number') return;
      if (w >= 8) highE.push(e);
      else if (w <= 5) lowE.push(e);
    });
    if (highE.length < 3 || lowE.length < 3) return null;
    var avgHigh = Math.round(highE.reduce(function(s,v){return s+v;},0) / highE.length * 10) / 10;
    var avgLow = Math.round(lowE.reduce(function(s,v){return s+v;},0) / lowE.length * 10) / 10;
    var pct = avgLow > 0 ? Math.round((avgHigh - avgLow) / avgLow * 100) : 0;
    if (Math.abs(pct) < 20) return null;
    return {
      id: 'water_energy', found: true,
      positive: pct > 0, emoji: '💧', title: 'Agua y Energia',
      avgHigh: avgHigh, avgLow: avgLow, pct: Math.abs(pct)
    };
  }

  function calcExerciseMood() {
    var exercise = getStore('mc_exercise');
    var checkins = getCheckins();
    var dates = Object.keys(checkins);
    var withEx = 0, withExGood = 0, noEx = 0, noExGood = 0;
    dates.forEach(function(d) {
      var mood = checkins[d].humor;
      if (!mood) return;
      var good = (mood === 'Genial' || mood === 'Bien') ? 1 : 0;
      if (exercise[d]) { withEx++; withExGood += good; }
      else { noEx++; noExGood += good; }
    });
    if (withEx < 3 || noEx < 3) return null;
    var pctWith = Math.round(withExGood / withEx * 100);
    var pctNo = Math.round(noExGood / noEx * 100);
    var diff = pctWith - pctNo;
    if (Math.abs(diff) < 20) return null;
    return {
      id: 'exercise_mood', found: true,
      positive: diff > 0, emoji: '🏃‍♀️', title: 'Ejercicio y Humor',
      pctWith: pctWith, pctNo: pctNo, diff: Math.abs(diff)
    };
  }

  function calcMealsEnergy() {
    var meals = getStore('mc_meals');
    var checkins = getCheckins();
    var dates = Object.keys(checkins);
    var fullE = [], partE = [];
    dates.forEach(function(d) {
      var e = checkins[d].energia;
      if (typeof e !== 'number') return;
      var m = meals[d] || {};
      var count = (m.desayuno?1:0) + (m.almuerzo?1:0) + (m.cena?1:0) + (m.snack?1:0);
      if (count >= 4) fullE.push(e);
      else if (count <= 2) partE.push(e);
    });
    if (fullE.length < 3 || partE.length < 3) return null;
    var avgFull = Math.round(fullE.reduce(function(s,v){return s+v;},0) / fullE.length * 10) / 10;
    var avgPart = Math.round(partE.reduce(function(s,v){return s+v;},0) / partE.length * 10) / 10;
    var pct = avgPart > 0 ? Math.round((avgFull - avgPart) / avgPart * 100) : 0;
    if (Math.abs(pct) < 20) return null;
    return {
      id: 'meals_energy', found: true,
      positive: pct > 0, emoji: '🍽️', title: 'Comidas y Energia',
      avgFull: avgFull, avgPart: avgPart, pct: Math.abs(pct)
    };
  }

  function calcSleepMood() {
    var sleep = getStore('mc_sleep');
    var checkins = getCheckins();
    var dates = Object.keys(checkins);
    var goodSleep = 0, goodSleepGood = 0, badSleep = 0, badSleepGood = 0;
    dates.forEach(function(d) {
      var mood = checkins[d].humor;
      var h = sleep[d] && sleep[d].hours;
      if (!mood || !h) return;
      var good = (mood === 'Genial' || mood === 'Bien') ? 1 : 0;
      if (h >= 7) { goodSleep++; goodSleepGood += good; }
      else if (h < 6) { badSleep++; badSleepGood += good; }
    });
    if (goodSleep < 3 || badSleep < 3) return null;
    var pctGood = Math.round(goodSleepGood / goodSleep * 100);
    var pctBad = Math.round(badSleepGood / badSleep * 100);
    var diff = pctGood - pctBad;
    if (Math.abs(diff) < 20) return null;
    return {
      id: 'sleep_mood', found: true,
      positive: diff > 0, emoji: '🌙', title: 'Sueno y Humor',
      pctGood: pctGood, pctBad: pctBad, diff: Math.abs(diff)
    };
  }

  function calcSleepSymptoms() {
    var sleep = getStore('mc_sleep');
    var cycle = getCycleAll();
    var dates = Object.keys(cycle);
    var badNights = {}, goodNights = {};
    dates.forEach(function(d) {
      var h = sleep[d] && sleep[d].hours;
      var syms = cycle[d] && cycle[d].symptoms;
      if (!h || !syms || !syms.length) return;
      var bucket = h < 6 ? badNights : (h >= 7 ? goodNights : null);
      if (!bucket) return;
      syms.forEach(function(s) { bucket[s] = (bucket[s] || 0) + 1; });
    });
    var badDays = dates.filter(function(d) { return sleep[d] && sleep[d].hours && sleep[d].hours < 6; }).length;
    var goodDays = dates.filter(function(d) { return sleep[d] && sleep[d].hours && sleep[d].hours >= 7; }).length;
    if (badDays < 3 || goodDays < 3) return null;
    var worst = null, worstRatio = 0;
    Object.keys(badNights).forEach(function(s) {
      var rateBad = badNights[s] / badDays;
      var rateGood = (goodNights[s] || 0) / goodDays;
      var ratio = rateGood > 0 ? rateBad / rateGood : (rateBad > 0 ? 3 : 0);
      if (ratio > worstRatio) { worst = s; worstRatio = ratio; }
    });
    if (!worst || worstRatio < 1.5) return null;
    return {
      id: 'sleep_symptoms', found: true,
      positive: false, emoji: '😴', title: 'Sueno y Sintomas',
      symptom: worst, ratio: Math.round(worstRatio * 10) / 10
    };
  }

  function calcSupplementSymptoms() {
    var supps = getStore('mc_supplements');
    var cycle = getCycleAll();
    var dates = Object.keys(cycle);
    var withSupp = {}, noSupp = {}, withDays = 0, noDays = 0;
    dates.forEach(function(d) {
      var syms = cycle[d] && cycle[d].symptoms;
      if (!syms || !syms.length) return;
      var took = supps[d] === true;
      if (took) { withDays++; syms.forEach(function(s) { withSupp[s] = (withSupp[s]||0)+1; }); }
      else { noDays++; syms.forEach(function(s) { noSupp[s] = (noSupp[s]||0)+1; }); }
    });
    if (withDays < 3 || noDays < 3) return null;
    var best = null, bestReduction = 0;
    Object.keys(noSupp).forEach(function(s) {
      var rateNo = noSupp[s] / noDays;
      var rateWith = (withSupp[s] || 0) / withDays;
      var reduction = rateNo > 0 ? Math.round((1 - rateWith / rateNo) * 100) : 0;
      if (reduction > bestReduction) { best = s; bestReduction = reduction; }
    });
    if (!best || bestReduction < 20) return null;
    return {
      id: 'supplement_symptoms', found: true,
      positive: true, emoji: '💊', title: 'Suplemento y Sintomas',
      symptom: best, reduction: bestReduction
    };
  }

  function calcCycleWeight() {
    var cycle = getCycleAll();
    var checkins = getCheckins();
    var phaseWeights = {};
    Object.keys(checkins).forEach(function(d) {
      var p = cycle[d] && cycle[d].phase;
      var w = checkins[d].peso;
      if (!p || !w) return;
      if (!phaseWeights[p]) phaseWeights[p] = [];
      phaseWeights[p].push(w);
    });
    var phases = Object.keys(phaseWeights);
    if (phases.length < 2) return null;
    var totalEntries = 0;
    phases.forEach(function(p) { totalEntries += phaseWeights[p].length; });
    if (totalEntries < 10) return null;
    var avgs = {};
    phases.forEach(function(p) {
      avgs[p] = Math.round(phaseWeights[p].reduce(function(s,v){return s+v;},0) / phaseWeights[p].length * 10) / 10;
    });
    var vals = Object.values(avgs);
    var maxW = Math.max.apply(null, vals);
    var minW = Math.min.apply(null, vals);
    var variation = Math.round((maxW - minW) * 10) / 10;
    if (variation < 0.3) return null;
    var heaviestPhase = '';
    phases.forEach(function(p) { if (avgs[p] === maxW) heaviestPhase = p; });
    return {
      id: 'cycle_weight', found: true,
      positive: true, emoji: '🌸', title: 'Ciclo y Peso',
      variation: variation, heaviestPhase: heaviestPhase, avgs: avgs
    };
  }
```

- [ ] **Step 2: Verify no syntax errors**

Open portal.html in browser, check console for JS errors.

- [ ] **Step 3: Commit**

```bash
git add "Quiz Nutriplan/ebooks/portal.html"
git commit -m "feat(insights): add 8 correlation calculation functions"
```

---

### Task 3: Insights Generator — Text Templates

**Files:**
- Modify: `Quiz Nutriplan/ebooks/portal.html` — insert directly after Task 2 code

- [ ] **Step 1: Add the main generateInsights function**

Insert after `calcCycleWeight`:

```javascript
  function generateInsights() {
    var today = todayKey();
    if (_cachedInsights && _insightsCacheDay === today) return _cachedInsights;

    var level = getInsightsLevel();
    var results = [];

    // Level 1 (day 3+): weight trend
    if (level >= 1) {
      var wt = calcWeightTrend();
      if (wt) {
        var text, bg;
        if (wt.diff < -0.05) {
          text = 'Esta semana: ' + wt.diff + ' kg. Ritmo saludable! La constancia es tu mejor aliada.';
          bg = 'gold';
        } else if (wt.diff > 0.05) {
          text = '+' + wt.diff + ' kg esta semana — puede ser retencion, ciclo o variacion normal. Mira la tendencia, no el dia a dia.';
          bg = 'purple';
        } else {
          text = 'Tu peso se mantuvo estable esta semana. Constancia es progreso.';
          bg = 'gold';
        }
        results.push({id: wt.id, emoji: wt.emoji, title: wt.title, text: text, bg: bg, positive: wt.positive});
      }
    }

    // Level 2 (day 7+): basic correlations
    if (level >= 2) {
      var we = calcWaterEnergy();
      if (we) {
        results.push({
          id: we.id, emoji: we.emoji, title: we.title, bg: we.positive ? 'gold' : 'purple',
          positive: we.positive,
          text: we.positive
            ? 'Buen hallazgo! Los dias con 8+ vasos de agua, tu energia promedio fue ' + we.avgHigh + ' vs ' + we.avgLow + '. Tu cuerpo te lo agradece!'
            : 'Los dias con menos agua, tu energia baja un ' + we.pct + '%. Un vaso mas puede hacer diferencia.'
        });
      }

      var em = calcExerciseMood();
      if (em) {
        results.push({
          id: em.id, emoji: em.emoji, title: em.title, bg: em.positive ? 'gold' : 'purple',
          positive: em.positive,
          text: em.positive
            ? 'Cuando haces ejercicio, tu humor es "Genial" o "Bien" el ' + em.pctWith + '% de las veces. Sigue asi!'
            : 'Los dias sin ejercicio, tu humor tiende a bajar. Hasta 10 minutos de caminata pueden ayudar.'
        });
      }

      var me = calcMealsEnergy();
      if (me) {
        results.push({
          id: me.id, emoji: me.emoji, title: me.title, bg: me.positive ? 'gold' : 'purple',
          positive: me.positive,
          text: me.positive
            ? 'Cuando completas tus 4 comidas, tu energia sube un ' + me.pct + '%. La constancia alimentaria te sienta bien!'
            : 'Saltarte comidas se asocia con ' + me.pct + '% menos energia. Tu cuerpo necesita combustible regular.'
        });
      }

      var sm = calcSleepMood();
      if (sm) {
        results.push({
          id: sm.id, emoji: sm.emoji, title: sm.title, bg: sm.positive ? 'gold' : 'purple',
          positive: sm.positive,
          text: sm.positive
            ? 'Noches de 7h+: ' + sm.pctGood + '% de tus dias con humor positivo. El descanso es tu superpoder.'
            : 'Cuando duermes menos de 6h, tu humor tiende a caer. Priorizar el sueno es autocuidado.'
        });
      }
    }

    // Level 3 (day 14+): cross correlations
    if (level >= 3) {
      var ss = calcSleepSymptoms();
      if (ss) {
        results.push({
          id: ss.id, emoji: ss.emoji, title: ss.title, bg: 'purple', positive: false,
          text: 'Las noches cortas (<6h) se asocian con ' + ss.ratio + 'x mas ' + ss.symptom + '. Hablalo con tu medico si persiste.'
        });
      }

      var su = calcSupplementSymptoms();
      if (su) {
        results.push({
          id: su.id, emoji: su.emoji, title: su.title, bg: 'gold', positive: true,
          text: 'Las semanas que tomaste suplemento, tuviste ' + su.reduction + '% menos ' + su.symptom + '. Vale la pena la constancia!'
        });
      }
    }

    // Level 4 (day 30+): cycle correlations
    if (level >= 4) {
      var cw = calcCycleWeight();
      if (cw) {
        results.push({
          id: cw.id, emoji: cw.emoji, title: cw.title, bg: 'gold', positive: true,
          text: 'Tu peso varia hasta ' + cw.variation + ' kg segun la fase del ciclo. Es completamente normal.'
        });
      }
    }

    // Sort: positive first, then by id for stability
    results.sort(function(a, b) {
      if (a.positive !== b.positive) return a.positive ? -1 : 1;
      return a.id < b.id ? -1 : 1;
    });

    // Max 3
    results = results.slice(0, 3);

    _cachedInsights = results;
    _insightsCacheDay = today;
    return results;
  }

  function getInsightForSection(sectionId) {
    var insights = generateInsights();
    var map = {
      water: 'water_energy',
      exercise: 'exercise_mood',
      sleep: 'sleep_mood',
      supplement: 'supplement_symptoms',
      meals: 'meals_energy'
    };
    var targetId = map[sectionId];
    if (!targetId) return null;
    // Also check sleep_symptoms for sleep section
    for (var i = 0; i < insights.length; i++) {
      if (insights[i].id === targetId) return insights[i];
      if (sectionId === 'sleep' && insights[i].id === 'sleep_symptoms') return insights[i];
    }
    // Search full (uncapped) results
    var all = _cachedInsights ? generateInsights() : [];
    return null;
  }
```

- [ ] **Step 2: Verify no syntax errors**

Open portal.html in browser, check console.

- [ ] **Step 3: Commit**

```bash
git add "Quiz Nutriplan/ebooks/portal.html"
git commit -m "feat(insights): add text generator with empathetic/celebration templates"
```

---

### Task 4: UI — "Tus Descubrimientos" Section in Home

**Files:**
- Modify: `Quiz Nutriplan/ebooks/portal.html` — modify `renderHome` function (line ~2906)

- [ ] **Step 1: Add insights section to renderHome**

Find the line (around 2970):
```javascript
    // Daily menu
    html += renderDailyMenu();
```

Insert BEFORE that line:

```javascript
    // ── Insights: Tus Descubrimientos ──
    html += renderInsightsSection();
```

- [ ] **Step 2: Add the renderInsightsSection function**

Insert after the `renderDailyMenu` function (after its closing `}`):

```javascript
  function renderInsightsSection() {
    var level = getInsightsLevel();
    var days = getCheckinDays();
    var html = '';

    html += '<div style="font-size:11px;font-weight:700;color:#C9922A;text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px">📊 TUS DESCUBRIMIENTOS</div>';

    // Empty state (day 0-2)
    if (level === 0) {
      html += '<div class="mc-card" style="background:rgba(201,146,42,.08);border-color:rgba(201,146,42,.15);text-align:center">' +
        '<div style="font-size:28px;margin-bottom:8px">🔍</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,.7);line-height:1.5">Registra tu Mi Dia durante <strong style="color:#C9922A">3 dias</strong> y empezare a mostrarte patrones sobre tu cuerpo. Cada registro cuenta!</div>' +
        '<div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,.4)">' + days + '/3 dias registrados</div>' +
      '</div>';
      return html;
    }

    // Check for level unlock notification
    var seen = {};
    try { seen = JSON.parse(localStorage.getItem('mc_insights_levels_seen') || '{}'); } catch(e) {}
    if (!seen['level_' + level]) {
      var levelNames = {1: '3', 2: '7', 3: '14', 4: '30'};
      html += '<div class="mc-card" style="background:linear-gradient(135deg,rgba(201,146,42,.12),rgba(201,146,42,.04));border-color:rgba(201,146,42,.2);text-align:center">' +
        '<div style="font-size:20px;margin-bottom:4px">🔓</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,.7)">Nuevo nivel desbloqueado — con <strong style="color:#C9922A">' + levelNames[level] + ' dias</strong> de datos, ahora puedo mostrarte correlaciones mas profundas</div>' +
      '</div>';
      seen['level_' + level] = true;
      localStorage.setItem('mc_insights_levels_seen', JSON.stringify(seen));
    }

    // Render insight cards
    var insights = generateInsights();
    if (insights.length === 0) {
      html += '<div class="mc-card" style="background:rgba(201,146,42,.08);border-color:rgba(201,146,42,.15)">' +
        '<div style="font-size:12px;color:rgba(255,255,255,.5);text-align:center">Sigue registrando — estoy analizando tus datos para encontrar patrones.</div>' +
      '</div>';
      return html;
    }

    insights.forEach(function(ins) {
      var bgColor = ins.bg === 'gold' ? 'rgba(201,146,42,.08)' : 'rgba(99,102,241,.08)';
      var borderColor = ins.bg === 'gold' ? 'rgba(201,146,42,.15)' : 'rgba(99,102,241,.15)';
      var accentColor = ins.bg === 'gold' ? '#C9922A' : '#818cf8';

      html += '<div class="mc-card" style="background:' + bgColor + ';border-color:' + borderColor + '">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
          '<span style="font-size:16px">' + ins.emoji + '</span>' +
          '<span style="font-size:13px;font-weight:700;color:' + accentColor + '">' + ins.title + '</span>' +
        '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.5">' + ins.text + '</div>' +
      '</div>';
    });

    return html;
  }
```

- [ ] **Step 3: Verify visually**

Open Mi Codigo Home. If you have < 3 days of data, you should see the empty state card "Registra tu Mi Dia durante 3 dias...". If you have data, you should see insight cards.

- [ ] **Step 4: Commit**

```bash
git add "Quiz Nutriplan/ebooks/portal.html"
git commit -m "feat(insights): add Tus Descubrimientos section to Home"
```

---

### Task 5: UI — Inline Tooltips in Mi Dia

**Files:**
- Modify: `Quiz Nutriplan/ebooks/portal.html` — modify `renderMiDia` function (line ~3091)

- [ ] **Step 1: Add helper function for inline tooltip HTML**

Insert right before the `renderMiDia` function:

```javascript
  function insightTooltipHtml(sectionId) {
    var level = getInsightsLevel();
    if (level < 2) return '';
    var allInsights = generateInsights();
    var map = {
      water: 'water_energy', exercise: 'exercise_mood',
      sleep: 'sleep_mood', supplement: 'supplement_symptoms', meals: 'meals_energy'
    };
    var targetId = map[sectionId];
    if (!targetId) return '';
    var ins = null;
    for (var i = 0; i < allInsights.length; i++) {
      if (allInsights[i].id === targetId) { ins = allInsights[i]; break; }
      if (sectionId === 'sleep' && allInsights[i].id === 'sleep_symptoms') { ins = allInsights[i]; break; }
    }
    if (!ins) return '';
    var shortText = ins.text;
    if (shortText.length > 100) shortText = shortText.substring(0, 97) + '...';
    return '<div style="background:rgba(201,146,42,.08);border:1px solid rgba(201,146,42,.15);border-radius:8px;padding:8px 12px;font-size:11px;color:rgba(255,255,255,.6);margin-bottom:8px">' +
      '<span style="font-weight:700;color:#C9922A">💡 Dato: </span>' + shortText +
    '</div>';
  }
```

- [ ] **Step 2: Insert tooltip in Agua section**

Find in `renderMiDia` (around line 3144) the line:
```javascript
    // Agua
    html += '<div class="mc-card">' +
```

Change to:
```javascript
    // Agua
    html += insightTooltipHtml('water');
    html += '<div class="mc-card">' +
```

- [ ] **Step 3: Insert tooltip in Comidas section**

Find (around line 3158):
```javascript
    // Comidas
```

Insert after that comment, before the next `html +=`:
```javascript
    html += insightTooltipHtml('meals');
```

- [ ] **Step 4: Insert tooltip in Suplemento/Ejercicio section**

Find (around line 3169):
```javascript
    // Suplemento + Ejercicio toggles
```

Insert after that comment:
```javascript
    html += insightTooltipHtml('exercise');
```

- [ ] **Step 5: Insert tooltip in Sleep section**

Find (around line 3183):
```javascript
    // ── DESCANSO section ──
```

Find the sleep card line below it (around line 3187):
```javascript
    // Sleep hours
```

Insert after that comment:
```javascript
    html += insightTooltipHtml('sleep');
```

- [ ] **Step 6: Verify visually**

Open Mi Dia tab. If you have >= 7 days of data and a correlation was found, you should see a gold-bordered tooltip with "💡 Dato:" prefix above the relevant section.

- [ ] **Step 7: Commit**

```bash
git add "Quiz Nutriplan/ebooks/portal.html"
git commit -m "feat(insights): add inline tooltips to Mi Dia sections"
```

---

### Task 6: Invalidate Cache on Save + Export Public API

**Files:**
- Modify: `Quiz Nutriplan/ebooks/portal.html`

- [ ] **Step 1: Invalidate cache when Mi Dia is saved**

Find the `saveMiDia` function. At its very start (after `function saveMiDia() {`), add:

```javascript
    _cachedInsights = null;
    _insightsCacheDay = '';
```

- [ ] **Step 2: Remove the unused getInsightForSection function**

Delete the `getInsightForSection` function added in Task 3 (it was replaced by `insightTooltipHtml` doing its own lookup in Task 5).

- [ ] **Step 3: Export generateInsights in the return object**

Find the return object (around line 4146):
```javascript
  return {
    render: render, open: open, close: close, navigate: navigate,
```

Add after `showAbout: showAbout` on the last line before the closing `};`:
```javascript
    , generateInsights: generateInsights
```

- [ ] **Step 4: Commit**

```bash
git add "Quiz Nutriplan/ebooks/portal.html"
git commit -m "feat(insights): invalidate cache on save, export API"
```

---

### Task 7: Manual Smoke Test + Deploy

- [ ] **Step 1: Seed test data in browser console**

Open the app in browser. In console, paste this to seed 10 days of fake data:

```javascript
(function(){
  var base = new Date();
  for (var i = 0; i < 10; i++) {
    var d = new Date(base);
    d.setDate(d.getDate() - i);
    var key = d.toISOString().split('T')[0];
    var checkins = JSON.parse(localStorage.getItem('mc_checkins')||'{}');
    checkins[key] = {peso: 78 - i*0.1, humor: i%3===0?'Genial':i%3===1?'Bien':'Regular', energia: 4+i%4};
    localStorage.setItem('mc_checkins', JSON.stringify(checkins));
    var water = JSON.parse(localStorage.getItem('mc_water')||'{}');
    water[key] = i%2===0 ? 9 : 4;
    localStorage.setItem('mc_water', JSON.stringify(water));
    var exercise = JSON.parse(localStorage.getItem('mc_exercise')||'{}');
    exercise[key] = i%2===0;
    localStorage.setItem('mc_exercise', JSON.stringify(exercise));
    var sleep = JSON.parse(localStorage.getItem('mc_sleep')||'{}');
    sleep[key] = {hours: i%3===0 ? 5 : 7.5};
    localStorage.setItem('mc_sleep', JSON.stringify(sleep));
    var meals = JSON.parse(localStorage.getItem('mc_meals')||'{}');
    meals[key] = i%2===0 ? {desayuno:true,almuerzo:true,cena:true,snack:true} : {desayuno:true};
    localStorage.setItem('mc_meals', JSON.stringify(meals));
  }
  location.reload();
})();
```

- [ ] **Step 2: Verify Home shows "Tus Descubrimientos"**

Open Mi Codigo Home. Should see:
- "📊 TUS DESCUBRIMIENTOS" header
- Level unlock card ("🔓 Nuevo nivel desbloqueado — con 7 dias...")
- 2-3 insight cards (water↔energy, exercise↔mood, etc.)

- [ ] **Step 3: Verify Mi Dia shows tooltips**

Navigate to Mi Dia tab. Should see at least 1 tooltip with "💡 Dato:" prefix above Agua or Ejercicio section.

- [ ] **Step 4: Clean test data and commit + push**

Clear test data from console: `['mc_checkins','mc_water','mc_exercise','mc_sleep','mc_meals'].forEach(k=>localStorage.removeItem(k));`

```bash
git push
```

- [ ] **Step 5: Verify on Vercel**

Wait 1-2 min for deploy. Open on mobile. Confirm no JS errors and the insights section renders correctly (empty state if no data, or populated if you have real check-in history).
