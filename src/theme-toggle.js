"use strict";

const STORAGE_KEY = "theme";
const THEMES = new Set(["light", "dark"]);

function normalizeTheme(theme) {
  return THEMES.has(theme) ? theme : "light";
}

function applyTheme(theme, options = {}) {
  const { documentRef = globalThis.document, storage = globalThis.localStorage } = options;
  const normalizedTheme = normalizeTheme(theme);

  if (documentRef && documentRef.documentElement) {
    const root = documentRef.documentElement;
    root.dataset.theme = normalizedTheme;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(`theme-${normalizedTheme}`);
  }

  if (storage && typeof storage.setItem === "function") {
    storage.setItem(STORAGE_KEY, normalizedTheme);
  }

  return normalizedTheme;
}

function getStoredTheme(storage = globalThis.localStorage) {
  if (!storage || typeof storage.getItem !== "function") {
    return "light";
  }
  return normalizeTheme(storage.getItem(STORAGE_KEY));
}

function toggleTheme(options = {}) {
  const { storage = globalThis.localStorage } = options;
  const currentTheme = getStoredTheme(storage);
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  return applyTheme(nextTheme, options);
}

function createThemeToggle(options = {}) {
  const { button, documentRef = globalThis.document, storage = globalThis.localStorage } = options;
  const initialTheme = applyTheme(getStoredTheme(storage), { documentRef, storage });

  if (button && typeof button.addEventListener === "function") {
    button.setAttribute("aria-label", "Toggle color theme");
    button.setAttribute("type", "button");
    button.dataset.themeToggle = "true";
    button.addEventListener("click", () => {
      const theme = toggleTheme({ documentRef, storage });
      button.setAttribute("aria-pressed", String(theme === "dark"));
    });
    button.setAttribute("aria-pressed", String(initialTheme === "dark"));
  }

  return {
    get theme() {
      return getStoredTheme(storage);
    },
    toggle: () => toggleTheme({ documentRef, storage }),
    apply: theme => applyTheme(theme, { documentRef, storage }),
  };
}

module.exports = {
  STORAGE_KEY,
  applyTheme,
  createThemeToggle,
  getStoredTheme,
  toggleTheme,
};
