const {
  STORAGE_KEY,
  resolveInitialTheme,
  persistTheme,
  applyTheme,
  toggleTheme,
  createThemeToggleButton,
  createThemeTransitionCSS,
} = require('../src/theme-toggle');

let passed = 0;
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    if (detail) console.log(`     ${detail}`);
    failed++;
  }
}

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null,
    setItem: (key, value) => { data[key] = value; },
    data,
  };
}

function fakeDocument() {
  const classes = new Set();
  return {
    documentElement: {
      dataset: {},
      style: {},
      classList: {
        add: (...names) => names.forEach((name) => classes.add(name)),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        contains: (name) => classes.has(name),
      },
      classes,
    },
  };
}

console.log('\n📋 Theme Toggle Tests\n');

const stored = memoryStorage({ [STORAGE_KEY]: 'dark' });
assert('stored theme wins over system preference', resolveInitialTheme({
  storage: stored,
  window: { matchMedia: () => ({ matches: false }) },
}) === 'dark');

assert('system dark preference is used without stored preference', resolveInitialTheme({
  storage: memoryStorage(),
  window: { matchMedia: () => ({ matches: true }) },
}) === 'dark');

const persisted = memoryStorage();
persistTheme('dark', persisted);
assert('theme preference persists to localStorage', persisted.data[STORAGE_KEY] === 'dark');

const doc = fakeDocument();
applyTheme('dark', doc);
assert('dark theme data attribute is applied', doc.documentElement.dataset.theme === 'dark');
assert('dark theme class is applied', doc.documentElement.classList.contains('theme-dark'));
assert('color-scheme is updated', doc.documentElement.style.colorScheme === 'dark');

const toggledStorage = memoryStorage({ [STORAGE_KEY]: 'dark' });
const toggledDoc = fakeDocument();
const next = toggleTheme('dark', { storage: toggledStorage, document: toggledDoc });
assert('toggle switches dark to light', next === 'light');
assert('toggle persists new theme', toggledStorage.data[STORAGE_KEY] === 'light');
assert('toggle applies new class', toggledDoc.documentElement.classList.contains('theme-light'));

const button = createThemeToggleButton({ theme: 'dark' });
assert('toggle button is a real button', button.includes('<button'));
assert('toggle button is navbar-ready via data-action', button.includes('data-action="toggle-theme"'));
assert('toggle button exposes pressed state', button.includes('aria-pressed="true"'));
assert('toggle button describes next mode', button.includes('Switch to light mode'));

const css = createThemeTransitionCSS();
assert('transition CSS supports smooth theme changes', css.includes('transition: background-color 180ms ease'));
assert('transition CSS defines dark colors', css.includes('html.theme-dark'));
assert('transition CSS defines light colors', css.includes('html.theme-light'));

let unsupportedFailed = false;
try { persistTheme('sepia', memoryStorage()); } catch (_) { unsupportedFailed = true; }
assert('unsupported themes are rejected', unsupportedFailed);

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
