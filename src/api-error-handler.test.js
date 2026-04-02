const { safeParseResponse, handleApiError, ApiResponseError, safeApiCall } = require('./api-error-handler');

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

console.log('\n📋 API Error Handler Tests\n');

// safeParseResponse
assert('fallback for null', safeParseResponse(null, []), []);
assert('fallback for undefined', safeParseResponse(undefined, { data: [] }), { data: [] });
assert('valid object returned', safeParseResponse({ items: [1,2,3] }, {}), { items: [1,2,3] });
assert('non-object returns fallback', safeParseResponse('hello', { default: true }), { default: true });
assert('arrays work', safeParseResponse([1,2,3], []), [1,2,3]);

// handleApiError
assert('ApiResponseError', handleApiError(new ApiResponseError('Not found', 404)), 'Not found');
assert('Error with network', handleApiError(new Error('Network request failed')), 'Network error. Please check your connection.');
assert('Error with timeout', handleApiError(new Error('Request timeout after 5000ms')), 'Request timed out. Please try again.');
assert('Error with 404', handleApiError(new Error('Received 404 from server')), 'Resource not found.');
assert('Generic Error', handleApiError(new Error('Something broke')), 'Something broke');
assert('String error', handleApiError('Invalid config'), 'Invalid config');
assert('Unknown type', handleApiError({ foo: 'bar' }), 'An unexpected error occurred');

// safeApiCall tests (async)
(async () => {
  const r1 = await safeApiCall(async () => ({ val: 42 }), { val: 0 });
  assert('success returns result', r1, { val: 42 });
  
  const r2 = await safeApiCall(async () => { throw new Error('fail'); }, { def: true });
  assert('throw returns fallback', r2, { def: true });
  
  const r3 = await safeApiCall(async () => null, { empty: true });
  assert('null returns fallback', r3, { empty: true });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
