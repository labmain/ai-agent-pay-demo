'use strict';

/**
 * Tests for src/loading-spinner.js — Issue #18
 * Verifies: show while loading, stop on success, stop on error
 */

const { createSpinner, withSpinner } = require('../src/loading-spinner');

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

async function assertThrows(name, fn) {
  try {
    await fn();
    console.log(`  ❌ ${name} — expected to throw but did not`);
    failed++;
  } catch {
    console.log(`  ✅ ${name}`);
    passed++;
  }
}

console.log('\n⏳ Loading Spinner Tests\n');

// --- createSpinner ---

// Test 1: createSpinner returns a stop function
{
  const spinner = createSpinner('Testing…');
  assert('createSpinner returns object with stop()', typeof spinner.stop, 'function');
  spinner.stop(true); // cleanup
}

// Test 2: stop() can be called multiple times without throwing
{
  const spinner = createSpinner('Multi-stop test');
  spinner.stop(true);
  let threw = false;
  try { spinner.stop(false); } catch { threw = true; }
  assert('stop() is idempotent (no throw on double call)', threw, false);
}

// --- withSpinner ---

// Test 3: returns resolved value on success
async function testSuccess() {
  const result = await withSpinner('Loading bounties…', async () => {
    return [{ id: 1, title: 'Fix CSV parser', reward: 50 }];
  });
  assert('withSpinner resolves to fn() return value', result[0].title, 'Fix CSV parser');
}

// Test 4: re-throws error on failure
async function testError() {
  await assertThrows('withSpinner re-throws fn() errors', async () => {
    await withSpinner('Failing fetch…', async () => {
      throw new Error('Network timeout');
    });
  });
}

// Test 5: handles fast-resolving function (< 1 tick)
async function testFastResolve() {
  const result = await withSpinner('Instant…', async () => 42);
  assert('withSpinner works with immediately-resolving fn', result, 42);
}

// Test 6: handles fn that returns null/undefined
async function testNullResult() {
  const result = await withSpinner('Null result…', async () => null);
  assert('withSpinner works when fn resolves to null', result, null);
}

// Test 7: spinner does not swallow the original error message
async function testErrorMessage() {
  let caught = null;
  try {
    await withSpinner('Err msg test', async () => {
      throw new Error('API returned 503');
    });
  } catch (e) {
    caught = e.message;
  }
  assert('withSpinner preserves original error message', caught, 'API returned 503');
}

// Run all async tests
(async () => {
  await testSuccess();
  await testError();
  await testFastResolve();
  await testNullResult();
  await testErrorMessage();

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
