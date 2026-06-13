const {
  createErrorState,
  createLoadingState,
  createSuccessState,
  loadBounties,
  renderBountyListState,
} = require('../src/bounty-list-state');

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

async function run() {
  console.log('\n⏳ Bounty List State Tests\n');

  assert('loading state shows spinner', createLoadingState(), {
    status: 'loading',
    showSpinner: true,
    items: [],
    message: 'Loading bounties...',
    error: null,
  });

  assert('success state hides spinner', createSuccessState([{ id: 1 }]), {
    status: 'ready',
    showSpinner: false,
    items: [{ id: 1 }],
    message: '',
    error: null,
  });

  assert('error state hides spinner and shows friendly message', createErrorState(new Error('Network down')), {
    status: 'error',
    showSpinner: false,
    items: [],
    message: 'Network down',
    error: 'Network down',
  });

  const states = [];
  const finalState = await loadBounties(
    async () => [{ id: 'bounty-1', title: 'Fix parser' }],
    (state) => states.push(state.status)
  );

  assert('loadBounties emits loading then ready', states, ['loading', 'ready']);
  assert('loadBounties returns ready state', finalState.status, 'ready');

  const errorStates = [];
  const errorState = await loadBounties(
    async () => {
      throw new Error('API unavailable');
    },
    (state) => errorStates.push(state.status)
  );

  assert('loadBounties emits loading then error', errorStates, ['loading', 'error']);
  assert('loadBounties returns error message', errorState.message, 'API unavailable');

  assert('render loading state as status spinner', renderBountyListState(createLoadingState()), {
    role: 'status',
    text: 'Loading bounties...',
    spinner: true,
  });

  assert('render error state as alert', renderBountyListState(errorState), {
    role: 'alert',
    text: 'API unavailable',
    spinner: false,
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
