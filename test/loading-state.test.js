const assert = require('node:assert/strict');
const { createSpinnerMarkup, loadBountyList } = require('../src/loading-state');

async function run() {
  console.log('\nLoading State Tests\n');

  assert.match(createSpinnerMarkup(), /role="status"/);
  assert.match(createSpinnerMarkup(), /Loading bounties/);
  console.log('  OK creates accessible spinner markup');

  const successEvents = [];
  const loaded = await loadBountyList({
    fetchBounties: async () => [{ id: 1, title: 'Fix parser' }],
    renderLoading: (markup) => successEvents.push(['loading', markup]),
    renderItems: (items) => successEvents.push(['items', items.length]),
  });
  assert.equal(loaded.status, 'loaded');
  assert.deepEqual(successEvents.map(([name]) => name), ['loading', 'items']);
  console.log('  OK renders loading then loaded state');

  const emptyEvents = [];
  const empty = await loadBountyList({
    fetchBounties: async () => [],
    renderLoading: () => emptyEvents.push('loading'),
    renderEmpty: () => emptyEvents.push('empty'),
  });
  assert.equal(empty.status, 'empty');
  assert.deepEqual(emptyEvents, ['loading', 'empty']);
  console.log('  OK renders empty state');

  const errorEvents = [];
  const failed = await loadBountyList({
    fetchBounties: async () => {
      throw new Error('Network failed');
    },
    renderLoading: () => errorEvents.push('loading'),
    renderError: (error) => errorEvents.push(error.message),
  });
  assert.equal(failed.status, 'error');
  assert.deepEqual(errorEvents, ['loading', 'Network failed']);
  console.log('  OK renders error state gracefully');

  console.log('\nLoading State Results: 4 passed, 0 failed\n');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
