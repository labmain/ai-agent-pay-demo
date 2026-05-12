const {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  handleApiResponse,
  safeApiCall,
} = require('../src/api-response');

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

async function run() {
  console.log('\n📋 API Response Tests\n');

  assert(
    'wraps successful API responses',
    handleApiResponse({ bounties: [{ id: 1 }] }),
    {
      ok: true,
      data: { bounties: [{ id: 1 }] },
      error: null,
      toast: null,
    }
  );

  assert(
    'handles null API responses without throwing',
    handleApiResponse(null),
    {
      ok: false,
      data: null,
      error: {
        code: 'EMPTY_API_RESPONSE',
        message: DEFAULT_EMPTY_RESPONSE_MESSAGE,
      },
      toast: {
        type: 'error',
        message: DEFAULT_EMPTY_RESPONSE_MESSAGE,
      },
    }
  );

  assert(
    'handles undefined API responses without throwing',
    handleApiResponse(undefined, { emptyMessage: 'No bounties were returned.' }),
    {
      ok: false,
      data: null,
      error: {
        code: 'EMPTY_API_RESPONSE',
        message: 'No bounties were returned.',
      },
      toast: {
        type: 'error',
        message: 'No bounties were returned.',
      },
    }
  );

  assert(
    'does not treat valid falsy API data as empty',
    [handleApiResponse(0).ok, handleApiResponse(false).ok, handleApiResponse('').ok],
    [true, true, true]
  );

  assert(
    'safeApiCall returns a friendly toast when the API throws',
    await safeApiCall(
      async () => {
        throw new Error('Network unavailable');
      },
      { errorMessage: 'Unable to load bounties.' }
    ),
    {
      ok: false,
      data: null,
      error: {
        code: 'API_RESPONSE_ERROR',
        message: 'Network unavailable',
      },
      toast: {
        type: 'error',
        message: 'Network unavailable',
      },
    }
  );

  assert(
    'safeApiCall handles an empty resolved response',
    await safeApiCall(async () => null),
    {
      ok: false,
      data: null,
      error: {
        code: 'EMPTY_API_RESPONSE',
        message: DEFAULT_EMPTY_RESPONSE_MESSAGE,
      },
      toast: {
        type: 'error',
        message: DEFAULT_EMPTY_RESPONSE_MESSAGE,
      },
    }
  );

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
