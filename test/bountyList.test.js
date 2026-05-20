const {
  loadBountyList,
  renderBounties,
  renderErrorState,
  renderLoadingState,
} = require('../src/bountyList');

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

class FakeNode {
  constructor(ownerDocument) {
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.textContent = '';
    this.className = '';
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(key, value) {
    this.attributes[key] = String(value);
  }

  addEventListener(type, callback) {
    this.listeners[type] = callback;
  }

  click() {
    if (this.listeners.click) {
      this.listeners.click();
    }
  }

  getAttribute(key) {
    return this.attributes[key];
  }
}

class FakeTextNode {
  constructor(text) {
    this.textContent = text;
  }
}

class FakeDocument {
  createElement() {
    return new FakeNode(this);
  }

  createTextNode(text) {
    return new FakeTextNode(text);
  }
}

function createContainer() {
  return new FakeNode(new FakeDocument());
}

function findByClass(node, className) {
  if (!node) return null;
  if (node.className === className) return node;

  for (const child of node.children || []) {
    const result = findByClass(child, className);
    if (result) return result;
  }

  return null;
}

function allByClass(node, className, results = []) {
  if (!node) return results;
  if (node.className === className) results.push(node);

  for (const child of node.children || []) {
    allByClass(child, className, results);
  }

  return results;
}

(async () => {
  console.log('\nBounty List Tests\n');

  const loadingContainer = createContainer();
  renderLoadingState(loadingContainer);
  const loadingRoot = loadingContainer.children[0];
  assert('loading state renders status role', loadingRoot.getAttribute('role') === 'status');
  assert('loading state marks busy content', loadingRoot.getAttribute('aria-busy') === 'true');
  assert('loading state includes spinner', Boolean(findByClass(loadingRoot, 'bounty-list__spinner')));

  const loadedContainer = createContainer();
  renderBounties(loadedContainer, [
    { title: 'Fix spinner', amount: '$50' },
    { title: 'Add skeleton', amount: '$75' },
  ]);
  assert('loaded state renders list items', allByClass(loadedContainer, 'bounty-list__item').length === 2);
  assert('loaded state includes amount text', findByClass(loadedContainer, 'bounty-list__amount').textContent === '$50');

  const emptyContainer = createContainer();
  renderBounties(emptyContainer, []);
  assert('empty state renders fallback copy', findByClass(emptyContainer, 'bounty-list__empty').textContent === 'No bounties available.');

  let retryCount = 0;
  const errorContainer = createContainer();
  renderErrorState(errorContainer, new Error('Network down'), () => retryCount++);
  assert('error state renders alert role', errorContainer.children[0].getAttribute('role') === 'alert');
  assert('error state shows error message', findByClass(errorContainer, 'bounty-list__error-message').textContent === 'Network down');
  findByClass(errorContainer, 'bounty-list__retry').click();
  assert('error retry button calls callback', retryCount === 1);

  const asyncContainer = createContainer();
  let resolveFetch;
  const fetchPromise = new Promise((resolve) => {
    resolveFetch = resolve;
  });
  const loadPromise = loadBountyList(asyncContainer, () => fetchPromise);
  assert('async loader immediately shows spinner', Boolean(findByClass(asyncContainer, 'bounty-list__spinner')));
  resolveFetch([{ title: 'Async bounty', amount: '$50' }]);
  const result = await loadPromise;
  assert('async loader returns fetched bounties', result.length === 1);
  assert('async loader swaps spinner for data', Boolean(findByClass(asyncContainer, 'bounty-list__title')));

  const failingContainer = createContainer();
  const failingResult = await loadBountyList(failingContainer, () => Promise.reject(new Error('API failed')));
  assert('failing loader returns null', failingResult === null);
  assert('failing loader renders retry action', Boolean(findByClass(failingContainer, 'bounty-list__retry')));

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
