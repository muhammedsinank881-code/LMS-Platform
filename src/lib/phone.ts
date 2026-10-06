const INDIA_MOBILE = /^[6-9]\d{9}$/

function indianNumber(national: string): string | null {
  return INDIA_MOBILE.test(national) ? `+91${national}` : null
}

/**
 * Canonical phone format: `+91XXXXXXXXXX` for Indian mobiles, `+<digits>` for other
 * international numbers. Returns null when the input cannot be a real number.
 *
 * Handles spaces, dashes, dots, brackets, `+91`, `0091`, a bare `91` prefix and the trunk `0`.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  let digits = trimmed.replace(/\D/g, '')
  if (!digits) return null

  let international = trimmed.startsWith('+')
  if (!international && digits.startsWith('00')) {
    international = true
    digits = digits.slice(2)
  }

  if (international) {
    if (digits.startsWith('91')) {
      let national = digits.slice(2)
      // "+91 (0) 98765 43210": a trunk zero is never part of the international number.
      if (national.length === 11 && national.startsWith('0')) national = national.slice(1)
      return indianNumber(national)
    }
    const looksValid = digits.length >= 8 && digits.length <= 15 && !digits.startsWith('0')
    return looksValid ? `+${digits}` : null
  }

  if (digits.length === 10) return indianNumber(digits)
  if (digits.length === 11 && digits.startsWith('0')) return indianNumber(digits.slice(1))
  if (digits.length === 12 && digits.startsWith('91')) return indianNumber(digits.slice(2))
  if (digits.length === 13 && digits.startsWith('091')) return indianNumber(digits.slice(3))
  return null
}

export function isValidPhone(raw: string | null | undefined): boolean {
  return normalizePhone(raw) !== null
}

/** "+91 98765 43210" for display. Non-Indian numbers are returned as stored. */
export function formatPhone(canonical: string | null | undefined): string {
  if (!canonical) return ''
  const match = /^\+91(\d{5})(\d{5})$/.exec(canonical)
  return match ? `+91 ${match[1]} ${match[2]}` : canonical
}
