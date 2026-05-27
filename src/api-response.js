class ApiResponseError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = options.status;
    this.toast = {
      type: 'error',
      message,
    };
  }
}

async function normalizeApiResponse(response) {
  if (response === null || response === undefined) {
    throw new ApiResponseError('The server returned an empty response. Please try again.');
  }

  const status = typeof response.status === 'number' ? response.status : undefined;
  const ok = typeof response.ok === 'boolean' ? response.ok : true;
  const hasJson = typeof response.json === 'function';
  const hasText = typeof response.text === 'function';

  if (!hasJson && !hasText) {
    if (!ok) {
      throw new ApiResponseError('The request failed. Please try again.', { status });
    }
    return response;
  }

  let body;
  if (hasJson) {
    try {
      body = await response.json();
    } catch (error) {
      if (!hasText) {
        throw new ApiResponseError('The server returned invalid data. Please try again.', { status });
      }
    }
  }

  if (body === undefined && hasText) {
    const text = await response.text();
    if (text.trim() === '') {
      throw new ApiResponseError('The server returned an empty response. Please try again.', { status });
    }
    try {
      body = JSON.parse(text);
    } catch (error) {
      body = text;
    }
  }

  if (body === null || body === undefined) {
    throw new ApiResponseError('The server returned an empty response. Please try again.', { status });
  }

  if (!ok) {
    throw new ApiResponseError('The request failed. Please try again.', { status });
  }

  return body;
}

module.exports = { ApiResponseError, normalizeApiResponse };
