import { validateSettings, isFormValid, SettingsFormData } from './settings-validator'

const validData: SettingsFormData = {
  displayName: 'John Doe',
  email: 'john@example.com',
  walletAddress: '0x' + 'a'.repeat(40),
  paymentLimit: 100,
}

describe('validateSettings', () => {
  it('returns no errors for valid data', () => {
    expect(validateSettings(validData)).toEqual([])
  })

  it('requires displayName', () => {
    const errors = validateSettings({ ...validData, displayName: '' })
    expect(errors).toContainEqual({ field: 'displayName', message: 'Display name is required' })
  })

  it('limits displayName length', () => {
    const errors = validateSettings({ ...validData, displayName: 'x'.repeat(51) })
    expect(errors).toContainEqual({ field: 'displayName', message: 'Display name must be 50 characters or less' })
  })

  it('validates email format', () => {
    const errors = validateSettings({ ...validData, email: 'not-an-email' })
    expect(errors).toContainEqual({ field: 'email', message: 'Invalid email format' })
  })

  it('validates wallet address format', () => {
    const errors = validateSettings({ ...validData, walletAddress: 'invalid' })
    expect(errors).toContainEqual({ field: 'walletAddress', message: 'Invalid wallet address (must be 0x + 40 hex chars)' })
  })

  it('requires positive payment limit', () => {
    const errors = validateSettings({ ...validData, paymentLimit: -5 })
    expect(errors).toContainEqual({ field: 'paymentLimit', message: 'Payment limit must be greater than 0' })
  })

  it('caps payment limit at 100000', () => {
    const errors = validateSettings({ ...validData, paymentLimit: 200000 })
    expect(errors).toContainEqual({ field: 'paymentLimit', message: 'Payment limit cannot exceed \$100,000' })
  })
})

describe('isFormValid', () => {
  it('returns true for valid data', () => {
    expect(isFormValid(validData)).toBe(true)
  })

  it('returns false for invalid data', () => {
    expect(isFormValid({ ...validData, email: '' })).toBe(false)
  })
})
