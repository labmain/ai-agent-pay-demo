'use strict';

const EMPTY_RESPONSE_MESSAGE =
  'The server returned an empty response. Please try again.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const HTTP_ERROR_MESSAGE = 'The server request failed. Please try again.';

class ApiResponseError extends Error {
  constructor(message, userMessage = GENERIC_ERROR_MESSAGE, options = {}) {
    super(message);
    this.name = 'ApiResponseError';
    this.userMessage = userMessage;
    this.status = options.status;
    this.cause = options.cause;
  }
}

function isEmptyPayload(value) {
  return value === null || value === undefined || value === '';
}

function friendlyMessageFor(error) {
  if (error instanceof ApiResponseError) {
    return error.userMessage;
  }

  if (
    error instanceof SyntaxError &&
    /unexpected end of json input/i.test(error.message)
  ) {
    return EMPTY_RESPONSE_MESSAGE;
  }

  return GENERIC_ERROR_MESSAGE;
}

async function readResponseBody(response) {
  if (isEmptyPayload(response)) {
    throw new ApiResponseError('API response object was empty', EMPTY_RESPONSE_MESSAGE);
  }

  if (typeof response.json === 'function') {
    try {
      const json = await response.json();
      if (isEmptyPayload(json)) {
        throw new ApiResponseError('API response JSON body was empty', EMPTY_RESPONSE_MESSAGE);
      }
      return json;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      if (
        error instanceof SyntaxError &&
        /unexpected end of json input/i.test(error.message)
      ) {
        throw new ApiResponseError(
          'API response JSON body was empty or invalid',
          EMPTY_RESPONSE_MESSAGE,
          { cause: error }
        );
      }

      throw error;
    }
  }

  if (typeof response.text === 'function') {
    const text = await response.text();
    if (isEmptyPayload(text)) {
      throw new ApiResponseError('API response text body was empty', EMPTY_RESPONSE_MESSAGE);
    }
    return text;
  }

  if (isEmptyPayload(response)) {
    throw new ApiResponseError('API response body was empty', EMPTY_RESPONSE_MESSAGE);
  }

  return response;
}

async function safeApiRequest(requestOrResponse, options = {}) {
  const { showErrorToast } = options;

  try {
    const response =
      typeof requestOrResponse === 'function'
        ? await requestOrResponse()
        : await requestOrResponse;

    if (response && response.ok === false) {
      throw new ApiResponseError(
        `API request failed with status ${response.status || 'unknown'}`,
        HTTP_ERROR_MESSAGE,
        { status: response.status }
      );
    }

    const data = await readResponseBody(response);
    return { ok: true, data };
  } catch (error) {
    const message = friendlyMessageFor(error);

    if (typeof showErrorToast === 'function') {
      showErrorToast(message);
    }

    return { ok: false, error: message };
  }
}

module.exports = {
  ApiResponseError,
  EMPTY_RESPONSE_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  HTTP_ERROR_MESSAGE,
  friendlyMessageFor,
  readResponseBody,
  safeApiRequest,
};
