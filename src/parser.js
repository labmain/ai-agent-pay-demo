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

module.exports = { parseCSV };
