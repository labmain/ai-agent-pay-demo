const { ApiResponseError, normalizeApiResponse } = require('../src/api-response');

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  OK ${name}`);
    passed++;
  } else {
    console.log(`  FAIL ${name}`);
    console.log(`     Expected: ${e}`);
    console.log(`     Actual:   ${a}`);
    failed++;
  }
}

async function assertRejectsWithToast(name, promise, expectedMessage) {
  try {
    await promise;
    console.log(`  FAIL ${name}`);
    console.log('     Expected rejection');
    failed++;
  } catch (error) {
    assert(name, {
      isApiResponseError: error instanceof ApiResponseError,
      message: error.message,
      toast: error.toast,
    }, {
      isApiResponseError: true,
      message: expectedMessage,
      toast: { type: 'error', message: expectedMessage },
    });
  }
}

(async () => {
  console.log('\nAPI Response Tests\n');

  await assertRejectsWithToast(
    'rejects null responses with toast payload',
    normalizeApiResponse(null),
    'The server returned an empty response. Please try again.'
  );

  await assertRejectsWithToast(
    'rejects empty text bodies with toast payload',
    normalizeApiResponse({ ok: true, text: async () => '   ' }),
    'The server returned an empty response. Please try again.'
  );

  assert(
    'returns JSON response bodies',
    await normalizeApiResponse({ ok: true, json: async () => ({ id: 1 }) }),
    { id: 1 }
  );

  assert(
    'preserves valid falsy JSON values',
    await normalizeApiResponse({ ok: true, json: async () => false }),
    false
  );

  await assertRejectsWithToast(
    'rejects failed responses with toast payload',
    normalizeApiResponse({ ok: false, status: 500, json: async () => ({ error: 'boom' }) }),
    'The request failed. Please try again.'
  );

  console.log(`\nAPI Response Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
