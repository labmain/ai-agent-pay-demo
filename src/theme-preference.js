const THEME_KEY = 'theme';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

function normalizeTheme(theme) {
  return theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
}

function createThemeToggleController({
  storage,
  applyTheme,
  updateToggle,
  initialTheme,
  storageKey = THEME_KEY,
}) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    throw new TypeError('storage must provide getItem and setItem');
  }
  if (typeof applyTheme !== 'function') {
    throw new TypeError('applyTheme must be a function');
  }
  if (typeof updateToggle !== 'function') {
    throw new TypeError('updateToggle must be a function');
  }

  let currentTheme = normalizeTheme(initialTheme || storage.getItem(storageKey));

  function sync() {
    applyTheme(currentTheme);
    updateToggle({
      theme: currentTheme,
      label: currentTheme === DARK_THEME ? 'Switch to light mode' : 'Switch to dark mode',
      pressed: currentTheme === DARK_THEME,
    });
  }

  function setTheme(theme) {
    currentTheme = normalizeTheme(theme);
    storage.setItem(storageKey, currentTheme);
    sync();
    return currentTheme;
  }

  function toggleTheme() {
    return setTheme(currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME);
  }

  sync();

  return {
    getTheme: () => currentTheme,
    setTheme,
    toggleTheme,
  };
}

module.exports = {
  DARK_THEME,
  LIGHT_THEME,
  THEME_KEY,
  createThemeToggleController,
  normalizeTheme,
};
