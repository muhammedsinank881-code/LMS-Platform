import { describe, expect, it } from 'vitest'
import type { FilterCondition } from '@/types'
import { dateWindowForPreset } from './date-presets'
import { compareFieldValues, matchesAll, matchesAny, matchesCondition } from './evaluate'

// Wednesday, 7 Oct 2026, 10:00 local time.
const NOW = new Date(2026, 9, 7, 10, 0, 0)
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString()

const check = (value: Parameters<typeof matchesCondition>[0], condition: FilterCondition) =>
  matchesCondition(value, condition, NOW)

describe('equals / not_equals', () => {
  it('compares strings case-insensitively', () => {
    expect(check('Facebook', { field: 'f', operator: 'equals', value: 'facebook' })).toBe(true)
    expect(check('Google', { field: 'f', operator: 'equals', value: 'facebook' })).toBe(false)
  })

  it('compares numbers and booleans', () => {
    expect(check(5, { field: 'f', operator: 'equals', value: 5 })).toBe(true)
    expect(check(true, { field: 'f', operator: 'equals', value: true })).toBe(true)
    expect(check(null, { field: 'f', operator: 'equals', value: false })).toBe(true)
    expect(check(null, { field: 'f', operator: 'equals', value: 'x' })).toBe(false)
  })

  it('matches when any array element equals', () => {
    expect(check(['vip', 'hot'], { field: 'f', operator: 'equals', value: 'HOT' })).toBe(true)
  })

  it('negates with not_equals', () => {
    expect(check('a', { field: 'f', operator: 'not_equals', value: 'b' })).toBe(true)
    expect(check('a', { field: 'f', operator: 'not_equals', value: 'a' })).toBe(false)
    expect(check(null, { field: 'f', operator: 'not_equals', value: 'a' })).toBe(true)
  })
})

describe('contains', () => {
  it('matches substrings case-insensitively', () => {
    expect(check('Sharma Traders', { field: 'f', operator: 'contains', value: 'trader' })).toBe(
      true,
    )
    expect(check('Sharma', { field: 'f', operator: 'contains', value: 'xyz' })).toBe(false)
  })

  it('searches array elements and rejects empty values', () => {
    expect(check(['premium', 'vip'], { field: 'f', operator: 'contains', value: 'vi' })).toBe(true)
    expect(check(null, { field: 'f', operator: 'contains', value: 'a' })).toBe(false)
  })
})

describe('in', () => {
  it('matches scalars and arrays against the option list', () => {
    const condition: FilterCondition = { field: 'f', operator: 'in', value: ['a', 'b', 3] }
    expect(check('B', condition)).toBe(true)
    expect(check(3, condition)).toBe(true)
    expect(check('c', condition)).toBe(false)
    expect(check(['x', 'a'], condition)).toBe(true)
    expect(check(null, condition)).toBe(false)
  })
})

describe('gt / lt / between', () => {
  it('compares numbers', () => {
    expect(check(150_000, { field: 'f', operator: 'gt', value: 100_000 })).toBe(true)
    expect(check(100_000, { field: 'f', operator: 'gt', value: 100_000 })).toBe(false)
    expect(check(50, { field: 'f', operator: 'lt', value: 100 })).toBe(true)
    expect(check(null, { field: 'f', operator: 'gt', value: 1 })).toBe(false)
  })

  it('compares ISO dates', () => {
    expect(check(at(2026, 10, 1), { field: 'f', operator: 'lt', value: at(2026, 10, 7) })).toBe(
      true,
    )
    expect(check(at(2026, 10, 9), { field: 'f', operator: 'gt', value: at(2026, 10, 7) })).toBe(
      true,
    )
  })

  it('is inclusive for between and tolerates reversed bounds', () => {
    const condition: FilterCondition = { field: 'f', operator: 'between', value: [10, 20] }
    expect(check(10, condition)).toBe(true)
    expect(check(20, condition)).toBe(true)
    expect(check(21, condition)).toBe(false)
    expect(check(15, { field: 'f', operator: 'between', value: [20, 10] })).toBe(true)
    expect(check(null, condition)).toBe(false)
  })
})

