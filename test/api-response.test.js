const assert = require('assert');
const {
  ApiResponseError,
  EMPTY_API_RESPONSE_MESSAGE,
  parseApiResponse,
  safeApiCall,
  showErrorToast,
} = require('../src/api-response');

async function assertRejectsEmpty(name, response) {
  let error;

  try {
    await parseApiResponse(response);
  } catch (caught) {
    error = caught;
  }

  assert.ok(error instanceof ApiResponseError, name);
  assert.equal(error.userMessage, EMPTY_API_RESPONSE_MESSAGE);
}

async function testHandlesNullUndefinedAndEmptyResponses() {
  await assertRejectsEmpty('null response is rejected safely', null);
  await assertRejectsEmpty('undefined response is rejected safely', undefined);
  await assertRejectsEmpty('empty string response is rejected safely', '  ');
  await assertRejectsEmpty('empty text body is rejected safely', {
    ok: true,
    text: async () => '',
  });
  await assertRejectsEmpty('null JSON body is rejected safely', {
    ok: true,
    json: async () => null,
  });
}

async function testPreservesValidFalsyPayloads() {
  assert.equal(await parseApiResponse({ ok: true, json: async () => 0 }), 0);
  assert.equal(await parseApiResponse({ ok: true, json: async () => false }), false);
}

async function testParsesValidResponses() {
  assert.deepEqual(await parseApiResponse({ ok: true, json: async () => ({ ok: true }) }), {
    ok: true,
  });
  assert.deepEqual(await parseApiResponse({ ok: true, text: async () => '{"ok":true}' }), {
    ok: true,
  });
  assert.equal(await parseApiResponse({ ok: true, text: async () => 'plain text' }), 'plain text');
}

async function testSafeApiCallShowsFriendlyToast() {
  const messages = [];
  const result = await safeApiCall(async () => null, {
    toast: (message) => messages.push(message),
  });

  assert.equal(result.ok, false);
  assert.equal(result.data, null);
  assert.ok(result.error instanceof ApiResponseError);
  assert.deepEqual(messages, [EMPTY_API_RESPONSE_MESSAGE]);
}

function testToastAdapters() {
  const messages = [];

  showErrorToast((message) => messages.push(`fn:${message}`), 'one');
  showErrorToast({ error: (message) => messages.push(`error:${message}`) }, 'two');
  showErrorToast(
    { showErrorToast: (message) => messages.push(`showErrorToast:${message}`) },
    'three'
  );

  assert.deepEqual(messages, ['fn:one', 'error:two', 'showErrorToast:three']);
}

async function run() {
  await testHandlesNullUndefinedAndEmptyResponses();
  await testPreservesValidFalsyPayloads();
  await testParsesValidResponses();
  await testSafeApiCallShowsFriendlyToast();
  testToastAdapters();

  console.log('api-response tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
