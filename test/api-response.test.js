const { parseApiResponse, DEFAULT_ERROR_MESSAGE } = require('../src/api-response');

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

assert(
  'handles null response with friendly error toast',
  parseApiResponse(null),
  {
    ok: false,
    data: null,
    toast: { type: 'error', message: DEFAULT_ERROR_MESSAGE },
  }
);

assert(
  'handles undefined response with friendly error toast',
  parseApiResponse(undefined),
  {
    ok: false,
    data: null,
    toast: { type: 'error', message: DEFAULT_ERROR_MESSAGE },
  }
);

assert(
  'handles empty response body with friendly error toast',
  parseApiResponse(''),
  {
    ok: false,
    data: null,
    toast: { type: 'error', message: DEFAULT_ERROR_MESSAGE },
  }
);

assert(
  'parses valid JSON response body',
  parseApiResponse('{"bounties":[{"id":35}]}'),
  {
    ok: true,
    data: { bounties: [{ id: 35 }] },
    toast: null,
  }
);

assert(
  'returns object responses unchanged',
  parseApiResponse({ bounties: [] }),
  {
    ok: true,
    data: { bounties: [] },
    toast: null,
  }
);

assert(
  'uses custom friendly error message',
  parseApiResponse(null, { errorMessage: 'No bounty data was returned.' }),
  {
    ok: false,
    data: null,
    toast: { type: 'error', message: 'No bounty data was returned.' },
  }
);

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
