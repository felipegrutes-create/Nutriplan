const Auth = (() => {
  // UPDATE THIS MONTHLY + update Hotmart thank-you URL ?k= parameter
  const CHAVE_VALIDA = 'codigo-marco-2026';
  const LS_KEY = 'mc_auth';

  function isAuthenticated() {
    try {
      const data = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      return data !== null && data.autenticado === true;
    } catch {
      return false;
    }
  }

  function getUserData() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || {};
    } catch {
      return {};
    }
  }

  function saveUserData(obj) {
    const current = getUserData();
    localStorage.setItem(LS_KEY, JSON.stringify({ ...current, ...obj }));
  }

  function validateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const k = params.get('k');
    if (k && k === CHAVE_VALIDA) {
      saveUserData({ autenticado: true, activatedAt: Date.now() });
      // Clean URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('k');
      window.history.replaceState({}, '', url.toString());
      return true;
    }
    return false;
  }

  function init() {
    // Try URL key validation first (handles fresh Hotmart redirect)
    validateFromURL();

    const authed = isAuthenticated();
    const authGate = document.getElementById('authGate');
    const appEl = document.getElementById('app');

    if (authed) {
      if (authGate) authGate.style.display = 'none';
      if (appEl) appEl.style.display = 'block';
    } else {
      if (authGate) authGate.style.display = 'block';
      if (appEl) appEl.style.display = 'none';
    }

    return authed;
  }

  return { init, isAuthenticated, getUserData, saveUserData };
})();
