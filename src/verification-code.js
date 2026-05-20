const VERIFICATION_CODE = '123';

function normalizeVerificationInput(value) {
  return String(value ?? '').trim();
}

function matchesVerificationCode(value) {
  return normalizeVerificationInput(value) === VERIFICATION_CODE;
}

module.exports = {
  VERIFICATION_CODE,
  normalizeVerificationInput,
  matchesVerificationCode,
};
