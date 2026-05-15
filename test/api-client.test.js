const assert = require('assert');
const {
  EMPTY_RESPONSE_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  HTTP_ERROR_MESSAGE,
  friendlyMessageFor,
  safeApiRequest,
} = require('../src/api-client');

async function run() {
  const toasts = [];

  const nullResult = await safeApiRequest(null, {
    showErrorToast: message => toasts.push(message),
  });
  assert.deepStrictEqual(nullResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert.deepStrictEqual(toasts, [EMPTY_RESPONSE_MESSAGE]);

  const undefinedResult = await safeApiRequest(undefined);
  assert.deepStrictEqual(undefinedResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const emptyStringJsonResult = await safeApiRequest({
    ok: true,
    json: async () => '',
  });
  assert.deepStrictEqual(emptyStringJsonResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const emptyJsonParseResult = await safeApiRequest({
    ok: true,
    json: async () => {
      throw new SyntaxError('Unexpected end of JSON input');
    },
  });
  assert.deepStrictEqual(emptyJsonParseResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const emptyTextResult = await safeApiRequest({
    ok: true,
    text: async () => '',
  });
  assert.deepStrictEqual(emptyTextResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const httpErrorResult = await safeApiRequest({
    ok: false,
    status: 503,
    json: async () => ({ error: 'unavailable' }),
  });
  assert.deepStrictEqual(httpErrorResult, {
    ok: false,
    error: HTTP_ERROR_MESSAGE,
  });

  const requestFunctionResult = await safeApiRequest(async () => ({
    ok: true,
    json: async () => ({ id: 123, status: 'ready' }),
  }));
  assert.deepStrictEqual(requestFunctionResult, {
    ok: true,
    data: { id: 123, status: 'ready' },
  });

  const promiseResult = await safeApiRequest(
    Promise.resolve({ ok: true, json: async () => [1, 2, 3] })
  );
  assert.deepStrictEqual(promiseResult, {
    ok: true,
    data: [1, 2, 3],
  });

  const directFalsyNumberResult = await safeApiRequest(0);
  assert.deepStrictEqual(directFalsyNumberResult, {
    ok: true,
    data: 0,
  });

  const directFalsyBooleanResult = await safeApiRequest(false);
  assert.deepStrictEqual(directFalsyBooleanResult, {
    ok: true,
    data: false,
  });

  const unexpectedResult = await safeApiRequest(() => {
    throw new Error('network exploded');
  });
  assert.deepStrictEqual(unexpectedResult, {
    ok: false,
    error: GENERIC_ERROR_MESSAGE,
  });

  assert.strictEqual(
    friendlyMessageFor(new SyntaxError('Unexpected end of JSON input')),
    EMPTY_RESPONSE_MESSAGE
  );

  console.log('api-client tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
