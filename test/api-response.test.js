const assert = require('node:assert/strict');
const {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  FriendlyAPIError,
  createErrorToast,
  handleAPIResponse,
  isEmptyResponseBody,
  parseAPIResponse,
} = require('../src/api-response');

async function run() {
  console.log('\nAPI Response Tests\n');

  assert.equal(isEmptyResponseBody(null), true);
  assert.equal(isEmptyResponseBody(undefined), true);
  assert.equal(isEmptyResponseBody('   '), true);
  assert.equal(isEmptyResponseBody('{"ok":true}'), false);

  assert.deepEqual(await parseAPIResponse({ text: async () => '{"ok":true}' }), {
    ok: true,
  });

  await assert.rejects(
    () => parseAPIResponse({ text: async () => '' }),
    (error) =>
      error instanceof FriendlyAPIError &&
      error.message === DEFAULT_EMPTY_RESPONSE_MESSAGE,
  );

  const emptyResult = await handleAPIResponse({ text: async () => '' });
  assert.equal(emptyResult.ok, false);
  assert.equal(emptyResult.data, null);
  assert.deepEqual(emptyResult.toast, createErrorToast(DEFAULT_EMPTY_RESPONSE_MESSAGE));

  const customResult = await handleAPIResponse(
    { body: null },
    { emptyMessage: 'No bounty data was returned. Please refresh.' },
  );
  assert.equal(customResult.ok, false);
  assert.deepEqual(
    customResult.toast,
    createErrorToast('No bounty data was returned. Please refresh.'),
  );

  const malformedResult = await handleAPIResponse({ text: async () => '{' });
  assert.equal(malformedResult.ok, false);
  assert.equal(
    malformedResult.toast.message,
    'We could not understand the response from the server. Please try again.',
  );

  const objectResult = await handleAPIResponse({ body: { items: [] } });
  assert.deepEqual(objectResult, { ok: true, data: { items: [] }, toast: null });

  console.log('  OK empty responses return friendly error toasts');
  console.log('  OK valid JSON and object payloads are preserved');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
