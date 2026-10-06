import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatRelative } from './date'
import { EMPTY_VALUE } from './shared'

const utcIN = { locale: 'en-IN', timeZone: 'UTC' }
const sample = new Date('2026-10-03T17:25:00Z')

// Intl may emit narrow no-break spaces (U+202F) before am/pm depending on the ICU version.
const normalize = (value: string) => value.replace(/\s/g, ' ')

describe('formatDate', () => {
  it('formats in the given locale and time zone', () => {
    expect(formatDate(sample, utcIN)).toBe('3 Oct 2026')
    expect(formatDate(sample, { locale: 'en-US', timeZone: 'UTC' })).toBe('Oct 3, 2026')
  })

  it('accepts ISO strings and timestamps', () => {
    expect(formatDate('2026-10-03T17:25:00Z', utcIN)).toBe('3 Oct 2026')
    expect(formatDate(sample.getTime(), utcIN)).toBe('3 Oct 2026')
  })

  it('returns the empty placeholder for invalid input', () => {
    expect(formatDate('not a date', utcIN)).toBe(EMPTY_VALUE)
  })
})

describe('formatDateTime', () => {
  it('includes the time', () => {
    expect(normalize(formatDateTime(sample, utcIN))).toBe('3 Oct 2026, 5:25 pm')
  })

  it('respects the time zone', () => {
    expect(normalize(formatDateTime(sample, { locale: 'en-IN', timeZone: 'Asia/Kolkata' }))).toBe(
      '3 Oct 2026, 10:55 pm',
    )
  })
})

describe('formatRelative', () => {
  const now = new Date('2026-10-03T12:00:00Z')

  it('describes past times', () => {
    expect(formatRelative('2026-10-03T10:00:00Z', now)).toBe('2 hours ago')
    expect(formatRelative('2026-09-30T12:00:00Z', now)).toBe('3 days ago')
  })

  it('describes future times', () => {
    expect(formatRelative('2026-10-03T12:15:00Z', now)).toBe('in 15 minutes')
    expect(formatRelative('2026-10-06T12:00:00Z', now)).toBe('in 3 days')
  })

  it('returns the empty placeholder for invalid input', () => {
    expect(formatRelative('nope', now)).toBe(EMPTY_VALUE)
  })
})
