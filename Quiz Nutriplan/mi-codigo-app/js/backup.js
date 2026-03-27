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
