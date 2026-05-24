const {
  createSpinnerMarkup,
  createErrorMarkup,
  loadBountiesWithState,
  escapeHtml,
} = require('../src/bounty-loading');

let passed = 0;
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    if (detail) console.log(`     ${detail}`);
    failed++;
  }
}

function createContainer() {
  return { innerHTML: '', dataset: {} };
}

async function run() {
  console.log('\n📋 Bounty Loading State Tests\n');

  const spinner = createSpinnerMarkup('Loading test');
  assert('spinner has accessible status role', spinner.includes('role="status"'));
  assert('spinner announces loading text', spinner.includes('Loading test'));

  const escaped = escapeHtml('<script>alert("x")</script>');
  assert('escapeHtml escapes dangerous markup', !escaped.includes('<script>') && escaped.includes('&lt;script&gt;'));

  const error = createErrorMarkup('Bad <thing>');
  assert('error has alert role', error.includes('role="alert"'));
  assert('error message is escaped', error.includes('Bad &lt;thing&gt;'));

  const loadedContainer = createContainer();
  const loaded = await loadBountiesWithState({
    container: loadedContainer,
    fetchBounties: async () => [{ id: 1, title: 'Fix loading' }],
    renderBounties: (items) => `<ul>${items.map((item) => `<li>${item.title}</li>`).join('')}</ul>`,
  });
  assert('loaded bounties are returned', loaded.length === 1);
  assert('spinner disappears after successful load', !loadedContainer.innerHTML.includes('bounty-spinner'));
  assert('loaded state is recorded', loadedContainer.dataset.state === 'loaded');
  assert('rendered bounty appears', loadedContainer.innerHTML.includes('Fix loading'));

  const emptyContainer = createContainer();
  await loadBountiesWithState({
    container: emptyContainer,
    fetchBounties: async () => [],
    renderBounties: () => '<ul></ul>',
  });
  assert('empty state is recorded', emptyContainer.dataset.state === 'empty');
  assert('empty state renders helpful message', emptyContainer.innerHTML.includes('No bounties found'));

  const errorContainer = createContainer();
  const failedResult = await loadBountiesWithState({
    container: errorContainer,
    fetchBounties: async () => { throw new Error('API offline'); },
    renderBounties: () => '<ul></ul>',
  });
  assert('failed fetch returns empty array', Array.isArray(failedResult) && failedResult.length === 0);
  assert('error state is recorded', errorContainer.dataset.state === 'error');
  assert('error state renders gracefully', errorContainer.innerHTML.includes('API offline'));

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
