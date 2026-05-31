const DEFAULT_ERROR_MESSAGE = 'Unable to load bounties. Please try again.';

function createBountyListController({
  fetchBounties,
  renderItems,
  renderError,
  showLoading,
  hideLoading,
  clearError = () => {},
}) {
  const required = { fetchBounties, renderItems, renderError, showLoading, hideLoading };
  for (const [name, fn] of Object.entries(required)) {
    if (typeof fn !== 'function') {
      throw new TypeError(`${name} must be a function`);
    }
  }

  async function loadBounties() {
    showLoading();
    clearError();

    try {
      const bounties = await fetchBounties();
      renderItems(Array.isArray(bounties) ? bounties : []);
      return { ok: true, bounties: Array.isArray(bounties) ? bounties : [] };
    } catch (error) {
      const message = error && error.message ? error.message : DEFAULT_ERROR_MESSAGE;
      renderError(message);
      return { ok: false, error: message };
    } finally {
      hideLoading();
    }
  }

  return { loadBounties };
}

function createLoadingSpinnerMarkup(text = 'Loading bounties...') {
  return `<div class="loading-spinner" role="status" aria-live="polite">
  <span class="loading-spinner__icon" aria-hidden="true"></span>
  <span>${text}</span>
</div>`;
}

module.exports = {
  DEFAULT_ERROR_MESSAGE,
  createBountyListController,
  createLoadingSpinnerMarkup,
};
