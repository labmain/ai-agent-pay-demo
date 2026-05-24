const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseCSV } = require('../src/parser');

const fixturePath = path.join(__dirname, 'fixtures', 'orders.csv');

console.log('\nE2E CSV Parser Tests\n');

const csv = fs.readFileSync(fixturePath, 'utf8');
const parsed = parseCSV(csv);

assert.deepEqual(parsed, [
  ['id', 'customer', 'total'],
  ['1001', 'Ada Lovelace', '42.50'],
  ['1002', 'Grace Hopper', '19.99'],
]);

console.log('  OK parses the sample orders fixture from disk');
console.log('\nE2E Results: 1 passed, 0 failed\n');
