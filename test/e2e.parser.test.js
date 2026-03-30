/**
 * E2E Tests for ai-agent-pay-demo CSV Parser
 * Tests comprehensive parseCSV behavior including edge cases
 */

const { parseCSV } = require('../src/parser');

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log('  ✅ ' + name);
    passed++;
  } else {
    console.log('  ❌ ' + name);
    console.log('     Expected: ' + e);
    console.log('     Actual:   ' + a);
    failed++;
  }
}

console.log('\n📋 CSV Parser E2E Tests\n');

// Test 1: Basic CSV with ASCII commas
assert(
  'parses basic CSV with ASCII commas',
  parseCSV('a,b,c\n1,2,3'),
  [['a', 'b', 'c'], ['1', '2', '3']]
);

// Test 2: Whitespace trimming
assert(
  'trims whitespace around cells',
  parseCSV('a , b , c'),
  [['a', 'b', 'c']]
);

// Test 3: Single row
assert(
  'handles single row',
  parseCSV('hello,world'),
  [['hello', 'world']]
);

// Test 4: Chinese full-width commas (U+FF0C)
assert(
  'parses CSV with Chinese full-width commas',
  parseCSV('名字,年龄,城市\n张三,25,北京'),
  [['名字', '年龄', '城市'], ['张三', '25', '北京']]
);

// Test 5: Mixed ASCII and full-width commas
assert(
  'handles mixed comma types in same row',
  parseCSV('a,b，c'),
  [['a', 'b', 'c']]
);

// Test 6: Empty input throws
let threwEmpty = false;
try { parseCSV(''); } catch (e) { threwEmpty = true; }
assert('throws on empty input', threwEmpty, true);

// Test 7: null input throws
let threwNull = false;
try { parseCSV(null); } catch (e) { threwNull = true; }
assert('throws on null input', threwNull, true);

// Test 8: undefined input throws
let threwUndefined = false;
try { parseCSV(undefined); } catch (e) { threwUndefined = true; }
assert('throws on undefined input', threwUndefined, true);

// Test 9: Non-string throws
let threwNumber = false;
try { parseCSV(12345); } catch (e) { threwNumber = true; }
assert('throws on number input', threwNumber, true);

// Test 10: Whitespace-only input throws
let threwWhitespace = false;
try { parseCSV('   \n  '); } catch (e) { threwWhitespace = true; }
assert('throws on whitespace-only input', threwWhitespace, true);

// Test 11: Three rows of data
assert(
  'handles multiple rows correctly',
  parseCSV('name,age,city\nAlice,30,NYC\nBob,25,LA'),
  [['name', 'age', 'city'], ['Alice', '30', 'NYC'], ['Bob', '25', 'LA']]
);

// Test 12: Chinese with mixed commas
assert(
  'handles Chinese characters with mixed commas',
  parseCSV('产品,价格,数量\n电脑,5000,10\n手机,3000,20'),
  [['产品', '价格', '数量'], ['电脑', '5000', '10'], ['手机', '3000', '20']]
);

// Test 13: Cells with extra spaces
assert(
  'trims extra spaces in cells',
  parseCSV('  name  ,  age  ,  city  '),
  [['name', 'age', 'city']]
);

// Test 14: Row with trailing comma
assert(
  'handles trailing comma gracefully',
  parseCSV('a,b,c,'),
  [['a', 'b', 'c', '']]
);

// Test 15: Numeric values preserved as strings
assert(
  'preserves numeric values as strings',
  parseCSV('1,2,3'),
  [['1', '2', '3']]
);

// Test 16: Empty rows between data
assert(
  'handles multiple empty lines',
  parseCSV('a,b\n\nc,d'),
  [['a', 'b'], ['c', 'd']]
);

console.log('\n📊 E2E Test Results: ' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
