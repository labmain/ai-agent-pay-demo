const DEFAULT_ERROR_MESSAGE = 'Unable to load bounties. Please try again.';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLoading(message = 'Loading bounties...') {
  return [
    '<div class="bounty-list-loading" role="status" aria-live="polite">',
    '  <span class="bounty-list-spinner" aria-hidden="true"></span>',
    `  <span>${escapeHtml(message)}</span>`,
    '</div>',
  ].join('');
}

function renderError(message = DEFAULT_ERROR_MESSAGE) {
  return [
    '<div class="bounty-list-error" role="alert">',
    `  ${escapeHtml(message)}`,
    '</div>',
  ].join('');
}

function renderEmpty(message = 'No bounties available.') {
  return `<div class="bounty-list-empty">${escapeHtml(message)}</div>`;
}

function normalizeBounties(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.bounties)) {
    return response.bounties;
  }

  if (response == null) {
    return [];
  }

  throw new TypeError('Bounty API response must be an array or { bounties: [] }.');
}

function renderBounties(bounties) {
  if (!bounties.length) {
    return renderEmpty();
  }

  const items = bounties
    .map((bounty) => {
      const title = bounty.title || bounty.name || 'Untitled bounty';
      const amount = bounty.amount || bounty.reward || '';
      const amountMarkup = amount
        ? `<span class="bounty-list-item-amount">${escapeHtml(amount)}</span>`
        : '';

      return [
        '<li class="bounty-list-item">',
        `  <span class="bounty-list-item-title">${escapeHtml(title)}</span>`,
        `  ${amountMarkup}`,
        '</li>',
      ].join('');
    })
    .join('');

  return `<ul class="bounty-list-items">${items}</ul>`;
}

async function loadBountyList(container, fetchBounties, options = {}) {
  if (!container || typeof container !== 'object') {
    throw new TypeError('A bounty list container is required.');
  }

  if (typeof fetchBounties !== 'function') {
    throw new TypeError('fetchBounties must be a function.');
  }

  const setAttribute = container.setAttribute?.bind(container);
  const removeAttribute = container.removeAttribute?.bind(container);

  setAttribute?.('aria-busy', 'true');
  setAttribute?.('data-state', 'loading');
  container.innerHTML = renderLoading(options.loadingMessage);

  try {
    const response = await fetchBounties();
    const bounties = normalizeBounties(response);

    setAttribute?.('data-state', bounties.length ? 'loaded' : 'empty');
    container.innerHTML = renderBounties(bounties);

    return { status: 'loaded', bounties };
  } catch (error) {
    setAttribute?.('data-state', 'error');
    container.innerHTML = renderError(options.errorMessage);

    return { status: 'error', error };
  } finally {
    setAttribute?.('aria-busy', 'false');
    removeAttribute?.('aria-describedby');
  }
}

module.exports = {
  DEFAULT_ERROR_MESSAGE,
  escapeHtml,
  loadBountyList,
  normalizeBounties,
  renderBounties,
  renderEmpty,
  renderError,
  renderLoading,
};
