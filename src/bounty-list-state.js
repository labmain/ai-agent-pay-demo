function createLoadingState(message = 'Loading bounties...') {
  return {
    status: 'loading',
    showSpinner: true,
    items: [],
    message,
    error: null,
  };
}

function createSuccessState(items) {
  return {
    status: 'ready',
    showSpinner: false,
    items: Array.isArray(items) ? items : [],
    message: '',
    error: null,
  };
}

function createErrorState(error) {
  const message = error && error.message ? error.message : 'Unable to load bounties. Please try again.';
  return {
    status: 'error',
    showSpinner: false,
    items: [],
    message,
    error: message,
  };
}

async function loadBounties(fetchBounties, onStateChange = () => {}) {
  if (typeof fetchBounties !== 'function') {
    throw new TypeError('fetchBounties must be a function');
  }

  onStateChange(createLoadingState());

  try {
    const items = await fetchBounties();
    const state = createSuccessState(items);
    onStateChange(state);
    return state;
  } catch (error) {
    const state = createErrorState(error);
    onStateChange(state);
    return state;
  }
}

function renderBountyListState(state) {
  if (state.status === 'loading') {
    return {
      role: 'status',
      text: state.message,
      spinner: true,
    };
  }

  if (state.status === 'error') {
    return {
      role: 'alert',
      text: state.message,
      spinner: false,
    };
  }

  return {
    role: 'list',
    count: state.items.length,
    spinner: false,
  };
}

module.exports = {
  createErrorState,
  createLoadingState,
  createSuccessState,
  loadBounties,
  renderBountyListState,
};
