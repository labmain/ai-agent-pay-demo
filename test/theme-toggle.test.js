const assert = require('node:assert/strict');
const {
  STORAGE_KEY,
  applyTheme,
  createThemeToggleButton,
  getStoredTheme,
  normalizeTheme,
  toggleTheme,
} = require('../src/theme-toggle');

function createStorage(initial = {}) {
  const values = { ...initial };
  return {
    getItem: (key) => values[key] ?? null,
    setItem: (key, value) => {
      values[key] = value;
    },
  };
}

function createRoot() {
  const classes = new Set();
  return {
    dataset: {},
    classList: {
      toggle: (name, enabled) => {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
      has: (name) => classes.has(name),
    },
  };
}

function createDocument() {
  return {
    createElement: () => {
      const listeners = {};
      return {
        attributes: {},
        addEventListener: (event, callback) => {
          listeners[event] = callback;
        },
        click: () => listeners.click(),
        setAttribute: function setAttribute(name, value) {
          this.attributes[name] = value;
        },
      };
    },
  };
}

console.log('\nTheme Toggle Tests\n');

assert.equal(normalizeTheme('dark'), 'dark');
assert.equal(normalizeTheme('bad-value'), 'light');
console.log('  OK normalizes unsupported themes');

const storage = createStorage();
const root = createRoot();
assert.equal(applyTheme(root, storage, 'dark'), 'dark');
assert.equal(root.dataset.theme, 'dark');
assert.equal(storage.getItem(STORAGE_KEY), 'dark');
console.log('  OK applies and persists dark theme');

assert.equal(toggleTheme(root, storage, 'dark'), 'light');
assert.equal(root.dataset.theme, 'light');
assert.equal(getStoredTheme(storage), 'light');
console.log('  OK toggles back to light theme');

const buttonRoot = createRoot();
const buttonStorage = createStorage({ [STORAGE_KEY]: 'dark' });
let changedTheme = null;
const button = createThemeToggleButton(createDocument(), buttonRoot, buttonStorage, {
  onChange: (theme) => {
    changedTheme = theme;
  },
});
assert.equal(button.attributes['aria-pressed'], 'true');
button.click();
assert.equal(buttonRoot.dataset.theme, 'light');
assert.equal(buttonStorage.getItem(STORAGE_KEY), 'light');
assert.equal(button.attributes['aria-pressed'], 'false');
assert.equal(changedTheme, 'light');
console.log('  OK creates a persisted accessible toggle button');

console.log('\nTheme Toggle Results: 4 passed, 0 failed\n');
