const { parseAPIResponse, parseCSV } = require('../src/parser');

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    console.log(`     Expected: ${e}`);
    console.log(`     Actual:   ${a}`);
    failed++;
  }
}

console.log('\n📋 CSV Parser Tests\n');

// Test 1: Basic CSV with ASCII commas
assert(
  'parses basic CSV with ASCII commas',
  parseCSV('a,b,c\n1,2,3'),
  [['a', 'b', 'c'], ['1', '2', '3']]
);

// Test 2: Whitespace trimming
assert(
  'trims whitespace',
  parseCSV('a , b , c'),
  [['a', 'b', 'c']]
);

// Test 3: Single row
assert(
  'handles single row',
  parseCSV('hello,world'),
  [['hello', 'world']]
);

// Test 4: Chinese full-width commas (U+FF0C) — THE BUG FIX
assert(
  'parses CSV with Chinese full-width commas',
  parseCSV('名字，年龄，城市\n张三，25，北京'),
  [['名字', '年龄', '城市'], ['张三', '25', '北京']]
);

// Test 5: Mixed ASCII and full-width commas
assert(
  'handles mixed comma types',
  parseCSV('a,b，c'),
  [['a', 'b', 'c']]
);

// Test 6: Regression - empty input throws
let threwError = false;
try { parseCSV(''); } catch (e) { threwError = true; }
assert('throws on empty input', threwError, true);

// Test 7: Empty API responses show a friendly error instead of throwing
let errorToast = '';
assert(
  'handles empty API response body with a friendly error',
  parseAPIResponse(undefined, message => { errorToast = message; }),
  []
);
assert(
  'reports friendly empty response error',
  errorToast,
  'No CSV data was returned. Please try again later.'
);

// Test 8: Non-empty API responses still parse as CSV
assert(
  'parses non-empty API response body',
  parseAPIResponse('name,age\nAda,36'),
  [['name', 'age'], ['Ada', '36']]
);

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
