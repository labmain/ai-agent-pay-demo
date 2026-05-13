const {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  handleApiResponse,
  isEmptyApiResponse,
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

console.log('\nAPI Response Error Handling Tests\n');

assert('detects null API responses as empty', isEmptyApiResponse(null), true);
assert('detects undefined API responses as empty', isEmptyApiResponse(undefined), true);
assert('detects empty string API responses as empty', isEmptyApiResponse(''), true);
assert('does not treat empty objects as empty responses', isEmptyApiResponse({}), false);

const toasts = [];
const emptyResult = handleApiResponse(undefined, {
  onError: message => toasts.push(message),
});

assert('returns a friendly error result for empty responses', emptyResult, {
  ok: false,
  error: DEFAULT_EMPTY_RESPONSE_MESSAGE,
  data: null,
});
assert('shows a friendly error toast for empty responses', toasts, [
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
]);

const successPayload = { id: 1, status: 'paid' };
assert('passes through valid API responses', handleApiResponse(successPayload), {
  ok: true,
  error: null,
  data: successPayload,
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
