import {
  safeParseResponse,
  handleApiError,
  safeApiCall,
  ApiResponseError,
  SafeResult,
} from './api-client';

describe('safeParseResponse', () => {
  it('returns success for valid non-null response', () => {
    const result = safeParseResponse({ foo: 'bar' }, 'test data');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ foo: 'bar' });
    }
  });

  it('returns error for null response', () => {
    const result = safeParseResponse<string>(null, 'user data');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ApiResponseError);
      expect(result.error.message).toContain('Empty user data');
      expect(result.error.message).toContain('null or undefined');
    }
  });

  it('returns error for undefined response', () => {
    const result = safeParseResponse<number>(undefined, 'count');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ApiResponseError);
      expect(result.error.message).toContain('Empty count');
    }
  });

  it('returns success for empty string (valid value)', () => {
    const result = safeParseResponse('', 'label');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('');
    }
  });

  it('returns success for zero (valid value)', () => {
    const result = safeParseResponse(0, 'score');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(0);
    }
  });
});

describe('handleApiError', () => {
  it('wraps a generic Error', () => {
    const result = handleApiError(new Error('Network failure'), 'fetch user');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Failed to fetch user');
      expect(result.error.message).toContain('Network failure');
    }
  });

  it('preserves ApiResponseError instances', () => {
    const original = new ApiResponseError('Already handled', new Error('root'));
    const result = handleApiError(original, 'process');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Already handled');
      expect(result.error.originalError).toBeInstanceOf(Error);
    }
  });

  it('handles null/undefined errors gracefully', () => {
    const result = handleApiError(null, 'step');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ApiResponseError);
    }
  });

  it('handles unknown error types', () => {
    const result = handleApiError(42, 'convert');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ApiResponseError);
      expect(result.error.message).toContain('unexpected error');
    }
  });
});

describe('safeApiCall', () => {
  it('returns data on successful async call', async () => {
    const result = await safeApiCall(
      async () => ({ id: 1, name: 'Test' }),
      'load user'
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ id: 1, name: 'Test' });
    }
  });

  it('returns error when async call returns null', async () => {
    const result = await safeApiCall(
      async () => null as string | null,
      'fetch profile'
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ApiResponseError);
    }
  });

  it('returns error when async call throws', async () => {
    const result = await safeApiCall(
      async () => {
        throw new Error('Server error');
      },
      'post data'
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Failed to post data');
    }
  });
});
