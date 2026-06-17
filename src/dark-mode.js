const DARK_MODE_STORAGE_KEY = 'settings.darkMode'

function normalizeStoredPreference(value) {
  return value === 'dark'
}

function persistPreference(storage, isDarkMode) {
  if (!storage || typeof storage.setItem !== 'function') {
    return
  }

  storage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode ? 'dark' : 'light')
}

function applyDarkMode(root, isDarkMode) {
  if (!root) {
    return isDarkMode
  }

  if (root.classList && typeof root.classList.toggle === 'function') {
    root.classList.toggle('dark', isDarkMode)
  }

  if (typeof root.setAttribute === 'function') {
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  } else {
    root.dataset = root.dataset || {}
    root.dataset.theme = isDarkMode ? 'dark' : 'light'
  }

  return isDarkMode
}

function readDarkModePreference(storage) {
  if (!storage || typeof storage.getItem !== 'function') {
    return false
  }

  return normalizeStoredPreference(storage.getItem(DARK_MODE_STORAGE_KEY))
}

function createDarkModeController(options = {}) {
  const root = options.root
  const storage = options.storage
  let isDarkMode = readDarkModePreference(storage)

  applyDarkMode(root, isDarkMode)

  return {
    get isDarkMode() {
      return isDarkMode
    },
    setDarkMode(nextValue) {
      isDarkMode = Boolean(nextValue)
      persistPreference(storage, isDarkMode)
      applyDarkMode(root, isDarkMode)
      return isDarkMode
    },
    toggleDarkMode() {
      return this.setDarkMode(!isDarkMode)
    },
  }
}

function bindDarkModeToggle(button, options = {}) {
  const controller = createDarkModeController(options)

  if (button && typeof button.addEventListener === 'function') {
    button.addEventListener('click', () => {
      controller.toggleDarkMode()
    })
  }

  return controller
}

module.exports = {
  DARK_MODE_STORAGE_KEY,
  applyDarkMode,
  bindDarkModeToggle,
  createDarkModeController,
  readDarkModePreference,
}
