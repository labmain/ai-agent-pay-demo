/**
 * Helpers for safely handling API responses in UI code.
 *
 * Empty API responses are converted into friendly error states so callers can
 * show a toast instead of crashing while reading missing fields.
 */

const DEFAULT_EMPTY_RESPONSE_MESSAGE =
  'We could not load this data. Please try again in a moment.';

function createErrorToast(message = DEFAULT_EMPTY_RESPONSE_MESSAGE) {
  return {
    type: 'error',
    message,
  };
}

function emptyApiResponse(message = DEFAULT_EMPTY_RESPONSE_MESSAGE) {
  return {
    ok: false,
    data: null,
    error: {
      code: 'EMPTY_API_RESPONSE',
      message,
    },
    toast: createErrorToast(message),
  };
}

function apiResponseError(error, fallbackMessage = DEFAULT_EMPTY_RESPONSE_MESSAGE) {
  const message = error instanceof Error && error.message
    ? error.message
    : fallbackMessage;

  return {
    ok: false,
    data: null,
    error: {
      code: 'API_RESPONSE_ERROR',
      message,
    },
    toast: createErrorToast(message),
  };
}

function handleApiResponse(response, options = {}) {
  const message = options.emptyMessage || DEFAULT_EMPTY_RESPONSE_MESSAGE;

  if (response === null || response === undefined) {
    return emptyApiResponse(message);
  }

  return {
    ok: true,
    data: response,
    error: null,
    toast: null,
  };
}

async function safeApiCall(fetcher, options = {}) {
  try {
    return handleApiResponse(await fetcher(), options);
  } catch (error) {
    return apiResponseError(error, options.errorMessage);
  }
}

module.exports = {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  createErrorToast,
  handleApiResponse,
  safeApiCall,
};
