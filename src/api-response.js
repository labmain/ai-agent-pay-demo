const DEFAULT_EMPTY_RESPONSE_MESSAGE =
  'We could not load data from the API. Please try again in a moment.';

function createToast(message, type = 'error') {
  return { type, message };
}

function isEmptyResponse(response) {
  if (response === null || response === undefined) {
    return true;
  }

  if (typeof response === 'string') {
    return response.trim().length === 0;
  }

  if (Array.isArray(response)) {
    return response.length === 0;
  }

  return typeof response === 'object' && Object.keys(response).length === 0;
}

function parseApiResponse(response, options = {}) {
  const message = options.emptyMessage || DEFAULT_EMPTY_RESPONSE_MESSAGE;

  if (isEmptyResponse(response)) {
    return {
      ok: false,
      data: null,
      toast: createToast(message),
    };
  }

  if (typeof response === 'string') {
    try {
      return {
        ok: true,
        data: JSON.parse(response),
        toast: null,
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        toast: createToast('The API returned malformed data. Please try again later.'),
      };
    }
  }

  return {
    ok: true,
    data: response,
    toast: null,
  };
}

module.exports = {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  createToast,
  isEmptyResponse,
  parseApiResponse,
};
