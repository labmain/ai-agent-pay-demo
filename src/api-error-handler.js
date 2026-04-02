class ApiResponseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiResponseError';
    this.statusCode = statusCode;
  }
}

function safeParseResponse(response, fallback) {
  if (response === null || response === undefined) {
    console.warn('[api-error-handler] Empty response, using fallback');
    return fallback;
  }
  if (typeof response !== 'object') {
    console.warn('[api-error-handler] Response not object, using fallback');
    return fallback;
  }
  return response;
}

function handleApiError(error) {
  if (error instanceof ApiResponseError) {
    return error.message;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    if (msg.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (msg.includes('404')) {
      return 'Resource not found.';
    }
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

async function safeApiCall(fn, fallback) {
  try {
    const result = await fn();
    return safeParseResponse(result, fallback);
  } catch (err) {
    console.error('[safeApiCall] Error:', err);
    return fallback;
  }
}

module.exports = { ApiResponseError, safeParseResponse, handleApiError, safeApiCall };
