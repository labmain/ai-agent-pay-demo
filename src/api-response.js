class FriendlyAPIError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'FriendlyAPIError';
    this.cause = cause;
  }
}

const DEFAULT_EMPTY_RESPONSE_MESSAGE =
  'We could not load that data. Please try again in a moment.';

function createErrorToast(message = DEFAULT_EMPTY_RESPONSE_MESSAGE) {
  return {
    type: 'error',
    message,
    ariaLive: 'polite',
  };
}

function isEmptyResponseBody(body) {
  return body === null || body === undefined || (typeof body === 'string' && body.trim() === '');
}

async function readResponseBody(response) {
  if (response && typeof response.text === 'function') {
    return response.text();
  }

  if (response && Object.prototype.hasOwnProperty.call(response, 'body')) {
    return response.body;
  }

  return response;
}

async function parseAPIResponse(response, options = {}) {
  const emptyMessage = options.emptyMessage || DEFAULT_EMPTY_RESPONSE_MESSAGE;

  try {
    const body = await readResponseBody(response);

    if (isEmptyResponseBody(body)) {
      throw new FriendlyAPIError(emptyMessage);
    }

    if (typeof body === 'string') {
      return JSON.parse(body);
    }

    return body;
  } catch (error) {
    if (error instanceof FriendlyAPIError) {
      throw error;
    }

    throw new FriendlyAPIError(
      'We could not understand the response from the server. Please try again.',
      error,
    );
  }
}

async function handleAPIResponse(response, options = {}) {
  try {
    return {
      ok: true,
      data: await parseAPIResponse(response, options),
      toast: null,
    };
  } catch (error) {
    const message =
      error instanceof FriendlyAPIError
        ? error.message
        : DEFAULT_EMPTY_RESPONSE_MESSAGE;

    return {
      ok: false,
      data: null,
      error,
      toast: createErrorToast(message),
    };
  }
}

module.exports = {
  DEFAULT_EMPTY_RESPONSE_MESSAGE,
  FriendlyAPIError,
  createErrorToast,
  handleAPIResponse,
  isEmptyResponseBody,
  parseAPIResponse,
};
