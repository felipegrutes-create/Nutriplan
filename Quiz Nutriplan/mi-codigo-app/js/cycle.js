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
    let cutoff = '';
    if (days > 0 && days < 9999) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      cutoff = d.toISOString().split('T')[0];
    }
    const freq = {};
    Object.keys(all).forEach(d => {
      if (cutoff && d < cutoff) return;
      (all[d].symptoms || []).forEach(s => {
        freq[s] = (freq[s] || 0) + 1;
      });
    });
    return freq;
  }

  return { PHASES, SYMPTOMS, getAll, getToday, save, isMenopause, clearMenopause, getSymptomFrequency };
})();
