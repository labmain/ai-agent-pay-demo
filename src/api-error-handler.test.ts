import { safeParseResponse, handleApiError, ApiResponseError } from './api-error-handler'

describe('safeParseResponse', () => {
  it('returns fallback for null response', () => {
    expect(safeParseResponse(null, [])).toEqual([])
  })

  it('returns fallback for undefined response', () => {
    expect(safeParseResponse(undefined, { data: [] })).toEqual({ data: [] })
  })

  it('returns response when valid', () => {
    const data = { items: [1, 2, 3] }
    expect(safeParseResponse(data, {})).toEqual(data)
  })
})

describe('handleApiError', () => {
  it('handles ApiResponseError', () => {
    const err = new ApiResponseError('Not found', 404)
    expect(handleApiError(err)).toBe('Not found')
  })

  it('handles generic Error', () => {
    expect(handleApiError(new Error('fail'))).toBe('fail')
  })

  it('handles unknown errors', () => {
    expect(handleApiError('something')).toBe('An unexpected error occurred')
  })
})
