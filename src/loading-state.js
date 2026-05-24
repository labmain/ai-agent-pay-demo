function createSpinnerMarkup(label = 'Loading bounties') {
  return `<div class="loading-spinner" role="status" aria-live="polite"><span>${label}</span></div>`;
}

async function loadBountyList(options) {
  const {
    fetchBounties,
    renderLoading,
    renderItems,
    renderEmpty,
    renderError,
  } = options;

  if (typeof fetchBounties !== 'function') {
    throw new Error('fetchBounties must be a function');
  }

  renderLoading?.(createSpinnerMarkup());

  try {
    const bounties = await fetchBounties();
    if (!Array.isArray(bounties)) {
      throw new Error('Bounty response must be an array');
    }
    if (bounties.length === 0) {
      renderEmpty?.();
      return { status: 'empty', bounties };
    }
    renderItems?.(bounties);
    return { status: 'loaded', bounties };
  } catch (error) {
    renderError?.(error);
    return { status: 'error', error };
  }
}

module.exports = {
  createSpinnerMarkup,
  loadBountyList,
};
