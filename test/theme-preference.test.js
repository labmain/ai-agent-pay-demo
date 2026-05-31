const {
  DARK_THEME,
  LIGHT_THEME,
  createThemeToggleController,
  normalizeTheme,
} = require('../src/theme-preference');

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  OK ${name}`);
    passed++;
  } else {
    console.log(`  FAIL ${name}`);
    failed++;
  }
}

function createStorage(initial = {}) {
  const values = { ...initial };
  return {
    getItem: (key) => values[key] || null,
    setItem: (key, value) => {
      values[key] = value;
    },
    values,
  };
}

function testNormalizesUnknownThemes() {
  assert('dark is preserved', normalizeTheme('dark') === DARK_THEME);
  assert('unknown theme falls back to light', normalizeTheme('sepia') === LIGHT_THEME);
}

function testRestoresStoredPreference() {
  const storage = createStorage({ theme: 'dark' });
  const applied = [];
  const toggleStates = [];

  const controller = createThemeToggleController({
    storage,
    applyTheme: (theme) => applied.push(theme),
    updateToggle: (state) => toggleStates.push(state),
  });

  assert('restores stored dark theme', controller.getTheme() === DARK_THEME);
  assert('applies restored theme on start', applied[0] === DARK_THEME);
  assert('marks toggle pressed in dark mode', toggleStates[0].pressed === true);
}

function testTogglesAndPersistsTheme() {
  const storage = createStorage();
  const applied = [];

  const controller = createThemeToggleController({
    storage,
    applyTheme: (theme) => applied.push(theme),
    updateToggle: () => {},
  });

  const nextTheme = controller.toggleTheme();

  assert('toggles light to dark', nextTheme === DARK_THEME);
  assert('persists dark preference', storage.values.theme === DARK_THEME);
  assert('applies toggled theme', applied[applied.length - 1] === DARK_THEME);
}

function testCanSetThemeDirectly() {
  const storage = createStorage();
  const toggleStates = [];

  const controller = createThemeToggleController({
    storage,
    applyTheme: () => {},
    updateToggle: (state) => toggleStates.push(state),
  });

  controller.setTheme('dark');
  controller.setTheme('light');

  assert('sets light theme directly', controller.getTheme() === LIGHT_THEME);
  assert('updates toggle label for light mode', toggleStates[toggleStates.length - 1].label === 'Switch to dark mode');
  assert('marks toggle unpressed in light mode', toggleStates[toggleStates.length - 1].pressed === false);
}

console.log('\nTheme preference tests\n');

testNormalizesUnknownThemes();
testRestoresStoredPreference();
testTogglesAndPersistsTheme();
testCanSetThemeDirectly();

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
