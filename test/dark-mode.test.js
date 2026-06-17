const {
  DARK_MODE_STORAGE_KEY,
  bindDarkModeToggle,
  createDarkModeController,
  readDarkModePreference,
} = require('../src/dark-mode')

let passed = 0
let failed = 0

function assert(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    console.log(`  OK ${name}`)
    passed++
  } else {
    console.log(`  FAIL ${name}`)
    console.log(`     Expected: ${e}`)
    console.log(`     Actual:   ${a}`)
    failed++
  }
}

function createStorage(initial = {}) {
  const values = { ...initial }
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null
    },
    setItem(key, value) {
      values[key] = String(value)
    },
    values,
  }
}

function createRoot() {
  const classes = new Set()
  return {
    attributes: {},
    classList: {
      toggle(name, enabled) {
        if (enabled) {
          classes.add(name)
        } else {
          classes.delete(name)
        }
      },
      contains(name) {
        return classes.has(name)
      },
    },
    setAttribute(name, value) {
      this.attributes[name] = value
    },
  }
}

function createButton() {
  const listeners = {}
  return {
    addEventListener(eventName, handler) {
      listeners[eventName] = handler
    },
    click() {
      listeners.click()
    },
  }
}

console.log('\nDark Mode Settings Tests\n')

assert(
  'reads dark preference from localStorage',
  readDarkModePreference(createStorage({ [DARK_MODE_STORAGE_KEY]: 'dark' })),
  true
)

assert(
  'defaults to light mode without a saved preference',
  readDarkModePreference(createStorage()),
  false
)

const storage = createStorage()
const root = createRoot()
const controller = createDarkModeController({ root, storage })

assert('starts in light mode', controller.isDarkMode, false)
assert('sets light data-theme on init', root.attributes['data-theme'], 'light')

controller.toggleDarkMode()
assert('toggles into dark mode', controller.isDarkMode, true)
assert('persists dark mode to localStorage', storage.values[DARK_MODE_STORAGE_KEY], 'dark')
assert('adds dark class to root', root.classList.contains('dark'), true)
assert('sets dark data-theme', root.attributes['data-theme'], 'dark')

controller.setDarkMode(false)
assert('can return to light mode', controller.isDarkMode, false)
assert('persists light mode to localStorage', storage.values[DARK_MODE_STORAGE_KEY], 'light')
assert('removes dark class from root', root.classList.contains('dark'), false)

const buttonStorage = createStorage()
const buttonRoot = createRoot()
const button = createButton()
bindDarkModeToggle(button, { root: buttonRoot, storage: buttonStorage })
button.click()

assert('bound settings button toggles dark mode', buttonStorage.values[DARK_MODE_STORAGE_KEY], 'dark')
assert('bound settings button updates root theme', buttonRoot.attributes['data-theme'], 'dark')

console.log(`\nDark Mode Results: ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
