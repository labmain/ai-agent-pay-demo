const {
  isEmptyApiResponse,
  normalizeApiResponse,
  safeJson,
  createErrorToast,
  renderApiResult,
} = require('../src/api-response-handler');

let passed = 0;
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    if (detail) console.log(`     ${detail}`);
    failed++;
  }
}

async function run() {
  console.log('\n📋 API Response Handler Tests\n');

  assert('null response is empty', isEmptyApiResponse(null));
  assert('undefined response is empty', isEmptyApiResponse(undefined));
  assert('empty string response is empty', isEmptyApiResponse(''));

  const nullResult = normalizeApiResponse(null);
  assert('null response does not crash', nullResult.ok === false && nullResult.status === 'empty');
  assert('null response has friendly error', nullResult.error.includes('Please try again'));

  const undefinedResult = normalizeApiResponse(undefined, { errorMessage: 'Nothing came back.' });
  assert('undefined response uses custom friendly error', undefinedResult.error === 'Nothing came back.');

  const whitespaceResult = normalizeApiResponse('   ');
  assert('blank body is handled as empty', whitespaceResult.ok === false && whitespaceResult.status === 'empty');

  const parsed = normalizeApiResponse('{"items":[1,2]}');
  assert('valid JSON string parses successfully', parsed.ok === true && parsed.data.items.length === 2);

  const invalid = normalizeApiResponse('{bad json');
  assert('invalid JSON returns friendly failure', invalid.ok === false && invalid.status === 'invalid-json');

  const objectResult = normalizeApiResponse({ ok: true });
  assert('object responses pass through', objectResult.ok === true && objectResult.data.ok === true);

  const emptyFetch = await safeJson(Promise.resolve(null));
  assert('safeJson handles null fetch result', emptyFetch.ok === false && emptyFetch.status === 'empty');

  const textFetch = await safeJson(Promise.resolve({ text: async () => '{"ok":true}' }));
  assert('safeJson parses response text when available', textFetch.ok === true && textFetch.data.ok === true);

  const failedFetch = await safeJson(Promise.reject(new Error('boom')));
  assert('safeJson catches fetch failures', failedFetch.ok === false && failedFetch.status === 'network-error');

  const toast = createErrorToast('Bad <response>');
  assert('toast uses alert role', toast.includes('role="alert"'));
  assert('toast escapes message', toast.includes('Bad &lt;response&gt;'));

  const errorMarkup = renderApiResult(null);
  assert('renderApiResult renders friendly error for missing result', errorMarkup.includes('toast-error'));

  const dataMarkup = renderApiResult({ ok: true, data: ['a'] }, { renderData: (data) => `<p>${data[0]}</p>` });
  assert('renderApiResult renders data when result is ok', dataMarkup === '<p>a</p>');

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
