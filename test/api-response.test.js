const assert = require('assert');
const {
  EMPTY_RESPONSE_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  REQUEST_FAILED_MESSAGE,
  readApiResponse,
  requestWithFriendlyErrors,
  toUserMessage,
} = require('../src/api-response');

async function run() {
  const functionToasts = [];

  const nullResult = await requestWithFriendlyErrors(null, {
    showErrorToast: message => functionToasts.push(message),
  });

  assert.deepStrictEqual(nullResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });
  assert.deepStrictEqual(functionToasts, [EMPTY_RESPONSE_MESSAGE]);

  const undefinedResult = await requestWithFriendlyErrors(undefined);
  assert.deepStrictEqual(undefinedResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const emptyJsonResult = await requestWithFriendlyErrors({
    ok: true,
    json: async () => null,
  });
  assert.deepStrictEqual(emptyJsonResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const emptyJsonParseResult = await requestWithFriendlyErrors({
    ok: true,
    json: async () => {
      throw new SyntaxError('Unexpected end of JSON input');
    },
  });
  assert.deepStrictEqual(emptyJsonParseResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const emptyTextResult = await requestWithFriendlyErrors({
    ok: true,
    text: async () => '',
  });
  assert.deepStrictEqual(emptyTextResult, {
    ok: false,
    error: EMPTY_RESPONSE_MESSAGE,
  });

  const objectToast = {
    messages: [],
    error(message) {
      this.messages.push(message);
    },
  };
  const httpErrorResult = await requestWithFriendlyErrors(
    { ok: false, status: 503, text: async () => '{"error":"down"}' },
    { toast: objectToast }
  );
  assert.deepStrictEqual(httpErrorResult, {
    ok: false,
    error: REQUEST_FAILED_MESSAGE,
  });
  assert.deepStrictEqual(objectToast.messages, [REQUEST_FAILED_MESSAGE]);

  const parsedJson = await readApiResponse({
    ok: true,
    headers: { get: () => 'application/json' },
    text: async () => '{"id":123,"status":"ready"}',
  });
  assert.deepStrictEqual(parsedJson, { id: 123, status: 'ready' });

  const plainText = await readApiResponse({
    ok: true,
    headers: { get: () => 'text/plain' },
    text: async () => 'ready',
  });
  assert.strictEqual(plainText, 'ready');

  const requestFunctionResult = await requestWithFriendlyErrors(async () => ({
    ok: true,
    json: async () => ({ id: 456 }),
  }));
  assert.deepStrictEqual(requestFunctionResult, {
    ok: true,
    data: { id: 456 },
  });

  const zeroResult = await requestWithFriendlyErrors(0);
  assert.deepStrictEqual(zeroResult, {
    ok: true,
    data: 0,
  });

  const falseResult = await requestWithFriendlyErrors(false);
  assert.deepStrictEqual(falseResult, {
    ok: true,
    data: false,
  });

  const unexpectedErrorResult = await requestWithFriendlyErrors(() => {
    throw new Error('network exploded');
  });
  assert.deepStrictEqual(unexpectedErrorResult, {
    ok: false,
    error: GENERIC_ERROR_MESSAGE,
  });

  assert.strictEqual(
    toUserMessage(new SyntaxError('Unexpected end of JSON input')),
    EMPTY_RESPONSE_MESSAGE
  );

  console.log('api-response tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