describe('is_empty / is_not_empty', () => {
  it('treats null, undefined, empty string and empty array as empty', () => {
    for (const empty of [null, undefined, '', []]) {
      expect(check(empty, { field: 'f', operator: 'is_empty' })).toBe(true)
      expect(check(empty, { field: 'f', operator: 'is_not_empty' })).toBe(false)
    }
    expect(check('x', { field: 'f', operator: 'is_not_empty' })).toBe(true)
    expect(check(0, { field: 'f', operator: 'is_empty' })).toBe(false)
  })
})

describe('date_preset', () => {
  const inPreset = (iso: string, preset: 'today' | 'this_week' | 'this_month' | 'last_30_days') =>
    check(iso, { field: 'f', operator: 'date_preset', value: preset })

  it('today', () => {
    expect(inPreset(at(2026, 10, 7, 0), 'today')).toBe(true)
    expect(inPreset(at(2026, 10, 7, 23), 'today')).toBe(true)
    expect(inPreset(at(2026, 10, 6, 23), 'today')).toBe(false)
  })

  it('this_week runs Monday to Sunday', () => {
    expect(inPreset(at(2026, 10, 5, 0), 'this_week')).toBe(true)
    expect(inPreset(at(2026, 10, 11, 20), 'this_week')).toBe(true)
    expect(inPreset(at(2026, 10, 4, 20), 'this_week')).toBe(false)
    expect(inPreset(at(2026, 10, 12, 1), 'this_week')).toBe(false)
  })

  it('this_month', () => {
    expect(inPreset(at(2026, 10, 1, 0), 'this_month')).toBe(true)
    expect(inPreset(at(2026, 10, 31, 22), 'this_month')).toBe(true)
    expect(inPreset(at(2026, 9, 30, 22), 'this_month')).toBe(false)
  })

  it('last_30_days', () => {
    expect(inPreset(at(2026, 9, 7, 0), 'last_30_days')).toBe(true)
    expect(inPreset(at(2026, 9, 6, 22), 'last_30_days')).toBe(false)
    expect(inPreset(at(2026, 10, 7, 23), 'last_30_days')).toBe(true)
  })

  it('rejects empty and invalid values', () => {
    expect(inPreset('not a date', 'today')).toBe(false)
    expect(check(null, { field: 'f', operator: 'date_preset', value: 'today' })).toBe(false)
  })

  it('exposes the window used', () => {
    const { start, end } = dateWindowForPreset('today', NOW)
    expect(start.getHours()).toBe(0)
    expect(end.getHours()).toBe(23)
  })
})

describe('matchesAll / matchesAny', () => {
  const row: Record<string, string | number> = { source: 'facebook', budget: 200_000 }
  const conditions: FilterCondition[] = [
    { field: 'source', operator: 'equals', value: 'facebook' },
    { field: 'budget', operator: 'gt', value: 100_000 },
  ]

  it('ANDs conditions, and an empty list matches everything', () => {
    expect(matchesAll(conditions, (f) => row[f], NOW)).toBe(true)
    expect(
      matchesAll(
        [...conditions, { field: 'budget', operator: 'lt', value: 1 }],
        (f) => row[f],
        NOW,
      ),
    ).toBe(false)
    expect(matchesAll([], (f) => row[f], NOW)).toBe(true)
  })

  it('ORs conditions, and an empty list matches nothing', () => {
    expect(
      matchesAny(
        [...conditions, { field: 'budget', operator: 'lt', value: 1 }],
        (f) => row[f],
        NOW,
      ),
    ).toBe(true)
    expect(matchesAny([], (f) => row[f], NOW)).toBe(false)
  })
})

describe('compareFieldValues', () => {
  it('orders numbers, strings (natural) and dates, with empties last', () => {
    expect(compareFieldValues(1, 2)).toBeLessThan(0)
    expect(compareFieldValues('L-10', 'L-9')).toBeGreaterThan(0)
    expect(compareFieldValues(at(2026, 1, 1), at(2026, 2, 1))).toBeLessThan(0)
    expect(compareFieldValues(null, 'a')).toBeGreaterThan(0)
    expect(compareFieldValues('a', null)).toBeLessThan(0)
    expect(compareFieldValues(null, undefined)).toBe(0)
  })
})
