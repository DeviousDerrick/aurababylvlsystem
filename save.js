// Simple client-side save system
// Usage: integrate getPlayerState() and setPlayerState(state) with your game state

// Replace these with your app's getter/setter
function getPlayerState() {
  // Example shape: { username, exp, level, achievements: [...] }
  // Replace with real game data retrieval
  return window.__aurababy_state || {
    username: document.getElementById('save-username').value || 'Guest',
    exp: window.__exp || 0,
    level: window.__level || 1,
    achievements: window.__achievements || []
  };
}
function setPlayerState(state) {
  // Replace with real game state application logic
  window.__aurababy_state = state;
  document.getElementById('save-username').value = state.username || '';
  // TODO: apply exp/level/achievements to your UI/game
  console.log('Loaded state', state);
}

// Encoding/decoding that handles UTF-8 safely
function encodeSave(obj) {
  const json = JSON.stringify(obj);
  // simple compression idea: use encodeURIComponent + base64 to keep it URL-safe
  const utf8 = encodeURIComponent(json);
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodeSave(code) {
  try {
    // restore padding
    let padded = code.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) padded += '=';
    const utf8 = atob(padded);
    const json = decodeURIComponent(utf8);
    return JSON.parse(json);
  } catch (e) {
    console.error('Invalid save code', e);
    return null;
  }
}

// UI wiring
document.addEventListener('DOMContentLoaded', () => {
  const exportBtn = document.getElementById('export-save');
  const importBtn = document.getElementById('import-save');
  const copyBtn   = document.getElementById('copy-save');
  const saveCodeEl = document.getElementById('save-code');
  const loadInput = document.getElementById('load-code');
  const loadBtn = document.getElementById('load-from-input');
  const usernameEl = document.getElementById('save-username');
  const msgEl = document.getElementById('save-msg');

  function showMsg(m, color='green') { msgEl.style.color = color; msgEl.textContent = m; setTimeout(()=>{ msgEl.textContent=''; }, 4000); }

  exportBtn.addEventListener('click', () => {
    const state = getPlayerState();
    if (usernameEl.value) state.username = usernameEl.value;
    const code = encodeSave(state);
    saveCodeEl.value = code;
    // save locally too
    localStorage.setItem('aurababy_last_save', code);
    showMsg('Exported save code');
  });

  copyBtn.addEventListener('click', async () => {
    const text = saveCodeEl.value;
    if (!text) return showMsg('No save code to copy', 'red');
    try { await navigator.clipboard.writeText(text); showMsg('Copied to clipboard'); }
    catch (e) { showMsg('Copy failed — select and copy manually', 'red'); }
  });

  importBtn.addEventListener('click', () => {
    const code = saveCodeEl.value.trim();
    if (!code) return showMsg('No code to import', 'red');
    const obj = decodeSave(code);
    if (!obj) return showMsg('Invalid code', 'red');
    setPlayerState(obj);
    showMsg('Save imported');
  });

  loadBtn.addEventListener('click', () => {
    const raw = loadInput.value.trim();
    if (!raw) return showMsg('Paste a code or ?save=...', 'red');
    // if URL param style ?save=..., extract after '='
    const maybeParam = raw.includes('save=') ? raw.split('save=')[1].split('&')[0] : raw;
    const obj = decodeSave(maybeParam);
    if (!obj) return showMsg('Invalid code', 'red');
    setPlayerState(obj);
    showMsg('Loaded save');
  });

  // Auto-load from URL ?save=...
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('save')) {
    const code = urlParams.get('save');
    const obj = decodeSave(code);
    if (obj) { setPlayerState(obj); showMsg('Loaded save from URL'); }
  } else if (urlParams.has('id')) {
    // if using server-backed approach, client will call server API (see server-backed example)
    // we don't handle id here for the client-only variant.
  } else {
    // if localStorage fallback exists, prefill
    const last = localStorage.getItem('aurababy_last_save');
    if (last) saveCodeEl.value = last;
  }
});
