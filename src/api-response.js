const EMPTY_RESPONSE_MESSAGE = 'No data was returned. Please try again later.';
const REQUEST_FAILED_MESSAGE = 'Unable to load data. Please try again later.';

function isResponseLike(value) {
  return Boolean(value && typeof value === 'object' && (
    typeof value.json === 'function' ||
    typeof value.text === 'function' ||
    'ok' in value ||
    'status' in value
  ));
}

function isEmptyPayload(value) {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

function notifyError(notifier, message) {
  if (!notifier) return;

  if (typeof notifier === 'function') {
    notifier(message);
    return;
  }

  if (typeof notifier.showErrorToast === 'function') {
    notifier.showErrorToast(message);
    return;
  }

  if (typeof notifier.error === 'function') {
    notifier.error(message);
  }
}

function success(data) {
  return { ok: true, data, error: null };
}

function failure(message, notifier) {
  notifyError(notifier, message);
  return { ok: false, data: null, error: message };
}

async function readResponseBody(response) {
  if (typeof response.json === 'function') {
    try {
      return await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) return null;
      throw error;
    }
  }

  if (typeof response.text === 'function') {
    return response.text();
  }

  return response;
}

async function handleApiResponse(responseOrPromise, options = {}) {
  const response = await responseOrPromise;
  const notifier = options.toast || options.notifier || options.onError;

  if (isEmptyPayload(response)) {
    return failure(EMPTY_RESPONSE_MESSAGE, notifier);
  }

  if (isResponseLike(response)) {
    if (response.ok === false) {
      return failure(REQUEST_FAILED_MESSAGE, notifier);
    }

    const body = await readResponseBody(response);
    if (isEmptyPayload(body)) {
      return failure(EMPTY_RESPONSE_MESSAGE, notifier);
    }

    return success(body);
  }

  return success(response);
}

module.exports = {
  EMPTY_RESPONSE_MESSAGE,
  REQUEST_FAILED_MESSAGE,
  handleApiResponse,
  isEmptyPayload,
  notifyError,
};
