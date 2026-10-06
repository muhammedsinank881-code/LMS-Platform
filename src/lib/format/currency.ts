import { EMPTY_VALUE } from './shared'

export const DEFAULT_CURRENCY = 'INR'
export const DEFAULT_CURRENCY_LOCALE = 'en-IN'

const LAKH = 100_000
const CRORE = 10_000_000

export interface CurrencyFormatOptions {
  currency?: string
  locale?: string
  compact?: boolean
  fractionDigits?: number
}

const roundTo1 = (value: number) => Math.round(value * 10) / 10

function formatIndianCompact(amount: number, locale: string): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const lakhs = roundTo1(abs / LAKH)
  const useCrore = abs >= CRORE || lakhs >= 100
  const scaled = useCrore ? roundTo1(abs / CRORE) : lakhs
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(scaled)
  return `${sign}₹${number}${useCrore ? 'Cr' : 'L'}`
}

/**
 * Formats a monetary amount. Defaults to INR with Indian digit grouping (₹2,50,000).
 * With `compact`, INR uses lakh/crore suffixes (₹4.2L, ₹1.2Cr); other currencies use Intl compact notation.
 */
export function formatCurrency(amount: number, options: CurrencyFormatOptions = {}): string {
  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_CURRENCY_LOCALE,
    compact = false,
    fractionDigits = 0,
  } = options

  if (!Number.isFinite(amount)) return EMPTY_VALUE

  if (compact) {
    if (currency === 'INR' && Math.abs(amount) >= LAKH) return formatIndianCompact(amount, locale)
    if (currency !== 'INR') {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount)
    }
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}

/** Narrow currency symbol for field adornments, following the workspace currency. */
export function currencySymbol(currency: string = DEFAULT_CURRENCY): string {
  try {
    const part = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((item) => item.type === 'currency')
    return part?.value ?? currency
  } catch {
    return currency
  }
}

export function formatINR(amount: number, fractionDigits = 0): string {
  return formatCurrency(amount, { fractionDigits })
}

export function formatINRCompact(amount: number): string {
  return formatCurrency(amount, { compact: true })
}
