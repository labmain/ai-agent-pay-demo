const assert = require('assert');
const {
  EMPTY_RESPONSE_MESSAGE,
  parseApiResponse,
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

  const validResult = await parseApiResponse({ json: async () => ({ id: 123 }) });
  assert.deepStrictEqual(validResult, {
    ok: true,
    data: { id: 123 },
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

  console.log('API client tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
