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
