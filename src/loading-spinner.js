/**
 * Loading Spinner — visual feedback while async operations run
 * Satisfies Issue #18: Add loading spinner to bounty list page
 *
 * Usage:
 *   const { withSpinner } = require('./loading-spinner');
 *   const data = await withSpinner('Fetching bounties…', fetchBounties);
 */

'use strict';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const INTERVAL_MS = 80;

/**
 * Start a spinner on stdout. Returns a stop() function.
 * @param {string} message  Label shown next to the spinner
 * @returns {{ stop: (success: boolean, finalMsg?: string) => void }}
 */
function createSpinner(message) {
  let frame = 0;
  let stopped = false;

  const isTTY = process.stdout.isTTY;

  if (isTTY) {
    process.stdout.write('\x1B[?25l'); // hide cursor
  }

  const timer = setInterval(() => {
    if (stopped) return;
    if (isTTY) {
      process.stdout.write(`\r${FRAMES[frame % FRAMES.length]} ${message}`);
    }
    frame++;
  }, INTERVAL_MS);

  return {
    stop(success = true, finalMsg) {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      if (isTTY) {
        const icon = success ? '✅' : '❌';
        const label = finalMsg || message;
        process.stdout.write(`\r${icon} ${label}\n`);
        process.stdout.write('\x1B[?25h'); // show cursor
      }
    },
  };
}

/**
 * Run an async function with a loading spinner.
 * Spinner stops automatically on success or error.
 *
 * @template T
 * @param {string}              message  Label shown while loading
 * @param {() => Promise<T>}    fn       Async task to run
 * @returns {Promise<T>}                 Resolved value of fn()
 * @throws                               Re-throws any error from fn()
 */
async function withSpinner(message, fn) {
  const spinner = createSpinner(message);
  try {
    const result = await fn();
    spinner.stop(true);
    return result;
  } catch (err) {
    spinner.stop(false, `${message} — ${err.message}`);
    throw err;
  }
}

module.exports = { createSpinner, withSpinner };
