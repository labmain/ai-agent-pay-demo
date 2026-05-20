const {
  VERIFICATION_CODE,
  normalizeVerificationInput,
  matchesVerificationCode,
} = require('../src/verification-code');

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

console.log('\nVerification Code Tests\n');

assert('documents the issue #37 verification code', VERIFICATION_CODE, '123');
assert('accepts the expected verification code', matchesVerificationCode('123'), true);
assert('trims whitespace around manual input', matchesVerificationCode(' 123 '), true);
assert('rejects an incorrect code', matchesVerificationCode('124'), false);
assert('rejects missing input', matchesVerificationCode(undefined), false);
assert('normalizes null to an empty string', normalizeVerificationInput(null), '');

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
