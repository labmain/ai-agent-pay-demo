/**
 * Simple CSV Parser
 * Parses CSV text into an array of arrays
 * Supports both ASCII comma (,) and Chinese full-width comma (，)
 */

// Match ASCII comma (U+002C) or full-width comma (U+FF0C)
const COMMA_PATTERN = /,|，/;

function parseCSV(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const rows = text.trim().split('\n');
  return rows.map(row => row.split(COMMA_PATTERN).map(cell => cell.trim()));
}

function createErrorToast(message) {
  return {
    type: 'error',
    title: 'Unable to load bounties',
    message,
  };
}

function parseApiResponseBody(body) {
  if (body === null || body === undefined || body === '') {
    return {
      data: null,
      error: createErrorToast('The API returned an empty response. Please try again.'),
    };
  }

  if (typeof body === 'object') {
    return { data: body, error: null };
  }

  try {
    return { data: JSON.parse(body), error: null };
  } catch (error) {
    return {
      data: null,
      error: createErrorToast('The API returned an invalid response. Please try again.'),
    };
  }
}

module.exports = { parseCSV, parseApiResponseBody, createErrorToast };
