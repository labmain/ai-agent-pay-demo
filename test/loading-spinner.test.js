const { LoadingSpinner } = require('../src/loading-spinner');

// Mock DOM environment for Node.js testing
if (typeof document === 'undefined') {
  const mockElement = {
    id: '',
    style: { display: 'none' },
    innerHTML: '',
    appendChild: () => {},
    querySelector: () => null
  };
  global.document = {
    getElementById: () => null,
    createElement: (tag) => ({ ...mockElement }),
    body: mockElement
  };
}

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

console.log('\n📋 Loading Spinner Tests\n');

// Test 1: Initial state is idle
const spinner1 = new LoadingSpinner();
assert(
  'initial state is idle',
  spinner1.getState(),
  'idle'
);

// Test 2: Initial error is null
assert(
  'initial error is null',
  spinner1.getError(),
  null
);

// Test 3: Custom options work
const spinner2 = new LoadingSpinner({ containerId: 'custom-id', spinnerClass: 'custom-spinner' });
assert(
  'custom container ID is set',
  spinner2.containerId,
  'custom-id'
);
assert(
  'custom spinner class is set',
  spinner2.spinnerClass,
  'custom-spinner'
);

// Test 4: State transitions work correctly
const spinner3 = new LoadingSpinner();
spinner3.showLoading();
assert(
  'showLoading sets state to loading',
  spinner3.getState(),
  'loading'
);

spinner3.hide();
assert(
  'hide sets state to success',
  spinner3.getState(),
  'success'
);

// Test 5: Error state works
const spinner4 = new LoadingSpinner();
spinner4.showError('Test error message');
assert(
  'showError sets state to error',
  spinner4.getState(),
  'error'
);
assert(
  'showError stores error message',
  spinner4.getError(),
  'Test error message'
);

// Test 6: Reset works
const spinner5 = new LoadingSpinner();
spinner5.showError('Error to reset');
spinner5.reset();
assert(
  'reset sets state back to idle',
  spinner5.getState(),
  'idle'
);
assert(
  'reset clears error message',
  spinner5.getError(),
  null
);

// Test 7: wrapApiCall success case
const spinner6 = new LoadingSpinner();
spinner6.createElement = function() {}; // Mock createElement

const successApiCall = async () => {
  return { data: 'test data' };
};

spinner6.showLoading = function() {
  this.state = 'loading';
};
spinner6.hide = function() {
  this.state = 'success';
};

(async () => {
  try {
    const result = await spinner6.wrapApiCall(successApiCall);
    assert(
      'wrapApiCall returns result on success',
      result,
      { data: 'test data' }
    );
    assert(
      'wrapApiCall calls hide on success',
      spinner6.getState(),
      'success'
    );
  } catch (e) {
    failed++;
    console.log(`  ❌ wrapApiCall should not throw on success`);
  }

  // Test 8: wrapApiCall error case
  const spinner7 = new LoadingSpinner();
  spinner7.createElement = function() {};
  spinner7.showLoading = function() {
    this.state = 'loading';
  };
  spinner7.showError = function(msg) {
    this.state = 'error';
    this.errorMessage = msg;
  };

  const failingApiCall = async () => {
    throw new Error('API failed');
  };

  try {
    await spinner7.wrapApiCall(failingApiCall);
    failed++;
    console.log(`  ❌ wrapApiCall should throw on failure`);
  } catch (e) {
    assert(
      'wrapApiCall sets error state on failure',
      spinner7.getState(),
      'error'
    );
    assert(
      'wrapApiCall stores error message on failure',
      spinner7.getError(),
      'API failed'
    );
  }

  // Test 9: Default error message when none provided
  const spinner8 = new LoadingSpinner();
  spinner8.showError();
  assert(
    'showError uses default message when none provided',
    spinner8.getError(),
    'An error occurred'
  );

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
