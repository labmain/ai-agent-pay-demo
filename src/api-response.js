class ApiResponseError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = "ApiResponseError"
    this.status = options.status
    this.userMessage =
      options.userMessage ||
      "We could not load this data. Please try again in a moment."
  }
}

function isEmptyResponseBody(body) {
  return (
    body === null ||
    body === undefined ||
    (typeof body === "string" && body.trim() === "")
  )
}

async function parseApiResponse(response) {
  if (!response) {
    throw new ApiResponseError("API response was empty")
  }

  const status = response.status
  const body =
    typeof response.text === "function" ? await response.text() : response.body

  if (isEmptyResponseBody(body)) {
    throw new ApiResponseError("API returned an empty response body", { status })
  }

  if (typeof body !== "string") {
    return body
  }

  try {
    return JSON.parse(body)
  } catch (error) {
    throw new ApiResponseError("API returned invalid JSON", { status })
  }
}

function toFriendlyError(error) {
  if (error instanceof ApiResponseError) {
    return {
      message: error.userMessage,
      status: error.status,
    }
  }

  return {
    message: "Something went wrong. Please try again.",
  }
}

module.exports = {
  ApiResponseError,
  isEmptyResponseBody,
  parseApiResponse,
  toFriendlyError,
}
