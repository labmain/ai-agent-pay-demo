/**
 * Simple CSV Parser
 * Parses CSV text into an array of arrays
 */

function parseCSV(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const rows = text.trim().split('\n');
  // BUG: Only splits on ASCII comma (U+002C)
  // Does NOT handle Chinese full-width comma (U+FF0C) "，"
  return rows.map(row => row.split(',').map(cell => cell.trim()));
}

module.exports = { parseCSV };
