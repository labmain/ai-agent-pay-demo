const {
  DARK_THEME,
  LIGHT_THEME,
  THEME_STORAGE_KEY,
  THEME_TRANSITION_STYLE_ID,
  applyTheme,
  buildThemeTransitionCss,
  createThemeToggleButton,
  ensureThemeTransitionStyles,
  getInitialTheme,
  installNavbarThemeToggle,
  mountThemeToggle,
  nextTheme,
  readStoredTheme,
  toggleTheme,
} = require("../src/theme-toggle");

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  OK ${name}`);
    passed += 1;
  } else {
    console.log(`  FAIL ${name}`);
    console.log(`     Expected: ${e}`);
    console.log(`     Actual:   ${a}`);
    failed += 1;
  }
}

function createStorage(initial = {}) {
  const values = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
    setItem(key, value) {
      values[key] = String(value);
    },
    values,
  };
}

function createClassList() {
  const values = new Set();
  return {
    contains(value) {
      return values.has(value);
    },
    toggle(value, force) {
      if (force) {
        values.add(value);
      } else {
        values.delete(value);
      }
    },
    values,
  };
}

function createDocument() {
  const documentElement = {
    classList: createClassList(),
    dataset: {},
    style: {},
  };
  const elementsById = {};

  const head = {
    children: [],
    appendChild(child) {
      this.children.push(child);
      if (child.id) {
        elementsById[child.id] = child;
      }
    },
  };

  return {
    documentElement,
    head,
    createElement(tagName) {
      const listeners = {};
      return {
        tagName,
        attributes: {},
        children: [],
        className: "",
        dataset: {},
        id: "",
        textContent: "",
        type: "",
        addEventListener(event, callback) {
          listeners[event] = callback;
        },
        appendChild(child) {
          this.children.push(child);
        },
        click() {
          listeners.click?.();
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
        querySelector(selector) {
          if (selector === "[data-theme-toggle='true']") {
            return this.children.find((child) => child.dataset?.themeToggle === "true") || null;
          }

          return null;
        },
      };
    },
    getElementById(id) {
      return elementsById[id] || null;
    },
    querySelector(selector) {
      if (selector === "nav, [role='navigation'], [data-theme-navbar]") {
        return this.navbar || null;
      }

      return null;
    },
  };
}

console.log("\nTheme Toggle Tests\n");

assert("uses stored theme first", getInitialTheme({
  storage: createStorage({ [THEME_STORAGE_KEY]: DARK_THEME }),
}), DARK_THEME);

assert("falls back to system dark preference", getInitialTheme({
  storage: createStorage(),
  matchMedia: () => ({ matches: true }),
}), DARK_THEME);

assert("defaults to light theme", getInitialTheme({
  storage: createStorage(),
  matchMedia: () => ({ matches: false }),
}), LIGHT_THEME);

assert("ignores invalid stored theme", readStoredTheme(
  createStorage({ [THEME_STORAGE_KEY]: "blue" }),
), null);

assert("next theme alternates from dark to light", nextTheme(DARK_THEME), LIGHT_THEME);
assert("next theme alternates from light to dark", nextTheme(LIGHT_THEME), DARK_THEME);

{
  const documentRef = createDocument();
  applyTheme(DARK_THEME, documentRef);
  assert("sets document data theme", documentRef.documentElement.dataset.theme, DARK_THEME);
  assert("sets color scheme", documentRef.documentElement.style.colorScheme, DARK_THEME);
  assert("adds dark class", documentRef.documentElement.classList.contains(DARK_THEME), true);
  assert("does not keep light class", documentRef.documentElement.classList.contains(LIGHT_THEME), false);
}

{
  const storage = createStorage({ [THEME_STORAGE_KEY]: LIGHT_THEME });
  const documentRef = createDocument();
  const theme = toggleTheme({ document: documentRef, storage });
  assert("toggle returns dark theme", theme, DARK_THEME);
  assert("toggle persists theme", storage.values[THEME_STORAGE_KEY], DARK_THEME);
  assert("toggle applies theme", documentRef.documentElement.dataset.theme, DARK_THEME);
}

{
  const storage = createStorage();
  const documentRef = createDocument();
  const button = createThemeToggleButton({ document: documentRef, storage });
  assert("button is visible text for dark mode", button.textContent, "Dark mode");
  assert("button has accessible label", button.attributes["aria-label"], "Switch to dark mode");
  button.click();
  assert("click changes text to light mode", button.textContent, "Light mode");
  assert("click persists dark mode", storage.values[THEME_STORAGE_KEY], DARK_THEME);
}

{
  const storage = createStorage();
  const documentRef = createDocument();
  const navbar = documentRef.createElement("nav");
  const button = mountThemeToggle(navbar, { document: documentRef, storage });
  assert("mount appends one toggle button", navbar.children.length, 1);
  assert("mounted child is returned button", navbar.children[0] === button, true);
  assert("button is marked as theme toggle", button.dataset.themeToggle, "true");
}

{
  const documentRef = createDocument();
  const css = buildThemeTransitionCss();
  const style = ensureThemeTransitionStyles(documentRef);
  const again = ensureThemeTransitionStyles(documentRef);
  assert("transition css includes easing", css.includes("180ms ease"), true);
  assert("style element is added once", documentRef.head.children.length, 1);
  assert("style element has stable id", style.id, THEME_TRANSITION_STYLE_ID);
  assert("style injection is idempotent", again === style, true);
}

{
  const storage = createStorage();
  const documentRef = createDocument();
  const navbar = documentRef.createElement("nav");
  documentRef.navbar = navbar;
  const button = installNavbarThemeToggle({ document: documentRef, storage });
  const again = installNavbarThemeToggle({ document: documentRef, storage });
  assert("installer mounts button in navbar", navbar.children.length, 1);
  assert("installer returns same existing button", again === button, true);
  assert("installer marks navbar for transitions", navbar.dataset.themeNavbar, "true");
}

console.log(`\nTheme toggle results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
