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

function isEmptyResponseBody(value) {
  return value === null || value === undefined || value === '';
}

function toFriendlyErrorMessage(error) {
  if (error instanceof ApiResponseError) {
    return error.userMessage;
  }

  if (
    error instanceof SyntaxError &&
    error.message.includes('Unexpected end of JSON input')
  ) {
    return EMPTY_RESPONSE_MESSAGE;
  }

  return GENERIC_ERROR_MESSAGE;
}

async function readResponseBody(response) {
  try {
    if (isEmptyResponseBody(response)) {
      throw new ApiResponseError('API response was empty', EMPTY_RESPONSE_MESSAGE);
    }

    if (typeof response.json === 'function') {
      const data = await response.json();

      if (isEmptyResponseBody(data)) {
        throw new ApiResponseError(
          'API response body was empty',
          EMPTY_RESPONSE_MESSAGE
        );
      }

      return data;
    }

    if (typeof response.text === 'function') {
      const data = await response.text();

      if (isEmptyResponseBody(data)) {
        throw new ApiResponseError(
          'API response text body was empty',
          EMPTY_RESPONSE_MESSAGE
        );
      }

      return data;
    }

    return response;
  } catch (error) {
    if (
      error instanceof SyntaxError &&
      error.message.includes('Unexpected end of JSON input')
    ) {
      throw new ApiResponseError(
        'API response body was empty',
        EMPTY_RESPONSE_MESSAGE,
        { cause: error }
      );
    }

    throw error;
  }
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
    const message = toFriendlyErrorMessage(error);

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
  parseApiResponse: safeApiRequest,
  readResponseBody,
  safeApiRequest,
  toFriendlyErrorMessage,
};
