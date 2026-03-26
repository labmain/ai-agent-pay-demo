const { parseCSV } = require('../src/parser');

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

// Test 1: Basic CSV
assert(
  'parses basic CSV',
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

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
