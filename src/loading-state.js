"use strict";

function createLoadingState(initial = {}) {
  let state = {
    loading: Boolean(initial.loading),
    data: initial.data ?? null,
    error: initial.error ?? null,
  };
  const listeners = new Set();

  function snapshot() {
    return { ...state };
  }

  function emit() {
    const next = snapshot();
    listeners.forEach(listener => listener(next));
  }

  function setState(patch) {
    state = { ...state, ...patch };
    emit();
    return snapshot();
  }

  return {
    getState: snapshot,
    setLoading: () => setState({ loading: true, error: null }),
    setData: data => setState({ loading: false, data, error: null }),
    setError: error => setState({ loading: false, error }),
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
  };
}

async function runWithLoading(loader, options = {}) {
  const { state = createLoadingState(), onError } = options;
  state.setLoading();
  try {
    const data = await loader();
    state.setData(data);
    return { ok: true, data, state: state.getState() };
  } catch (error) {
    const friendlyError = error && error.message ? error.message : String(error);
    state.setError(friendlyError);
    if (typeof onError === "function") {
      onError(friendlyError);
    }
    return { ok: false, error: friendlyError, state: state.getState() };
  }
}

function getLoadingViewModel(state) {
  if (state.loading) {
    return { showSpinner: true, showError: false, hasData: false };
  }
  if (state.error) {
    return { showSpinner: false, showError: true, hasData: false };
  }
  return { showSpinner: false, showError: false, hasData: state.data !== null && state.data !== undefined };
}

module.exports = {
  createLoadingState,
  getLoadingViewModel,
  runWithLoading,
};
