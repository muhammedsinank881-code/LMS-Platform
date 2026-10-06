import { describe, expect, it } from 'vitest'
import { formatPhone, isValidPhone, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it.each([
    ['+91 98765 43210', '+919876543210'],
    ['+91-98765-43210', '+919876543210'],
    ['98765 43210', '+919876543210'],
    ['98765-43210', '+919876543210'],
    ['09876543210', '+919876543210'],
    ['919876543210', '+919876543210'],
    ['0091 98765 43210', '+919876543210'],
    ['091 9876543210', '+919876543210'],
    ['(+91) 98765.43210', '+919876543210'],
    ['+91 (0) 98765 43210', '+919876543210'],
    ['  +919876543210  ', '+919876543210'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it('keeps other international numbers in E.164 form', () => {
    expect(normalizePhone('+971 50 123 4567')).toBe('+971501234567')
    expect(normalizePhone('00971501234567')).toBe('+971501234567')
  })

  it.each([[''], ['   '], ['abc'], ['12345'], ['5876543210'], ['+91 12345'], ['+0 12345678']])(
    'rejects %j',
    (input) => {
      expect(normalizePhone(input)).toBeNull()
    },
  )

  it('rejects null and undefined', () => {
    expect(normalizePhone(null)).toBeNull()
    expect(normalizePhone(undefined)).toBeNull()
  })

  it('is idempotent', () => {
    const once = normalizePhone('098765 43210')
    expect(normalizePhone(once)).toBe(once)
  })
})

describe('isValidPhone / formatPhone', () => {
  it('validates through normalizePhone', () => {
    expect(isValidPhone('98765 43210')).toBe(true)
    expect(isValidPhone('1234')).toBe(false)
  })

  it('formats Indian numbers for display and passes others through', () => {
    expect(formatPhone('+919876543210')).toBe('+91 98765 43210')
    expect(formatPhone('+971501234567')).toBe('+971501234567')
    expect(formatPhone(null)).toBe('')
  })
})
