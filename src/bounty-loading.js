function createSpinnerMarkup(message = 'Loading bounties…') {
  return `<div class="bounty-loading" role="status" aria-live="polite">
  <span class="bounty-spinner" aria-hidden="true"></span>
  <span>${escapeHtml(message)}</span>
</div>`;
}

function createErrorMarkup(message = 'Unable to load bounties. Please try again.') {
  return `<div class="bounty-error" role="alert">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadBountiesWithState({
  container,
  fetchBounties,
  renderBounties,
  renderEmpty = () => '<p class="bounty-empty">No bounties found.</p>',
  loadingMessage,
  errorMessage,
}) {
  if (!container || typeof container !== 'object') {
    throw new Error('container is required');
  }
  if (typeof fetchBounties !== 'function') {
    throw new Error('fetchBounties must be a function');
  }
  if (typeof renderBounties !== 'function') {
    throw new Error('renderBounties must be a function');
  }

  container.innerHTML = createSpinnerMarkup(loadingMessage);
  container.dataset.state = 'loading';

  try {
    const bounties = await fetchBounties();
    if (!Array.isArray(bounties) || bounties.length === 0) {
      container.innerHTML = renderEmpty();
      container.dataset.state = 'empty';
      return bounties || [];
    }

    container.innerHTML = renderBounties(bounties);
    container.dataset.state = 'loaded';
    return bounties;
  } catch (error) {
    const message = errorMessage || (error && error.message) || 'Unable to load bounties. Please try again.';
    container.innerHTML = createErrorMarkup(message);
    container.dataset.state = 'error';
    return [];
  }
}

module.exports = {
  createSpinnerMarkup,
  createErrorMarkup,
  loadBountiesWithState,
  escapeHtml,
};
