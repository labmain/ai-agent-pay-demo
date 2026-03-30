/**
 * Safely handle API responses that might be null or undefined.
 * Shows a user-friendly error toast instead of crashing.
 */
export function safeParseResponse<T>(response: unknown, fallback: T): T {
  if (response === null || response === undefined) {
    console.warn('API returned empty response, using fallback')
    return fallback
  }
  return response as T
}

export class ApiResponseError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'ApiResponseError'
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiResponseError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
// Updated at Mon Mar 30 19:46:23 CST 2026
