/**
 * Manual Verification Test for Issue #37
 * Verifies core functionality: parser and settings-validator
 * 
 * This file serves as a manual verification checkpoint.
 */

import { validateSettings, isFormValid, SettingsFormData } from './settings-validator';
import { safeParseResponse, handleApiError } from './api-client';

type TestResult = { passed: boolean; name: string; message?: string };

function runTest(name: string, fn: () => boolean, message?: string): TestResult {
  try {
    const result = fn();
    return { passed: result, name, message: result ? undefined : (message || 'Assertion failed') };
  } catch (e) {
    return { passed: false, name, message: String(e) };
  }
}

const tests: TestResult[] = [];

// --- Parser / safeParseResponse verification ---

tests.push(runTest(
  'safeParseResponse handles null gracefully',
  () => {
    const r = safeParseResponse(null, 'user record');
    return r.success === false && r.error.message.includes('null or undefined');
  }
));

tests.push(runTest(
  'safeParseResponse handles undefined gracefully',
  () => {
    const r = safeParseResponse<string>(undefined, 'config');
    return r.success === false && r.error.message.includes('Empty config');
  }
));

tests.push(runTest(
  'safeParseResponse accepts valid values (0, empty string)',
  () => {
    const r0 = safeParseResponse(0, 'count');
    const re = safeParseResponse('', 'name');
    return r0.success === true && re.success === true;
  }
));

tests.push(runTest(
  'handleApiError wraps generic errors',
  () => {
    const r = handleApiError(new Error('timeout'), 'fetch');
    return r.success === false && r.error.message.includes('timeout');
  }
));

// --- Settings validator verification ---

const validForm: SettingsFormData = {
  displayName: 'Test User',
  email: 'test@example.com',
  walletAddress: '0x' + 'a'.repeat(40),
  paymentLimit: 500,
};

tests.push(runTest(
  'validateSettings accepts valid data',
  () => validateSettings(validForm).length === 0
));

tests.push(runTest(
  'validateSettings rejects null displayName',
  () => {
    const errors = validateSettings({ ...validForm, displayName: '' });
    return errors.some(e => e.field === 'displayName');
  }
));

tests.push(runTest(
  'validateSettings rejects invalid email',
  () => {
    const errors = validateSettings({ ...validForm, email: 'not-an-email' });
    return errors.some(e => e.field === 'email');
  }
));

tests.push(runTest(
  'validateSettings rejects invalid wallet address',
  () => {
    const errors = validateSettings({ ...validForm, walletAddress: 'invalid' });
    return errors.some(e => e.field === 'walletAddress');
  }
));

tests.push(runTest(
  'validateSettings rejects negative payment limit',
  () => {
    const errors = validateSettings({ ...validForm, paymentLimit: -1 });
    return errors.some(e => e.field === 'paymentLimit');
  }
));

tests.push(runTest(
  'isFormValid returns true for valid form',
  () => isFormValid(validForm) === true
));

tests.push(runTest(
  'isFormValid returns false for invalid form',
  () => isFormValid({ ...validForm, email: '' }) === false
));

// --- Print results ---

const passed = tests.filter(t => t.passed).length;
const failed = tests.filter(t => !t.passed).length;

console.log('\n=== Manual Verification Test - Issue #37 ===\n');
tests.forEach(t => {
  if (t.passed) {
    console.log(`  PASS  ${t.name}`);
  } else {
    console.log(`  FAIL  ${t.name}${t.message ? ': ' + t.message : ''}`);
  }
});
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
