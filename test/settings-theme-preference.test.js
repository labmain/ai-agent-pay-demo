const {
  SETTINGS_THEME_KEY,
  applySettingsTheme,
  createSettingsThemePreference,
  getStoredTheme,
  saveTheme,
} = require('../src/settings-theme-preference');

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    console.log(`     Expected: ${e}`);
    console.log(`     Actual:   ${a}`);
    failed++;
  }
}

function createStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
    snapshot() {
      return { ...data };
    },
  };
}

function createRoot() {
  const classes = new Set();
  return {
    dataset: {},
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(...names) {
        names.forEach((name) => classes.delete(name));
      },
      snapshot() {
        return Array.from(classes).sort();
      },
    },
  };
}

console.log('\n⚙️ Settings Theme Preference Tests\n');

const storage = createStorage({ [SETTINGS_THEME_KEY]: 'dark' });
assert('reads stored dark theme', getStoredTheme(storage), 'dark');
assert('ignores invalid stored theme', getStoredTheme(createStorage({ [SETTINGS_THEME_KEY]: 'sepia' })), null);

const root = createRoot();
assert('applies settings theme', applySettingsTheme(root, 'dark'), 'dark');
assert('sets data attribute', root.dataset.settingsTheme, 'dark');
assert('sets settings theme class', root.classList.snapshot(), ['settings-theme-dark']);

const preferenceStorage = createStorage();
const preference = createSettingsThemePreference({
  storage: preferenceStorage,
  root: createRoot(),
});

assert('initializes light settings state', preference.initialize(), {
  field: 'theme',
  value: 'light',
  options: [
    { value: 'light', label: 'Light mode', selected: true },
    { value: 'dark', label: 'Dark mode', selected: false },
  ],
});

assert('sets dark settings state', preference.setTheme('dark'), {
  field: 'theme',
  value: 'dark',
  options: [
    { value: 'light', label: 'Light mode', selected: false },
    { value: 'dark', label: 'Dark mode', selected: true },
  ],
});

assert('persists settings theme', preferenceStorage.snapshot()[SETTINGS_THEME_KEY], 'dark');

let unsupportedThemeRejected = false;
try {
  saveTheme(createStorage(), 'blue');
} catch (_error) {
  unsupportedThemeRejected = true;
}
assert('rejects unsupported theme values', unsupportedThemeRejected, true);

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
