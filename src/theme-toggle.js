const STORAGE_KEY = 'theme-preference';
const THEMES = new Set(['light', 'dark']);

function getStoredTheme(storage = globalThis.localStorage) {
  try {
    const value = storage && storage.getItem ? storage.getItem(STORAGE_KEY) : null;
    return THEMES.has(value) ? value : null;
  } catch (_) {
    return null;
  }
}

function getSystemTheme(win = globalThis.window) {
  try {
    return win && win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (_) {
    return 'light';
  }
}

function resolveInitialTheme({ storage, window } = {}) {
  return getStoredTheme(storage) || getSystemTheme(window);
}

function persistTheme(theme, storage = globalThis.localStorage) {
  if (!THEMES.has(theme)) {
    throw new Error(`Unsupported theme: ${theme}`);
  }
  try {
    if (storage && storage.setItem) storage.setItem(STORAGE_KEY, theme);
  } catch (_) {
    // Ignore storage failures so private browsing modes do not break the UI.
  }
  return theme;
}

function applyTheme(theme, doc = globalThis.document) {
  if (!THEMES.has(theme)) {
    throw new Error(`Unsupported theme: ${theme}`);
  }
  if (!doc || !doc.documentElement) return theme;

  const root = doc.documentElement;
  root.dataset.theme = theme;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(`theme-${theme}`);
  root.style.colorScheme = theme;
  return theme;
}

function toggleTheme(currentTheme, options = {}) {
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  persistTheme(nextTheme, options.storage);
  applyTheme(nextTheme, options.document);
  return nextTheme;
}

function createThemeToggleButton({ theme = 'light', label = 'Toggle theme' } = {}) {
  const next = theme === 'dark' ? 'light' : 'dark';
  return `<button type="button" class="theme-toggle" data-action="toggle-theme" aria-label="${escapeHtml(label)}" aria-pressed="${theme === 'dark'}">
  <span aria-hidden="true">${theme === 'dark' ? '🌙' : '☀️'}</span>
  <span class="theme-toggle__text">Switch to ${next} mode</span>
</button>`;
}

function createThemeTransitionCSS() {
  return `html.theme-light, html.theme-dark {
  transition: background-color 180ms ease, color 180ms ease;
}
html.theme-dark {
  color-scheme: dark;
  background: #0f172a;
  color: #e2e8f0;
}
html.theme-light {
  color-scheme: light;
  background: #ffffff;
  color: #0f172a;
}
.theme-toggle {
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease;
}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  STORAGE_KEY,
  resolveInitialTheme,
  getStoredTheme,
  getSystemTheme,
  persistTheme,
  applyTheme,
  toggleTheme,
  createThemeToggleButton,
  createThemeTransitionCSS,
};
