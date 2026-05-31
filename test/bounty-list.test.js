const {
  createBountyListController,
  createLoadingSpinnerMarkup,
} = require('../src/bounty-list');

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  OK ${name}`);
    passed++;
  } else {
    console.log(`  FAIL ${name}`);
    failed++;
  }
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

async function testShowsSpinnerDuringLoad() {
  const calls = [];
  const deferred = createDeferred();
  const controller = createBountyListController({
    fetchBounties: () => deferred.promise,
    renderItems: (items) => calls.push(['renderItems', items]),
    renderError: (message) => calls.push(['renderError', message]),
    showLoading: () => calls.push(['showLoading']),
    hideLoading: () => calls.push(['hideLoading']),
  });

  const loading = controller.loadBounties();
  assert('shows spinner before data resolves', calls[0][0] === 'showLoading');
  assert('spinner remains visible while request is pending', calls.length === 1);

  deferred.resolve([{ id: 18, title: 'Loading spinner', reward: 50 }]);
  const result = await loading;

  assert('returns loaded bounties', result.ok && result.bounties.length === 1);
  assert('renders items after successful fetch', calls[1][0] === 'renderItems');
  assert('hides spinner after data loads', calls[calls.length - 1][0] === 'hideLoading');
}

async function testHidesSpinnerAndRendersError() {
  const calls = [];
  const controller = createBountyListController({
    fetchBounties: async () => {
      throw new Error('Network unavailable');
    },
    renderItems: (items) => calls.push(['renderItems', items]),
    renderError: (message) => calls.push(['renderError', message]),
    showLoading: () => calls.push(['showLoading']),
    hideLoading: () => calls.push(['hideLoading']),
  });

  const result = await controller.loadBounties();

  assert('returns failed result for fetch errors', result.ok === false);
  assert('renders friendly error state', calls.some(([name]) => name === 'renderError'));
  assert('hides spinner after failed fetch', calls[calls.length - 1][0] === 'hideLoading');
}

function testSpinnerMarkupIsAccessible() {
  const markup = createLoadingSpinnerMarkup();

  assert('spinner exposes status role', markup.includes('role="status"'));
  assert('spinner announces loading text politely', markup.includes('aria-live="polite"'));
}

(async () => {
  console.log('\nBounty list loading tests\n');

  await testShowsSpinnerDuringLoad();
  await testHidesSpinnerAndRendersError();
  testSpinnerMarkupIsAccessible();

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
