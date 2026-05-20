const DEFAULT_LOADING_LABEL = 'Loading bounties...';

function createElement(documentRef, tagName, attributes = {}, children = []) {
  const element = documentRef.createElement(tagName);

  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) continue;

    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  }

  for (const child of children) {
    element.appendChild(
      typeof child === 'string' ? documentRef.createTextNode(child) : child
    );
  }

  return element;
}

function renderLoadingState(container, options = {}) {
  const documentRef = container.ownerDocument;
  const label = options.loadingLabel || DEFAULT_LOADING_LABEL;

  container.replaceChildren(
    createElement(documentRef, 'div', {
      className: 'bounty-list__loading',
      role: 'status',
      'aria-live': 'polite',
      'aria-busy': 'true',
    }, [
      createElement(documentRef, 'span', {
        className: 'bounty-list__spinner',
        'aria-hidden': 'true',
      }),
      createElement(documentRef, 'span', {
        className: 'bounty-list__loading-label',
        textContent: label,
      }),
    ])
  );
}

function renderErrorState(container, error, retry) {
  const documentRef = container.ownerDocument;
  const message = error && error.message ? error.message : 'Unable to load bounties.';
  const children = [
    createElement(documentRef, 'p', {
      className: 'bounty-list__error-message',
      textContent: message,
    }),
  ];

  if (typeof retry === 'function') {
    const retryButton = createElement(documentRef, 'button', {
      className: 'bounty-list__retry',
      type: 'button',
      textContent: 'Try again',
    });
    retryButton.addEventListener('click', retry);
    children.push(retryButton);
  }

  container.replaceChildren(
    createElement(documentRef, 'div', {
      className: 'bounty-list__error',
      role: 'alert',
    }, children)
  );
}

function renderBounties(container, bounties) {
  const documentRef = container.ownerDocument;

  if (!Array.isArray(bounties) || bounties.length === 0) {
    container.replaceChildren(
      createElement(documentRef, 'p', {
        className: 'bounty-list__empty',
        textContent: 'No bounties available.',
      })
    );
    return;
  }

  const items = bounties.map((bounty) =>
    createElement(documentRef, 'li', { className: 'bounty-list__item' }, [
      createElement(documentRef, 'span', {
        className: 'bounty-list__title',
        textContent: bounty.title || 'Untitled bounty',
      }),
      createElement(documentRef, 'span', {
        className: 'bounty-list__amount',
        textContent: bounty.amount ? String(bounty.amount) : 'Unpriced',
      }),
    ])
  );

  container.replaceChildren(
    createElement(documentRef, 'ul', { className: 'bounty-list' }, items)
  );
}

async function loadBountyList(container, fetchBounties, options = {}) {
  if (!container || !container.ownerDocument) {
    throw new Error('A DOM container is required');
  }

  if (typeof fetchBounties !== 'function') {
    throw new Error('fetchBounties must be a function');
  }

  renderLoadingState(container, options);

  try {
    const bounties = await fetchBounties();
    renderBounties(container, bounties);
    return bounties;
  } catch (error) {
    renderErrorState(container, error, () => loadBountyList(container, fetchBounties, options));
    return null;
  }
}

module.exports = {
  loadBountyList,
  renderBounties,
  renderErrorState,
  renderLoadingState,
};
