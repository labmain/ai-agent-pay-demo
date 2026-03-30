export interface SettingsFormData {
  displayName: string
  email: string
  walletAddress: string
  paymentLimit: number
}

export interface ValidationError {
  field: string
  message: string
}

export function validateSettings(data: SettingsFormData): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.displayName?.trim()) {
    errors.push({ field: 'displayName', message: 'Display name is required' })
  } else if (data.displayName.length > 50) {
    errors.push({ field: 'displayName', message: 'Display name must be 50 characters or less' })
  }

  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }

  if (!data.walletAddress?.trim()) {
    errors.push({ field: 'walletAddress', message: 'Wallet address is required' })
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)) {
    errors.push({ field: 'walletAddress', message: 'Invalid wallet address (must be 0x + 40 hex chars)' })
  }

  if (data.paymentLimit === undefined || data.paymentLimit === null) {
    errors.push({ field: 'paymentLimit', message: 'Payment limit is required' })
  } else if (data.paymentLimit <= 0) {
    errors.push({ field: 'paymentLimit', message: 'Payment limit must be greater than 0' })
  } else if (data.paymentLimit > 100000) {
    errors.push({ field: 'paymentLimit', message: 'Payment limit cannot exceed $100,000' })
  }

  return errors
}

export function isFormValid(data: SettingsFormData): boolean {
  return validateSettings(data).length === 0
}
