const THEME_STORAGE_KEY = "theme-preference";
const THEME_TRANSITION_STYLE_ID = "theme-toggle-transition-styles";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";
const VALID_THEMES = new Set([LIGHT_THEME, DARK_THEME]);

function normalizeTheme(theme) {
  return VALID_THEMES.has(theme) ? theme : null;
}

function readStoredTheme(storage = globalThis.localStorage) {
  if (!storage || typeof storage.getItem !== "function") {
    return null;
  }

  return normalizeTheme(storage.getItem(THEME_STORAGE_KEY));
}

function writeStoredTheme(theme, storage = globalThis.localStorage) {
  const normalized = normalizeTheme(theme);
  if (!normalized) {
    throw new Error(`Unsupported theme: ${theme}`);
  }

  if (storage && typeof storage.setItem === "function") {
    storage.setItem(THEME_STORAGE_KEY, normalized);
  }

  return normalized;
}

function getInitialTheme({
  storage = globalThis.localStorage,
  matchMedia = globalThis.matchMedia,
} = {}) {
  const stored = readStoredTheme(storage);
  if (stored) {
    return stored;
  }

  if (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-color-scheme: dark)")?.matches
  ) {
    return DARK_THEME;
  }

  return LIGHT_THEME;
}

function applyTheme(theme, documentRef = globalThis.document) {
  const normalized = normalizeTheme(theme);
  if (!normalized) {
    throw new Error(`Unsupported theme: ${theme}`);
  }

  if (documentRef?.documentElement) {
    documentRef.documentElement.dataset.theme = normalized;
    documentRef.documentElement.style.colorScheme = normalized;

    const classList = documentRef.documentElement.classList;
    if (classList) {
      classList.toggle(DARK_THEME, normalized === DARK_THEME);
      classList.toggle(LIGHT_THEME, normalized === LIGHT_THEME);
    }
  }

  return normalized;
}

function buildThemeTransitionCss() {
  return `
:root {
  color-scheme: light;
  background-color: #ffffff;
  color: #111827;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  background-color: #111827;
  color: #f9fafb;
}

:root[data-theme="light"] {
  color-scheme: light;
  background-color: #ffffff;
  color: #111827;
}

body,
.theme-toggle,
[data-theme-navbar] {
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.theme-toggle {
  border: 1px solid currentColor;
  border-radius: 999px;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
}
`.trim();
}

function ensureThemeTransitionStyles(documentRef = globalThis.document) {
  if (!documentRef?.createElement || !documentRef?.head) {
    return null;
  }

  const existing = documentRef.getElementById?.(THEME_TRANSITION_STYLE_ID);
  if (existing) {
    return existing;
  }

  const style = documentRef.createElement("style");
  style.id = THEME_TRANSITION_STYLE_ID;
  style.textContent = buildThemeTransitionCss();
  documentRef.head.appendChild(style);
  return style;
}

function nextTheme(theme) {
  return normalizeTheme(theme) === DARK_THEME ? LIGHT_THEME : DARK_THEME;
}

function setTheme(theme, options = {}) {
  const normalized = writeStoredTheme(theme, options.storage);
  applyTheme(normalized, options.document);
  return normalized;
}

function toggleTheme(options = {}) {
  const current =
    normalizeTheme(options.currentTheme) ??
    readStoredTheme(options.storage) ??
    options.document?.documentElement?.dataset?.theme ??
    getInitialTheme(options);

  return setTheme(nextTheme(current), options);
}

function updateToggleButton(button, theme) {
  const normalized = normalizeTheme(theme) ?? LIGHT_THEME;
  button.textContent = normalized === DARK_THEME ? "Light mode" : "Dark mode";
  button.setAttribute("aria-label", `Switch to ${nextTheme(normalized)} mode`);
  button.setAttribute("aria-pressed", String(normalized === DARK_THEME));
}

function createThemeToggleButton(options = {}) {
  const documentRef = options.document ?? globalThis.document;
  if (!documentRef?.createElement) {
    throw new Error("A DOM document is required to create a theme toggle button");
  }

  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.dataset.themeToggle = "true";

  const initialTheme = setTheme(getInitialTheme(options), options);
  updateToggleButton(button, initialTheme);

  button.addEventListener("click", () => {
    const theme = toggleTheme({
      ...options,
      currentTheme: documentRef.documentElement?.dataset?.theme,
    });
    updateToggleButton(button, theme);
  });

  return button;
}

function mountThemeToggle(navbar, options = {}) {
  if (!navbar || typeof navbar.appendChild !== "function") {
    throw new Error("A navbar element is required to mount the theme toggle");
  }

  ensureThemeTransitionStyles(options.document);
  navbar.dataset.themeNavbar = "true";

  const button = createThemeToggleButton(options);
  navbar.appendChild(button);
  return button;
}

function installNavbarThemeToggle(options = {}) {
  const documentRef = options.document ?? globalThis.document;
  const selector = options.navbarSelector ?? "nav, [role='navigation'], [data-theme-navbar]";
  const navbar = options.navbar ?? documentRef?.querySelector?.(selector);

  if (!navbar) {
    throw new Error("No navbar element found for theme toggle installation");
  }

  const existing = navbar.querySelector?.("[data-theme-toggle='true']");
  if (existing) {
    return existing;
  }

  return mountThemeToggle(navbar, {
    ...options,
    document: documentRef,
  });
}

const themeToggleApi = {
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
  setTheme,
  toggleTheme,
  writeStoredTheme,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = themeToggleApi;
}

if (typeof window !== "undefined") {
  window.ThemeToggle = themeToggleApi;
}
