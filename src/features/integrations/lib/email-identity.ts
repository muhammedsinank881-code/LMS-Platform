export interface EmailIdentity {
  fromName: string
  fromEmail: string
  signature: string
  trackOpens: boolean
  trackClicks: boolean
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validEmailIdentity = (value: EmailIdentity) => value.fromName.trim().length > 0 && EMAIL_PATTERN.test(value.fromEmail)
