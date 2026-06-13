const SETTINGS_THEME_KEY = 'ai-agent-pay-demo.settings.theme';
const VALID_THEMES = ['light', 'dark'];

function isValidTheme(theme) {
  return VALID_THEMES.includes(theme);
}

function getStoredTheme(storage) {
  try {
    const value = storage && typeof storage.getItem === 'function'
      ? storage.getItem(SETTINGS_THEME_KEY)
      : null;
    return isValidTheme(value) ? value : null;
  } catch (_error) {
    return null;
  }
}

function saveTheme(storage, theme) {
  if (!isValidTheme(theme)) {
    throw new Error(`Unsupported theme: ${theme}`);
  }

  try {
    if (storage && typeof storage.setItem === 'function') {
      storage.setItem(SETTINGS_THEME_KEY, theme);
    }
  } catch (_error) {
    // Storage can fail in private browsing; the in-memory state still updates.
  }

  return theme;
}

function applySettingsTheme(root, theme) {
  const normalized = isValidTheme(theme) ? theme : 'light';
  if (root) {
    root.dataset.settingsTheme = normalized;
    root.classList.remove('settings-theme-light', 'settings-theme-dark');
    root.classList.add(`settings-theme-${normalized}`);
  }
  return normalized;
}

function createSettingsThemePreference({ storage, root, defaultTheme = 'light' } = {}) {
  let currentTheme = getStoredTheme(storage) || (isValidTheme(defaultTheme) ? defaultTheme : 'light');

  function setTheme(theme) {
    currentTheme = saveTheme(storage, theme);
    applySettingsTheme(root, currentTheme);
    return getSettingsState();
  }

  function getSettingsState() {
    return {
      field: 'theme',
      value: currentTheme,
      options: VALID_THEMES.map((theme) => ({
        value: theme,
        label: theme === 'dark' ? 'Dark mode' : 'Light mode',
        selected: theme === currentTheme,
      })),
    };
  }

  return {
    initialize() {
      applySettingsTheme(root, currentTheme);
      return getSettingsState();
    },
    getTheme() {
      return currentTheme;
    },
    getSettingsState,
    setTheme,
  };
}

module.exports = {
  SETTINGS_THEME_KEY,
  applySettingsTheme,
  createSettingsThemePreference,
  getStoredTheme,
  saveTheme,
};
