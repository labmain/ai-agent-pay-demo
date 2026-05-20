const {
  MANUAL_VERIFICATION_CODE,
  normalizeVerificationCode,
  verifyManualCode,
} = require('../src/manual-verification');

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
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

console.log('\nManual Verification Tests\n');

assert('documents the issue #40 verification code', MANUAL_VERIFICATION_CODE, '2323');
assert('accepts the expected verification code', verifyManualCode('2323'), true);
assert('trims whitespace around manual input', verifyManualCode(' 2323 '), true);
assert('rejects an incorrect code', verifyManualCode('2324'), false);
assert('rejects missing input', verifyManualCode(undefined), false);
assert('normalizes null to an empty string', normalizeVerificationCode(null), '');

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
