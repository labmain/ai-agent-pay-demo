const assert = require("assert");
const {
  createLoadingState,
  getLoadingViewModel,
  runWithLoading,
} = require("../src/loading-state");

async function run() {
  const state = createLoadingState();
  const snapshots = [];
  const unsubscribe = state.subscribe(next => snapshots.push(next));

  assert.deepStrictEqual(state.getState(), { loading: false, data: null, error: null });
  assert.deepStrictEqual(getLoadingViewModel(state.getState()), {
    showSpinner: false,
    showError: false,
    hasData: false,
  });

  const success = await runWithLoading(async () => ["bounty-a", "bounty-b"], { state });
  assert.deepStrictEqual(success, {
    ok: true,
    data: ["bounty-a", "bounty-b"],
    state: { loading: false, data: ["bounty-a", "bounty-b"], error: null },
  });
  assert.deepStrictEqual(getLoadingViewModel(state.getState()), {
    showSpinner: false,
    showError: false,
    hasData: true,
  });
  assert.strictEqual(snapshots.some(snapshot => snapshot.loading === true), true);

  let reportedError = null;
  const failure = await runWithLoading(
    async () => {
      throw new Error("network unavailable");
    },
    { state, onError: error => { reportedError = error; } }
  );
  assert.deepStrictEqual(failure, {
    ok: false,
    error: "network unavailable",
    state: { loading: false, data: ["bounty-a", "bounty-b"], error: "network unavailable" },
  });
  assert.strictEqual(reportedError, "network unavailable");
  assert.deepStrictEqual(getLoadingViewModel(state.getState()), {
    showSpinner: false,
    showError: true,
    hasData: false,
  });

  unsubscribe();
  state.setLoading();
  assert.notStrictEqual(snapshots[snapshots.length - 1].loading, true);

  console.log("loading-state tests passed");
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
