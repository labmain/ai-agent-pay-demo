const MANUAL_VERIFICATION_CODE = '2323';

function normalizeVerificationCode(value) {
  return String(value ?? '').trim();
}

function verifyManualCode(value) {
  return normalizeVerificationCode(value) === MANUAL_VERIFICATION_CODE;
}

module.exports = {
  MANUAL_VERIFICATION_CODE,
  normalizeVerificationCode,
  verifyManualCode,
};
