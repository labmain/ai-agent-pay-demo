const { parseCSV } = require('../src/parser');

const fixtures = [
  {
    name: 'ASCII comma export',
    input: 'name,age,city\nAlice,31,Toronto\nBob,28,Vancouver',
    expected: [
      ['name', 'age', 'city'],
      ['Alice', '31', 'Toronto'],
      ['Bob', '28', 'Vancouver'],
    ],
  },
  {
    name: 'Chinese full-width comma export',
    input: 'name，age，city\nTristan，22，Toronto',
    expected: [
      ['name', 'age', 'city'],
      ['Tristan', '22', 'Toronto'],
    ],
  },
  {
    name: 'mixed comma export with whitespace',
    input: 'name, age， city\nMing, 40， Markham',
    expected: [
      ['name', 'age', 'city'],
      ['Ming', '40', 'Markham'],
    ],
  },
];

let passed = 0;
let failed = 0;

function assertFixture(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  OK ${name}`);
    passed++;
  } else {
    console.log(`  FAIL ${name}`);
    console.log(`     Expected: ${e}`);
    console.log(`     Actual:   ${a}`);
    failed++;
  }
}

console.log('\nParser E2E fixture tests\n');

for (const fixture of fixtures) {
  assertFixture(fixture.name, parseCSV(fixture.input), fixture.expected);
}

let rejectedEmptyInput = false;
try {
  parseCSV('');
} catch (error) {
  rejectedEmptyInput = /non-empty string/.test(error.message);
}
assertFixture('rejects empty export input', rejectedEmptyInput, true);

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
