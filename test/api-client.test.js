const assert = require('assert');
const {
  EMPTY_RESPONSE_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  HTTP_ERROR_MESSAGE,
  parseApiResponse,
  toFriendlyErrorMessage,
} = require('../src/api-client');

async function run() {
  let toasts = [];

  const nullResult = await parseApiResponse(null, {
    showErrorToast: message => toasts.push(message),
  });

  assert.deepStrictEqual(nullResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert.deepStrictEqual(toasts, [EMPTY_RESPONSE_MESSAGE]);

  toasts = [];
  const undefinedResult = await parseApiResponse(undefined, {
    showErrorToast: message => toasts.push(message),
  });

  assert.deepStrictEqual(undefinedResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert.deepStrictEqual(toasts, [EMPTY_RESPONSE_MESSAGE]);

  toasts = [];
  const invalidJsonResult = await parseApiResponse(
    {
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    },
    { showErrorToast: message => toasts.push(message) }
  );

  assert.deepStrictEqual(invalidJsonResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert.deepStrictEqual(toasts, [EMPTY_RESPONSE_MESSAGE]);

  toasts = [];
  const emptyBodyResult = await parseApiResponse(
    { json: async () => '' },
    { showErrorToast: message => toasts.push(message) }
  );

  assert.deepStrictEqual(emptyBodyResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert.deepStrictEqual(toasts, [EMPTY_RESPONSE_MESSAGE]);

  toasts = [];
  const emptyTextResult = await parseApiResponse(
    { text: async () => '' },
    { showErrorToast: message => toasts.push(message) }
  );

  assert.deepStrictEqual(emptyTextResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert.deepStrictEqual(toasts, [EMPTY_RESPONSE_MESSAGE]);

  const validResult = await parseApiResponse({ json: async () => ({ id: 123 }) });
  assert.deepStrictEqual(validResult, {
    ok: true,
    data: { id: 123 },
  });

  const requestFunctionResult = await parseApiResponse(async () => ({
    ok: true,
    json: async () => ({ id: 456, status: 'ready' }),
  }));
  assert.deepStrictEqual(requestFunctionResult, {
    ok: true,
    data: { id: 456, status: 'ready' },
  });

  const promiseResult = await parseApiResponse(
    Promise.resolve({ ok: true, json: async () => [1, 2, 3] })
  );
  assert.deepStrictEqual(promiseResult, {
    ok: true,
    data: [1, 2, 3],
  });

  const falsyNumberResult = await parseApiResponse(0);
  assert.deepStrictEqual(falsyNumberResult, {
    ok: true,
    data: 0,
  });

  const falsyBooleanResult = await parseApiResponse(false);
  assert.deepStrictEqual(falsyBooleanResult, {
    ok: true,
    data: false,
  });

  const httpErrorResult = await parseApiResponse({
    ok: false,
    status: 503,
    json: async () => ({ error: 'unavailable' }),
  });
  assert.deepStrictEqual(httpErrorResult, {
    ok: false,
    error: HTTP_ERROR_MESSAGE,
  });

  const unexpectedErrorResult = await parseApiResponse(() => {
    throw new Error('network exploded');
  });
  assert.deepStrictEqual(unexpectedErrorResult, {
    ok: false,
    error: GENERIC_ERROR_MESSAGE,
  });

  assert.strictEqual(
    toFriendlyErrorMessage(new SyntaxError('Unexpected end of JSON input')),
    EMPTY_RESPONSE_MESSAGE
  );

  console.log('API client tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
