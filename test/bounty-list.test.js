const assert = require('assert');
const {
  DEFAULT_ERROR_MESSAGE,
  loadBountyList,
  normalizeBounties,
  renderBounties,
} = require('../src/bounty-list');

function createContainer() {
  const attributes = {};

  return {
    attributes,
    innerHTML: '',
    setAttribute(name, value) {
      attributes[name] = value;
    },
    removeAttribute(name) {
      delete attributes[name];
    },
  };
}

async function testShowsSpinnerWhileLoading() {
  const container = createContainer();
  let resolveFetch;
  const pendingFetch = new Promise((resolve) => {
    resolveFetch = resolve;
  });

  const resultPromise = loadBountyList(container, () => pendingFetch);

  assert.equal(container.attributes['aria-busy'], 'true');
  assert.equal(container.attributes['data-state'], 'loading');
  assert.match(container.innerHTML, /role="status"/);
  assert.match(container.innerHTML, /Loading bounties/);

  resolveFetch([{ title: 'Fix parser bug', amount: '$50' }]);
  const result = await resultPromise;

  assert.equal(result.status, 'loaded');
  assert.equal(container.attributes['aria-busy'], 'false');
  assert.equal(container.attributes['data-state'], 'loaded');
  assert.doesNotMatch(container.innerHTML, /bounty-list-spinner/);
  assert.match(container.innerHTML, /Fix parser bug/);
}

async function testHandlesErrorGracefully() {
  const container = createContainer();
  const result = await loadBountyList(container, async () => {
    throw new Error('database exploded');
  });

  assert.equal(result.status, 'error');
  assert.equal(container.attributes['aria-busy'], 'false');
  assert.equal(container.attributes['data-state'], 'error');
  assert.match(container.innerHTML, /role="alert"/);
  assert.match(container.innerHTML, new RegExp(DEFAULT_ERROR_MESSAGE));
  assert.doesNotMatch(container.innerHTML, /database exploded/);
}

async function testHandlesEmptyResponses() {
  const container = createContainer();
  const result = await loadBountyList(container, async () => null);

  assert.equal(result.status, 'loaded');
  assert.deepEqual(result.bounties, []);
  assert.equal(container.attributes['data-state'], 'empty');
  assert.match(container.innerHTML, /No bounties available/);
}

function testNormalizesSupportedResponseShapes() {
  assert.deepEqual(normalizeBounties([{ title: 'One' }]), [{ title: 'One' }]);
  assert.deepEqual(normalizeBounties({ bounties: [{ title: 'Two' }] }), [
    { title: 'Two' },
  ]);
}

function testEscapesRenderedBountyContent() {
  const html = renderBounties([
    { title: '<script>alert(1)</script>', amount: '"$50"' },
  ]);

  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&quot;\$50&quot;/);
  assert.doesNotMatch(html, /<script>/);
}

async function run() {
  await testShowsSpinnerWhileLoading();
  await testHandlesErrorGracefully();
  await testHandlesEmptyResponses();
  testNormalizesSupportedResponseShapes();
  testEscapesRenderedBountyContent();

  console.log('bounty-list tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
