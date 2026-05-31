const {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  isEmptyResponse,
  parseApiResponse,
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

console.log('\nAPI Response Tests\n');

assert('treats null as an empty response', isEmptyResponse(null), true);
assert('treats undefined as an empty response', isEmptyResponse(undefined), true);
assert('treats an empty string as an empty response', isEmptyResponse('   '), true);
assert('treats an empty object as an empty response', isEmptyResponse({}), true);

assert(
  'returns a friendly toast for null responses',
  parseApiResponse(null),
  {
    ok: false,
    data: null,
    toast: {
      type: 'error',
      message: DEFAULT_EMPTY_RESPONSE_MESSAGE,
    },
  },
);

assert(
  'returns a friendly toast for undefined responses',
  parseApiResponse(undefined, { emptyMessage: 'No API data was returned.' }),
  {
    ok: false,
    data: null,
    toast: {
      type: 'error',
      message: 'No API data was returned.',
    },
  },
);

assert(
  'parses valid JSON responses',
  parseApiResponse('{"items":[1,2]}'),
  {
    ok: true,
    data: { items: [1, 2] },
    toast: null,
  },
);

assert(
  'returns a friendly toast for malformed JSON responses',
  parseApiResponse('{'),
  {
    ok: false,
    data: null,
    toast: {
      type: 'error',
      message: 'The API returned malformed data. Please try again later.',
    },
  },
);

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
