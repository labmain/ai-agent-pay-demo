/**
 * Shared API response handling utilities.
 */

const EMPTY_RESPONSE_MESSAGE = 'The server returned an empty response. Please try again.';
const REQUEST_FAILED_MESSAGE = 'The server request failed. Please try again.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

class ApiResponseError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiResponseError';
    this.code = options.code || 'API_RESPONSE_ERROR';
    this.status = options.status;
    this.userMessage = options.userMessage || GENERIC_ERROR_MESSAGE;
    this.cause = options.cause;
  }
}

function isEmptyResponse(value) {
  return value === null || value === undefined || value === '';
}

function isEmptyJsonSyntaxError(error) {
  return error instanceof SyntaxError && /unexpected end of json input/i.test(error.message);
}

function showFriendlyToast(toast, message) {
  if (typeof toast === 'function') {
    toast(message);
    return;
  }

  if (toast && typeof toast.error === 'function') {
    toast.error(message);
  }
}

function toUserMessage(error) {
  if (error instanceof ApiResponseError) {
    return error.userMessage;
  }

  if (isEmptyJsonSyntaxError(error)) {
    return EMPTY_RESPONSE_MESSAGE;
  }

  return GENERIC_ERROR_MESSAGE;
}

function parseBodyText(text, response) {
  if (isEmptyResponse(text)) {
    throw new ApiResponseError('API response body was empty', {
      code: 'EMPTY_RESPONSE',
      status: response && response.status,
      userMessage: EMPTY_RESPONSE_MESSAGE,
    });
  }

  const contentType =
    typeof response.headers?.get === 'function' ? response.headers.get('content-type') : '';

  if (/json/i.test(contentType) || /^[\[{]/.test(text.trim())) {
    return JSON.parse(text);
  }

  return text;
}

async function readApiResponse(response) {
  if (isEmptyResponse(response)) {
    throw new ApiResponseError('API response was empty', {
      code: 'EMPTY_RESPONSE',
      userMessage: EMPTY_RESPONSE_MESSAGE,
    });
  }

  if (response && response.ok === false) {
    throw new ApiResponseError(`API request failed with status ${response.status || 'unknown'}`, {
      code: 'REQUEST_FAILED',
      status: response.status,
      userMessage: REQUEST_FAILED_MESSAGE,
    });
  }

  if (typeof response.text === 'function') {
    return parseBodyText(await response.text(), response);
  }

  if (typeof response.json === 'function') {
    try {
      const data = await response.json();

      if (isEmptyResponse(data)) {
        throw new ApiResponseError('API JSON response body was empty', {
          code: 'EMPTY_RESPONSE',
          status: response.status,
          userMessage: EMPTY_RESPONSE_MESSAGE,
        });
      }

      return data;
    } catch (error) {
      if (isEmptyJsonSyntaxError(error)) {
        throw new ApiResponseError('API JSON response body was empty', {
          code: 'EMPTY_RESPONSE',
          status: response.status,
          userMessage: EMPTY_RESPONSE_MESSAGE,
          cause: error,
        });
      }

      throw error;
    }
  }

  return response;
}

async function requestWithFriendlyErrors(requestOrResponse, options = {}) {
  try {
    const response =
      typeof requestOrResponse === 'function'
        ? await requestOrResponse()
        : await requestOrResponse;

    return {
      ok: true,
      data: await readApiResponse(response),
    };
  } catch (error) {
    const message = toUserMessage(error);
    showFriendlyToast(options.toast || options.showErrorToast, message);

    return {
      ok: false,
      error: message,
    };
  }
}

module.exports = {
  ApiResponseError,
  EMPTY_RESPONSE_MESSAGE,
  REQUEST_FAILED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  isEmptyResponse,
  readApiResponse,
  requestWithFriendlyErrors,
  showFriendlyToast,
  toUserMessage,
};
