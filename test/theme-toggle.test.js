const {
  THEME_STORAGE_KEY,
  applyTheme,
  createThemeToggle,
  resolveInitialTheme,
} = require('../src/theme-toggle');

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
      add(...names) {
        names.forEach((name) => classes.add(name));
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

console.log('\n🎨 Theme Toggle Tests\n');

assert(
  'uses stored theme before system preference',
  resolveInitialTheme({
    storage: createStorage({ [THEME_STORAGE_KEY]: 'light' }),
    prefersDark: true,
  }),
  'light'
);

assert(
  'falls back to system dark preference',
  resolveInitialTheme({ storage: createStorage(), prefersDark: true }),
  'dark'
);

const root = createRoot();
assert('applies theme class', applyTheme(root, 'dark'), 'dark');
assert('sets data-theme', root.dataset.theme, 'dark');
assert('sets transition class', root.classList.snapshot(), ['theme-dark', 'theme-transition']);

const storage = createStorage();
const toggle = createThemeToggle({ storage, root: createRoot() });
assert('initializes light button state', toggle.initialize(), {
  type: 'button',
  ariaLabel: 'Switch to dark mode',
  text: 'Dark mode',
  pressed: false,
  theme: 'light',
});
assert('toggles to dark', toggle.toggleTheme(), {
  type: 'button',
  ariaLabel: 'Switch to light mode',
  text: 'Light mode',
  pressed: true,
  theme: 'dark',
});
assert('persists dark theme', storage.snapshot()[THEME_STORAGE_KEY], 'dark');

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
