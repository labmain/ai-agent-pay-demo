const THEME_STORAGE_KEY = 'ai-agent-pay-demo.theme';
const THEMES = new Set(['light', 'dark']);

function safeGet(storage, key) {
  try {
    return storage && typeof storage.getItem === 'function' ? storage.getItem(key) : null;
  } catch (_error) {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    if (storage && typeof storage.setItem === 'function') {
      storage.setItem(key, value);
    }
  } catch (_error) {
    // Ignore storage failures so private browsing modes still allow toggling.
  }
}

function normalizeTheme(theme, fallback = 'light') {
  return THEMES.has(theme) ? theme : fallback;
}

function resolveInitialTheme({ storage, prefersDark = false } = {}) {
  const stored = safeGet(storage, THEME_STORAGE_KEY);
  return normalizeTheme(stored, prefersDark ? 'dark' : 'light');
}

function applyTheme(root, theme) {
  const normalized = normalizeTheme(theme);
  if (!root) {
    return normalized;
  }

  root.dataset.theme = normalized;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(`theme-${normalized}`, 'theme-transition');
  return normalized;
}

function createThemeToggle({ storage, root, prefersDark = false } = {}) {
  let currentTheme = resolveInitialTheme({ storage, prefersDark });

  function setTheme(nextTheme) {
    currentTheme = applyTheme(root, nextTheme);
    safeSet(storage, THEME_STORAGE_KEY, currentTheme);
    return getButtonState();
  }

  function toggleTheme() {
    return setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  function getButtonState() {
    return {
      type: 'button',
      ariaLabel: `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`,
      text: currentTheme === 'dark' ? 'Light mode' : 'Dark mode',
      pressed: currentTheme === 'dark',
      theme: currentTheme,
    };
  }

  return {
    initialize() {
      return setTheme(currentTheme);
    },
    getTheme() {
      return currentTheme;
    },
    getButtonState,
    setTheme,
    toggleTheme,
  };
}

module.exports = {
  THEME_STORAGE_KEY,
  applyTheme,
  createThemeToggle,
  resolveInitialTheme,
};
