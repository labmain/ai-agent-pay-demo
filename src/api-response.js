const DEFAULT_EMPTY_MESSAGE = 'No data was returned by the server. Please try again.';
const DEFAULT_NETWORK_MESSAGE = 'No response was received from the server. Please try again.';
const DEFAULT_PARSE_MESSAGE = 'The server returned an invalid response. Please try again.';

function friendlyError(message, details = {}) {
  return {
    ok: false,
    data: null,
    error: {
      message,
      ...details,
    },
  };
}

async function readBody(response) {
  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response.text === 'function') {
    return response.text();
  }

  if (response && 'body' in response) {
    return response.body;
  }

  return response;
}

async function parseApiResponse(response) {
  if (!response) {
    return friendlyError(DEFAULT_NETWORK_MESSAGE);
  }

  const status = typeof response.status === 'number' ? response.status : undefined;
  const ok = typeof response.ok === 'boolean' ? response.ok : status === undefined || (status >= 200 && status < 300);

  if (status === 204 || status === 205) {
    return friendlyError(DEFAULT_EMPTY_MESSAGE, { status });
  }

  const body = await readBody(response);

  if (body == null || (typeof body === 'string' && body.trim() === '')) {
    return friendlyError(DEFAULT_EMPTY_MESSAGE, { status });
  }

  if (!ok) {
    return friendlyError(`Request failed${status ? ` with status ${status}` : ''}. Please try again.`, { status });
  }

  if (typeof body !== 'string') {
    return { ok: true, data: body, error: null };
  }

  try {
    return { ok: true, data: JSON.parse(body), error: null };
  } catch (_error) {
    return friendlyError(DEFAULT_PARSE_MESSAGE, { status });
  }
}

module.exports = { parseApiResponse };
