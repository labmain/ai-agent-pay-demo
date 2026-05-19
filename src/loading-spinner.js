'use strict';

const DEFAULT_ERROR_MESSAGE = 'Unable to load bounties. Please try again.';

function createLoadingState() {
  return {
    isLoading: false,
    error: null,
    bounties: [],
    requestId: 0,
  };
}

async function loadBounties(fetchBounties, state = createLoadingState()) {
  if (typeof fetchBounties !== 'function') {
    throw new TypeError('fetchBounties must be a function');
  }

  const requestId = state.requestId + 1;
  state.requestId = requestId;
  state.isLoading = true;
  state.error = null;

  try {
    const bounties = await fetchBounties();
    if (state.requestId !== requestId) {
      return state;
    }
    state.bounties = Array.isArray(bounties) ? bounties : [];
    return state;
  } catch (error) {
    if (state.requestId !== requestId) {
      return state;
    }
    state.error = toUserSafeError(error);
    return state;
  } finally {
    if (state.requestId === requestId) {
      state.isLoading = false;
    }
  }
}

async function updateBountyList(container, fetchBounties, state = createLoadingState()) {
  if (!container || typeof container !== 'object') {
    throw new TypeError('container must be a DOM element-like object');
  }

  const pending = loadBounties(fetchBounties, state);
  container.innerHTML = renderBountyList(state);
  await pending;
  container.innerHTML = renderBountyList(state);
  return state;
}

function renderBountyList(state) {
  if (state.isLoading) {
    return '<div class="loading-spinner" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span>Loading bounties...</div>';
  }

  if (state.error) {
    return `<div class="error-state" role="alert">${escapeHtml(state.error)}</div>`;
  }

  if (!state.bounties.length) {
    return '<p class="empty-state">No bounties available.</p>';
  }

  const items = state.bounties
    .map((bounty) => `<li>${escapeHtml(String(bounty.title || bounty))}</li>`)
    .join('');

  return `<ul class="bounty-list">${items}</ul>`;
}

function toUserSafeError(error) {
  if (error && error.userMessage) {
    return String(error.userMessage);
  }
  return DEFAULT_ERROR_MESSAGE;
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}

module.exports = {
  DEFAULT_ERROR_MESSAGE,
  createLoadingState,
  loadBounties,
  renderBountyList,
  updateBountyList,
};
