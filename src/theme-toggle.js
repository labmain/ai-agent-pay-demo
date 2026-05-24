const STORAGE_KEY = 'preferred-theme';
const THEMES = new Set(['light', 'dark']);

function normalizeTheme(theme) {
  return THEMES.has(theme) ? theme : 'light';
}

function getStoredTheme(storage) {
  if (!storage || typeof storage.getItem !== 'function') {
    return null;
  }
  return THEMES.has(storage.getItem(STORAGE_KEY)) ? storage.getItem(STORAGE_KEY) : null;
}

function applyTheme(root, storage, theme, options = {}) {
  const nextTheme = normalizeTheme(theme);

  if (root) {
    root.dataset = root.dataset || {};
    root.dataset.theme = nextTheme;
    root.classList?.toggle?.('theme-transition', options.animate !== false);
  }

  if (storage && typeof storage.setItem === 'function') {
    storage.setItem(STORAGE_KEY, nextTheme);
  }

  return nextTheme;
}

function toggleTheme(root, storage, currentTheme, options) {
  const nextTheme = normalizeTheme(currentTheme) === 'dark' ? 'light' : 'dark';
  return applyTheme(root, storage, nextTheme, options);
}

function createThemeToggleButton(documentRef, root, storage, options = {}) {
  if (!documentRef || typeof documentRef.createElement !== 'function') {
    throw new Error('documentRef must provide createElement');
  }

  let currentTheme = getStoredTheme(storage) || normalizeTheme(options.initialTheme);
  applyTheme(root, storage, currentTheme, { animate: false });

  const button = documentRef.createElement('button');
  button.type = 'button';
  button.className = options.className || 'theme-toggle';
  button.textContent = options.label || 'Toggle theme';
  button.setAttribute('aria-label', options.ariaLabel || 'Toggle light and dark theme');
  button.setAttribute('aria-pressed', String(currentTheme === 'dark'));

  button.addEventListener('click', () => {
    currentTheme = toggleTheme(root, storage, currentTheme, { animate: true });
    button.setAttribute('aria-pressed', String(currentTheme === 'dark'));
    options.onChange?.(currentTheme);
  });

  return button;
}

module.exports = {
  STORAGE_KEY,
  applyTheme,
  createThemeToggleButton,
  getStoredTheme,
  normalizeTheme,
  toggleTheme,
};
