const {
  ApiResponseError,
  isEmptyResponseBody,
  parseApiResponse,
  toFriendlyError,
} = require("../src/api-response")

let passed = 0
let failed = 0

function assert(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    console.log(`  OK ${name}`)
    passed++
  } else {
    console.log(`  FAIL ${name}`)
    console.log(`     Expected: ${e}`)
    console.log(`     Actual:   ${a}`)
    failed++
  }
}

async function assertRejects(name, fn, check) {
  try {
    await fn()
    console.log(`  FAIL ${name}`)
    console.log("     Expected function to throw")
    failed++
  } catch (error) {
    const result = check(error)
    if (result) {
      console.log(`  OK ${name}`)
      passed++
    } else {
      console.log(`  FAIL ${name}`)
      console.log(`     Unexpected error: ${error && error.message}`)
      failed++
    }
  }
}

async function run() {
  console.log("\nAPI Response Tests\n")

  assert("detects null as empty", isEmptyResponseBody(null), true)
  assert("detects undefined as empty", isEmptyResponseBody(undefined), true)
  assert("detects blank string as empty", isEmptyResponseBody("   "), true)
  assert("keeps JSON string as non-empty", isEmptyResponseBody('{"ok":true}'), false)

  assert(
    "parses JSON response text",
    await parseApiResponse({ status: 200, text: async () => '{"items":[]}' }),
    { items: [] },
  )

  assertRejects(
    "throws friendly error for null response",
    () => parseApiResponse(null),
    (error) => error instanceof ApiResponseError,
  )

  await assertRejects(
    "throws friendly error for empty response body",
    () => parseApiResponse({ status: 204, text: async () => "" }),
    (error) =>
      error instanceof ApiResponseError &&
      toFriendlyError(error).message ===
        "We could not load this data. Please try again in a moment." &&
      toFriendlyError(error).status === 204,
  )

  await assertRejects(
    "throws friendly error for invalid JSON",
    () => parseApiResponse({ status: 200, text: async () => "not json" }),
    (error) => error instanceof ApiResponseError,
  )

  assert(
    "maps unexpected errors to generic friendly message",
    toFriendlyError(new Error("network failed")),
    { message: "Something went wrong. Please try again." },
  )

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

run()
