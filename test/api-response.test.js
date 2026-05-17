const {
  EMPTY_RESPONSE_MESSAGE,
  REQUEST_FAILED_MESSAGE,
  handleApiResponse,
  isEmptyPayload,
} = require('../src/api-response');

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  PASS ${name}`);
    passed++;
  } else {
    console.log(`  FAIL ${name}`);
    console.log(`     Expected: ${e}`);
    console.log(`     Actual:   ${a}`);
    failed++;
  }
}

async function run() {
  console.log('\nAPI Response Tests\n');

  assert('detects null payloads as empty', isEmptyPayload(null), true);
  assert('detects undefined payloads as empty', isEmptyPayload(undefined), true);
  assert('detects blank text payloads as empty', isEmptyPayload('   '), true);
  assert('keeps false as a valid payload', isEmptyPayload(false), false);
  assert('keeps zero as a valid payload', isEmptyPayload(0), false);

  const toastMessages = [];
  const nullResult = await handleApiResponse(null, {
    toast: { error: message => toastMessages.push(message) },
  });

  assert('null API response returns a friendly failure', nullResult, {
    ok: false,
    data: null,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert('null API response shows an error toast', toastMessages, [
    EMPTY_RESPONSE_MESSAGE,
  ]);

  const emptyJsonResult = await handleApiResponse({
    ok: true,
    json: async () => {
      throw new SyntaxError('Unexpected end of JSON input');
    },
  });

  assert('empty JSON body returns a friendly failure', emptyJsonResult, {
    ok: false,
    data: null,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const httpFailureToast = [];
  const httpFailureResult = await handleApiResponse({
    ok: false,
    status: 500,
    json: async () => ({ message: 'internal error' }),
  }, {
    onError: message => httpFailureToast.push(message),
  });

  assert('HTTP failures return a friendly failure', httpFailureResult, {
    ok: false,
    data: null,
    error: REQUEST_FAILED_MESSAGE,
  });
  assert('HTTP failures show an error toast', httpFailureToast, [
    REQUEST_FAILED_MESSAGE,
  ]);

  const validJsonResult = await handleApiResponse({
    ok: true,
    json: async () => ({ items: [1, 2, 3] }),
  });

  assert('valid JSON response passes through', validJsonResult, {
    ok: true,
    data: { items: [1, 2, 3] },
    error: null,
  });

  const falseResult = await handleApiResponse({
    ok: true,
    json: async () => false,
  });

  assert('valid falsy JSON response passes through', falseResult, {
    ok: true,
    data: false,
    error: null,
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
