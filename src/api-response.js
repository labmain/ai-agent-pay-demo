const DEFAULT_ERROR_MESSAGE = 'Unable to load data. Please try again later.';

function createErrorToast(message = DEFAULT_ERROR_MESSAGE) {
  return {
    type: 'error',
    message,
  };
}

function parseApiResponse(body, options = {}) {
  const errorMessage = options.errorMessage || DEFAULT_ERROR_MESSAGE;

  if (body === null || body === undefined || body === '') {
    return {
      ok: false,
      data: null,
      toast: createErrorToast(errorMessage),
    };
  }

  if (typeof body === 'string') {
    try {
      return {
        ok: true,
        data: JSON.parse(body),
        toast: null,
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        toast: createErrorToast(errorMessage),
      };
    }
  }

  return {
    ok: true,
    data: body,
    toast: null,
  };
}

module.exports = {
  DEFAULT_ERROR_MESSAGE,
  createErrorToast,
  parseApiResponse,
};
