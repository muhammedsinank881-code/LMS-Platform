import { describe, expect, it } from 'vitest'
import { formatCurrency, formatINR, formatINRCompact } from './currency'
import { EMPTY_VALUE } from './shared'

describe('formatINR', () => {
  it('uses Indian digit grouping', () => {
    expect(formatINR(250000)).toBe('₹2,50,000')
    expect(formatINR(12345678)).toBe('₹1,23,45,678')
    expect(formatINR(999)).toBe('₹999')
  })

  it('handles zero and negatives', () => {
    expect(formatINR(0)).toBe('₹0')
    expect(formatINR(-250000)).toBe('-₹2,50,000')
  })

  it('rounds to whole rupees by default and supports decimals', () => {
    expect(formatINR(1234.56)).toBe('₹1,235')
    expect(formatINR(1234.5, 2)).toBe('₹1,234.50')
  })

  it('returns the empty placeholder for non-finite values', () => {
    expect(formatINR(Number.NaN)).toBe(EMPTY_VALUE)
    expect(formatINR(Number.POSITIVE_INFINITY)).toBe(EMPTY_VALUE)
  })
})

describe('formatINRCompact', () => {
  it('keeps amounts below 1 lakh in full', () => {
    expect(formatINRCompact(45000)).toBe('₹45,000')
    expect(formatINRCompact(99999)).toBe('₹99,999')
  })

  it('uses lakhs from 1,00,000', () => {
    expect(formatINRCompact(100000)).toBe('₹1L')
    expect(formatINRCompact(420000)).toBe('₹4.2L')
    expect(formatINRCompact(250000)).toBe('₹2.5L')
  })

  it('switches to crores at 1,00,00,000 and when lakhs round up to 100', () => {
    expect(formatINRCompact(9999999)).toBe('₹1Cr')
    expect(formatINRCompact(10000000)).toBe('₹1Cr')
    expect(formatINRCompact(12000000)).toBe('₹1.2Cr')
    expect(formatINRCompact(125000000000)).toBe('₹12,500Cr')
  })

  it('handles negatives', () => {
    expect(formatINRCompact(-420000)).toBe('-₹4.2L')
    expect(formatINRCompact(-45000)).toBe('-₹45,000')
  })
})

describe('formatCurrency', () => {
  it('formats other currencies with the given locale', () => {
    expect(formatCurrency(1234.5, { currency: 'USD', locale: 'en-US', fractionDigits: 2 })).toBe(
      '$1,234.50',
    )
  })

  it('uses Intl compact notation for non-INR currencies', () => {
    expect(formatCurrency(1500000, { currency: 'USD', locale: 'en-US', compact: true })).toBe(
      '$1.5M',
    )
  })

  it('delegates INR compact to lakh/crore formatting', () => {
    expect(formatCurrency(4200000, { compact: true })).toBe('₹42L')
  })
})
