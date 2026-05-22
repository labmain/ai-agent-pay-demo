const { parseApiResponse } = require('../src/api-response');

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

async function run() {
  console.log('\nAPI Response Tests\n');

  assert(
    'returns parsed JSON for a valid response',
    await parseApiResponse({ ok: true, status: 200, text: async () => '{"items":[1,2]}' }),
    { ok: true, data: { items: [1, 2] }, error: null }
  );

  assert(
    'handles null response without throwing',
    await parseApiResponse(null),
    {
      ok: false,
      data: null,
      error: { message: 'No response was received from the server. Please try again.' },
    }
  );

  assert(
    'handles empty response body without throwing',
    await parseApiResponse({ ok: true, status: 200, text: async () => '   ' }),
    {
      ok: false,
      data: null,
      error: { message: 'No data was returned by the server. Please try again.', status: 200 },
    }
  );

  assert(
    'handles 204 responses as empty data',
    await parseApiResponse({ ok: true, status: 204, text: async () => '' }),
    {
      ok: false,
      data: null,
      error: { message: 'No data was returned by the server. Please try again.', status: 204 },
    }
  );

  assert(
    'returns a friendly parse error for malformed JSON',
    await parseApiResponse({ ok: true, status: 200, text: async () => '{bad json' }),
    {
      ok: false,
      data: null,
      error: {
        message: 'The server returned an invalid response. Please try again.',
        status: 200,
      },
    }
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
