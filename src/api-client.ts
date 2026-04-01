/**
 * API Client with safe response handling
 * Handles null/undefined API responses gracefully
 */

/**
 * Error class for API response errors
 */
export class ApiResponseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error | null
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

/**
 * Result type for safe API calls
 */
export type SafeResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiResponseError };

/**
 * Safely parses an API response, handling null/undefined gracefully.
 * Returns a user-friendly error instead of throwing.
 */
export function safeParseResponse<T>(
  response: T | null | undefined,
  context: string = 'API response'
): SafeResult<T> {
  if (response === null || response === undefined) {
    return {
      success: false,
      error: new ApiResponseError(
        `Empty ${context}: received null or undefined. Please try again later.`
      ),
    };
  }
  return { success: true, data: response };
}

/**
 * Handles API errors and returns user-friendly error messages.
 * Never throws - always returns a SafeResult.
 */
export function handleApiError(
  error: unknown,
  context: string = 'API call'
): SafeResult<never> {
  if (error instanceof ApiResponseError) {
    return { success: false, error };
  }

  if (error instanceof Error) {
    if (error.message.includes('null') || error.message.includes('undefined')) {
      return {
        success: false,
        error: new ApiResponseError(
          `Empty ${context}: received null or undefined. Please try again later.`,
          error
        ),
      };
    }
    return {
      success: false,
      error: new ApiResponseError(`Failed to ${context}: ${error.message}`, error),
    };
  }

  return {
    success: false,
    error: new ApiResponseError(`An unexpected error occurred during ${context}.`),
  };
}

/**
 * Wraps an async API call with comprehensive error handling.
 */
export async function safeApiCall<T>(
  apiFn: () => Promise<T>,
  context: string = 'API call'
): Promise<SafeResult<T>> {
  try {
    const result = await apiFn();
    return safeParseResponse(result, context);
  } catch (error) {
    return handleApiError(error, context);
  }
}
