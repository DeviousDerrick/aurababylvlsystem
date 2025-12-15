// save.js — client-only save/load logic for Aurababy Level System (for save.html)
// Replace getPlayerState() and setPlayerState(state) with your app's real getters/setters.

(function () {
  // ----- Replace these with your real app state accessors -----
  // Expected shape example:
  // { username: "bob", exp: 1234, level: 5, achievements: ["first","100xp"] }
  function getPlayerState() {
    // Default fallback if you haven't wired it up yet:
    return window.__aurababy_state || {
      username: document.getElementById('save-username').value || 'Guest',
      exp: window.__exp || 0,
      level: window.__level || 1,
      achievements: window.__achievements || []
    };
  }

  function setPlayerState(state) {
    // Apply loaded state to your game — replace these with your actual logic
    window.__aurababy_state = state;
    document.getElementById('save-username').value = state.username || '';
    window.__exp = state.exp;
    window.__level = state.level;
    window.__achievements = state.achievements || [];
    // If your app has an updater function, call it:
    if (typeof window.applyAurababyState === 'function') {
      window.applyAurababyState(state);
    } else {
      console.log('Loaded state (apply to your game):', state);
    }
  }
  // -----------------------------------------------------------

  // URL-safe base64 encode/decode helpers
  function encodeSave(obj) {
    const json = JSON.stringify(obj);
    const utf8 = encodeURIComponent(json);
    const b = btoa(utf8);
    return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeSave(code) {
    try {
      if (!code) return null;
      let s = code.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      const utf8 = atob(s);
      const json = decodeURIComponent(utf8);
      return JSON.parse(json);
    } catch (e) {
      console.error('decodeSave error', e);
      return null;
    }
  }

  // UI wiring
  document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-save');
    const importBtn = document.getElementById('import-save');
    const copyBtn = document.getElementById('copy-save');
    const saveCodeEl = document.getElementById('save-code');
    const loadInput = document.getElementById('load-code');
    const loadBtn = document.getElementById('load-from-input');
    const clearLocalBtn = document.getElementById('clear-local');
    const usernameEl = document.getElementById('save-username');
    const msgEl = document.getElementById('save-msg');

    function showMsg(m, color='green') {
      msgEl.style.color = color;
      msgEl.textContent = m;
      clearTimeout(showMsg._t);
      showMsg._t = setTimeout(() => { msgEl.textContent = ''; }, 5000);
    }

    exportBtn.addEventListener('click', () => {
      const state = getPlayerState();
      if (usernameEl.value) state.username = usernameEl.value;
      const code = encodeSave(state);
      saveCodeEl.value = code;
      localStorage.setItem('aurababy_last_save', code);
      showMsg('Exported save code');
    });

    copyBtn.addEventListener('click', async () => {
      const text = saveCodeEl.value.trim();
      if (!text) return showMsg('No save code to copy', 'red');
      try {
        await navigator.clipboard.writeText(text);
        showMsg('Copied to clipboard');
      } catch (e) {
        saveCodeEl.select();
        showMsg('Clipboard failed — selected for manual copy', 'orange');
      }
    });

    importBtn.addEventListener('click', () => {
      const code = saveCodeEl.value.trim();
      if (!code) return showMsg('No code to import', 'red');
      const obj = decodeSave(code);
      if (!obj) return showMsg('Invalid save code', 'red');
      setPlayerState(obj);
      showMsg('Save imported and applied');
    });

    loadBtn.addEventListener('click', () => {
      const raw = loadInput.value.trim();
      if (!raw) return showMsg('Paste a code or ?save=...', 'red');
      const maybeParam = raw.includes('save=') ? raw.split('save=')[1].split('&')[0] : raw;
      const obj = decodeSave(maybeParam);
      if (!obj) return showMsg('Invalid save code', 'red');
      setPlayerState(obj);
      showMsg('Loaded save');
    });

    clearLocalBtn.addEventListener('click', () => {
      localStorage.removeItem('aurababy_last_save');
      saveCodeEl.value = '';
      showMsg('Local saved code cleared', 'green');
    });

    // Auto-load from URL ?save=...
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('save')) {
      const code = urlParams.get('save');
      const obj = decodeSave(code);
      if (obj) {
        setPlayerState(obj);
        showMsg('Loaded save from URL');
      } else {
        showMsg('Invalid save code in URL', 'red');
      }
    } else {
      const last = localStorage.getItem('aurababy_last_save');
      if (last) saveCodeEl.value = last;
    }
  });
})();
