const {
  DEFAULT_ERROR_MESSAGE,
  createLoadingState,
  loadBounties,
  renderBountyList,
  updateBountyList,
} = require('../src/loading-spinner');

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

function defer() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function run() {
  console.log('\nLoading Spinner Tests\n');

  const state = createLoadingState();
  const pending = loadBounties(() => Promise.resolve([{ title: 'Fix parser' }]), state);
  assert('sets loading while API call is pending', state.isLoading, true);
  await pending;
  assert('clears loading after API call completes', state.isLoading, false);
  assert('stores loaded bounties', state.bounties, [{ title: 'Fix parser' }]);

  const loadingMarkup = renderBountyList({ isLoading: true, error: null, bounties: [] });
  assert('renders accessible loading status', loadingMarkup.includes('role="status"'), true);
  assert('renders spinner class while loading', loadingMarkup.includes('loading-spinner'), true);

  const errorState = await loadBounties(() => Promise.reject(new Error('internal host 10.0.0.5 failed')));
  assert('clears loading after failed API call', errorState.isLoading, false);
  assert('stores safe default error message', errorState.error, DEFAULT_ERROR_MESSAGE);
  assert('renders error alert', renderBountyList(errorState).includes('role="alert"'), true);

  const safeError = new Error('internal detail');
  safeError.userMessage = 'Could not refresh bounty list.';
  const safeErrorState = await loadBounties(() => Promise.reject(safeError));
  assert('allows explicit user-facing errors', safeErrorState.error, 'Could not refresh bounty list.');

  const staleState = createLoadingState();
  const slow = defer();
  const first = loadBounties(() => slow.promise, staleState);
  const second = await loadBounties(() => Promise.resolve([{ title: 'New result' }]), staleState);
  slow.resolve([{ title: 'Stale result' }]);
  await first;
  assert('keeps latest result when requests overlap', second.bounties, [{ title: 'New result' }]);

  const markup = renderBountyList({
    isLoading: false,
    error: null,
    bounties: [{ title: '<script>alert(1)</script>' }],
  });
  assert('escapes bounty titles', markup.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), true);

  const emptyMarkup = renderBountyList({ isLoading: false, error: null, bounties: [] });
  assert('renders empty state', emptyMarkup.includes('No bounties available.'), true);

  const container = { innerHTML: '' };
  await updateBountyList(container, () => Promise.resolve([{ title: 'Integrated render' }]));
  assert('updates a container with final bounty markup', container.innerHTML.includes('Integrated render'), true);

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
