const EMPTY_RESPONSE_MESSAGE =
  'The server returned an empty response. Please try again.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

class ApiResponseError extends Error {
  constructor(message, userMessage = GENERIC_ERROR_MESSAGE) {
    super(message);
    this.name = 'ApiResponseError';
    this.userMessage = userMessage;
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

async function parseApiResponse(response, options = {}) {
  const { showErrorToast } = options;

  try {
    if (isEmptyResponseBody(response)) {
      throw new ApiResponseError('API response was empty', EMPTY_RESPONSE_MESSAGE);
    }

    const data =
      response && typeof response.json === 'function'
        ? await response.json()
        : response;

    if (isEmptyResponseBody(data)) {
      throw new ApiResponseError(
        'API response body was empty',
        EMPTY_RESPONSE_MESSAGE
      );
    }

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
  parseApiResponse,
  toFriendlyErrorMessage,
};
