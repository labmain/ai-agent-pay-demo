const assert = require("assert");
const {
  STORAGE_KEY,
  applyTheme,
  createThemeToggle,
  getStoredTheme,
  toggleTheme,
} = require("../src/theme-toggle");

function createStorage(initial = {}) {
  const values = { ...initial };
  return {
    getItem: key => (key in values ? values[key] : null),
    setItem: (key, value) => {
      values[key] = value;
    },
  };
}

function createDocument() {
  const classes = new Set();
  return {
    documentElement: {
      dataset: {},
      classList: {
        add: value => classes.add(value),
        remove: (...values) => values.forEach(value => classes.delete(value)),
        contains: value => classes.has(value),
      },
    },
  };
}

function createButton() {
  const listeners = {};
  const attrs = {};
  return {
    dataset: {},
    addEventListener: (name, listener) => {
      listeners[name] = listener;
    },
    click: () => listeners.click(),
    setAttribute: (key, value) => {
      attrs[key] = value;
    },
    getAttribute: key => attrs[key],
  };
}

const storage = createStorage();
const documentRef = createDocument();

assert.strictEqual(applyTheme("dark", { storage, documentRef }), "dark");
assert.strictEqual(storage.getItem(STORAGE_KEY), "dark");
assert.strictEqual(documentRef.documentElement.dataset.theme, "dark");
assert.ok(documentRef.documentElement.classList.contains("theme-dark"));

assert.strictEqual(toggleTheme({ storage, documentRef }), "light");
assert.strictEqual(storage.getItem(STORAGE_KEY), "light");
assert.ok(documentRef.documentElement.classList.contains("theme-light"));

assert.strictEqual(getStoredTheme(createStorage({ [STORAGE_KEY]: "unknown" })), "light");

const button = createButton();
const controller = createThemeToggle({ button, storage, documentRef });
assert.strictEqual(controller.theme, "light");
assert.strictEqual(button.getAttribute("aria-pressed"), "false");
button.click();
assert.strictEqual(storage.getItem(STORAGE_KEY), "dark");
assert.strictEqual(button.getAttribute("aria-pressed"), "true");

console.log("theme-toggle tests passed");
