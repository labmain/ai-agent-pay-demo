const DEFAULT_ERROR_MESSAGE = 'We could not load that data. Please try again.';

function isEmptyApiResponse(response) {
  return response === null || response === undefined || response === '';
}

function normalizeApiResponse(response, options = {}) {
  const errorMessage = options.errorMessage || DEFAULT_ERROR_MESSAGE;

  if (isEmptyApiResponse(response)) {
    return {
      ok: false,
      data: null,
      error: errorMessage,
      status: 'empty',
    };
  }

  if (typeof response === 'string') {
    const trimmed = response.trim();
    if (!trimmed) {
      return {
        ok: false,
        data: null,
        error: errorMessage,
        status: 'empty',
      };
    }

    try {
      return {
        ok: true,
        data: JSON.parse(trimmed),
        error: null,
        status: 'ok',
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: 'The server returned invalid data. Please try again.',
        status: 'invalid-json',
      };
    }
  }

  return {
    ok: true,
    data: response,
    error: null,
    status: 'ok',
  };
}

async function safeJson(fetchPromise, options = {}) {
  try {
    const response = await fetchPromise;
    if (isEmptyApiResponse(response)) {
      return normalizeApiResponse(response, options);
    }

    if (typeof response.text === 'function') {
      return normalizeApiResponse(await response.text(), options);
    }

    if (typeof response.json === 'function') {
      return normalizeApiResponse(await response.json(), options);
    }

    return normalizeApiResponse(response, options);
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: options.errorMessage || DEFAULT_ERROR_MESSAGE,
      status: 'network-error',
    };
  }
}

function createErrorToast(message = DEFAULT_ERROR_MESSAGE) {
  return `<div class="toast toast-error" role="alert" aria-live="assertive">${escapeHtml(message)}</div>`;
}

function renderApiResult(result, { renderData, renderError = createErrorToast } = {}) {
  if (!result || result.ok === false) {
    return renderError((result && result.error) || DEFAULT_ERROR_MESSAGE);
  }
  if (typeof renderData !== 'function') {
    return '';
  }
  return renderData(result.data);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  DEFAULT_ERROR_MESSAGE,
  isEmptyApiResponse,
  normalizeApiResponse,
  safeJson,
  createErrorToast,
  renderApiResult,
  escapeHtml,
};
