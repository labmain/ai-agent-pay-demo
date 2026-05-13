const DEFAULT_EMPTY_RESPONSE_MESSAGE =
  'We could not load data from the API. Please try again in a moment.';

function isEmptyApiResponse(response) {
  return response === null || response === undefined || response === '';
}

function notifyError(onError, message) {
  if (typeof onError === 'function') {
    onError(message);
  }
}

function handleApiResponse(response, options = {}) {
  const message = options.emptyMessage || DEFAULT_EMPTY_RESPONSE_MESSAGE;

  if (isEmptyApiResponse(response)) {
    notifyError(options.onError, message);
    return { ok: false, error: message, data: null };
  }

  return { ok: true, error: null, data: response };
}

module.exports = {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  handleApiResponse,
  isEmptyApiResponse,
};
