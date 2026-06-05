const {
  EMPTY_RESPONSE_MESSAGE,
  isEmptyApiResponse,
  parseApiResponse,
  parseCSV
} = require("../src/parser");

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  PASS ${name}`);
    passed++;
  } else {
    console.log(`  FAIL ${name}`);
    console.log(`     Expected: ${e}`);
    console.log(`     Actual:   ${a}`);
    failed++;
  }
}

function assertThrows(name, callback) {
  let threwError = false;
  try {
    callback();
  } catch {
    threwError = true;
  }
  assert(name, threwError, true);
}

console.log("\nCSV Parser and API Response Tests\n");

assert(
  "parses basic CSV with ASCII commas",
  parseCSV("a,b,c\n1,2,3"),
  [["a", "b", "c"], ["1", "2", "3"]]
);

assert(
  "trims whitespace",
  parseCSV("a , b , c"),
  [["a", "b", "c"]]
);

assert(
  "handles single row",
  parseCSV("hello,world"),
  [["hello", "world"]]
);

assert(
  "parses CSV with Chinese full-width commas",
  parseCSV("name，age，city\nZhang San，25，Beijing"),
  [["name", "age", "city"], ["Zhang San", "25", "Beijing"]]
);

assert(
  "handles mixed comma types",
  parseCSV("a,b，c"),
  [["a", "b", "c"]]
);

assertThrows("throws on empty CSV input", () => parseCSV(""));

assert("detects null API responses", isEmptyApiResponse(null), true);
assert("detects undefined API responses", isEmptyApiResponse(undefined), true);
assert("detects blank API response strings", isEmptyApiResponse("   "), true);
assert("detects empty arrays", isEmptyApiResponse([]), true);
assert("detects empty objects", isEmptyApiResponse({}), true);
assert("keeps non-empty objects valid", isEmptyApiResponse({ items: [] }), false);
assert("keeps zero as a valid payload", isEmptyApiResponse(0), false);

assert(
  "returns friendly toast payload for empty API response",
  parseApiResponse(null),
  {
    ok: false,
    data: null,
    toast: {
      type: "error",
      message: EMPTY_RESPONSE_MESSAGE
    }
  }
);

assert(
  "returns data without toast for valid API response",
  parseApiResponse({ bounties: [{ id: 35 }] }),
  {
    ok: true,
    data: { bounties: [{ id: 35 }] },
    toast: null
  }
);

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
