/**
 * Simple CSV parser plus API response helpers used by the bounty demo app.
 */

const COMMA_PATTERN = /,|\uFF0C/;
const EMPTY_RESPONSE_MESSAGE = "We couldn't load that data. Please try again.";

function parseCSV(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const rows = text.trim().split("\n");
  return rows.map((row) => row.split(COMMA_PATTERN).map((cell) => cell.trim()));
}

function parseApiResponse(responseBody) {
  if (isEmptyApiResponse(responseBody)) {
    return {
      ok: false,
      data: null,
      toast: {
        type: "error",
        message: EMPTY_RESPONSE_MESSAGE
      }
    };
  }

  return {
    ok: true,
    data: responseBody,
    toast: null
  };
}

function isEmptyApiResponse(responseBody) {
  if (responseBody === null || responseBody === undefined) {
    return true;
  }

  if (typeof responseBody === "string") {
    return responseBody.trim() === "";
  }

  if (Array.isArray(responseBody)) {
    return responseBody.length === 0;
  }

  if (typeof responseBody === "object") {
    return Object.keys(responseBody).length === 0;
  }

  return false;
}

module.exports = {
  EMPTY_RESPONSE_MESSAGE,
  isEmptyApiResponse,
  parseApiResponse,
  parseCSV
};
