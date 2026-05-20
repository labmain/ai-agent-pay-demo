const DEFAULT_API_ERROR_MESSAGE = 'Something went wrong while loading data. Please try again.';
const EMPTY_API_RESPONSE_MESSAGE = 'No data was returned. Please try again.';

class ApiResponseError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiResponseError';
    this.userMessage = options.userMessage || DEFAULT_API_ERROR_MESSAGE;
    this.cause = options.cause;
  }
}

function isEmptyString(value) {
  return typeof value === 'string' && value.trim() === '';
}

function createEmptyResponseError() {
  return new ApiResponseError('API response was empty.', {
    userMessage: EMPTY_API_RESPONSE_MESSAGE,
  });
}

async function parseApiResponse(response) {
  if (response == null || isEmptyString(response)) {
    throw createEmptyResponseError();
  }

  if (response.ok === false) {
    throw new ApiResponseError(`API request failed with status ${response.status || 'unknown'}.`);
  }

  if (typeof response.json === 'function') {
    try {
      const data = await response.json();

      if (data == null || isEmptyString(data)) {
        throw createEmptyResponseError();
      }

      return data;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      throw new ApiResponseError('API response could not be parsed as JSON.', {
        cause: error,
      });
    }
  }

  if (typeof response.text === 'function') {
    const body = await response.text();

    if (isEmptyString(body)) {
      throw createEmptyResponseError();
    }

    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  return response;
}

function showErrorToast(toast, message) {
  if (!toast) {
    return;
  }

  if (typeof toast === 'function') {
    toast(message);
    return;
  }

  if (typeof toast.error === 'function') {
    toast.error(message);
    return;
  }

  if (typeof toast.showErrorToast === 'function') {
    toast.showErrorToast(message);
  }
}

async function safeApiCall(request, options = {}) {
  try {
    const response = typeof request === 'function' ? await request() : await request;
    const data = await parseApiResponse(response);

    return { ok: true, data, error: null };
  } catch (error) {
    const apiError =
      error instanceof ApiResponseError
        ? error
        : new ApiResponseError(error?.message || DEFAULT_API_ERROR_MESSAGE, {
            cause: error,
          });
    const message = options.errorMessage || apiError.userMessage;

    showErrorToast(options.toast, message);

    return { ok: false, data: null, error: apiError, message };
  }
}

module.exports = {
  ApiResponseError,
  DEFAULT_API_ERROR_MESSAGE,
  EMPTY_API_RESPONSE_MESSAGE,
  parseApiResponse,
  safeApiCall,
  showErrorToast,
};
