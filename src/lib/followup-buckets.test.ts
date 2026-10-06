import { describe, expect, it } from 'vitest'
import { makeFollowUp } from '@/test/factories'
import { bucketFollowUps, bucketOf } from './followup-buckets'
import { groupFollowUps, groupsMatchBucketCounts } from './followup-groups'

// Wednesday, 7 Oct 2026, 10:00 local time.
const NOW = new Date(2026, 9, 7, 10, 0, 0)
const local = (day: number, hour: number, minute = 0) =>
  new Date(2026, 9, day, hour, minute).toISOString()

describe('bucketOf', () => {
  it.each([
    ['an hour ago', local(7, 9), 'overdue'],
    ['earlier today', local(7, 8), 'overdue'],
    ['last week', local(1, 12), 'overdue'],
    ['exactly now is not yet overdue', NOW.toISOString(), 'today'],
    ['later today', local(7, 15), 'today'],
    ['end of today', local(7, 23, 59), 'today'],
    ['start of tomorrow', local(8, 0), 'tomorrow'],
    ['tomorrow evening', local(8, 18), 'tomorrow'],
    ['the day after tomorrow', local(9, 9), 'upcoming'],
    ['next month', new Date(2026, 10, 3).toISOString(), 'upcoming'],
  ])('%s is %s', (_label, dueAt, expected) => {
    expect(bucketOf(dueAt, NOW)).toBe(expected)
  })

  it('accepts Date objects', () => {
    expect(bucketOf(new Date(2026, 9, 8, 9), NOW)).toBe('tomorrow')
  })

  it('handles month boundaries for tomorrow', () => {
    const endOfMonth = new Date(2026, 9, 31, 12)
    expect(bucketOf(new Date(2026, 10, 1, 9), endOfMonth)).toBe('tomorrow')
  })

  it('treats the instant before midnight as today and midnight as tomorrow', () => {
    const late = new Date(2026, 9, 7, 23, 59, 0)
    expect(bucketOf(new Date(2026, 9, 7, 23, 30).toISOString(), late)).toBe('overdue')
    expect(bucketOf(late.toISOString(), late)).toBe('today')
    const midnight = new Date(2026, 9, 8, 0, 0, 0)
    expect(bucketOf(new Date(2026, 9, 7, 23, 59).toISOString(), midnight)).toBe('overdue')
    expect(bucketOf(midnight.toISOString(), midnight)).toBe('today')
    expect(bucketOf(new Date(2026, 9, 9, 0, 0).toISOString(), midnight)).toBe('tomorrow')
  })

  it('marks a follow-up overdue by minutes on the local calendar day', () => {
    const now = new Date(2026, 9, 7, 1, 0, 0)
    expect(bucketOf(new Date(2026, 9, 7, 0, 30).toISOString(), now)).toBe('overdue')
    expect(bucketOf(new Date(2026, 9, 7, 1, 0).toISOString(), now)).toBe('today')
  })
})

describe('bucketFollowUps', () => {
  it('counts open follow-ups per bucket and ignores completed ones', () => {
    const followUps = [
      makeFollowUp({ id: '1', dueAt: local(5, 9) }),
      makeFollowUp({ id: '2', dueAt: local(7, 9) }),
      makeFollowUp({ id: '3', dueAt: local(7, 16) }),
      makeFollowUp({ id: '4', dueAt: local(7, 18) }),
      makeFollowUp({ id: '5', dueAt: local(8, 11) }),
      makeFollowUp({ id: '6', dueAt: local(12, 11) }),
      makeFollowUp({ id: '7', dueAt: local(5, 9), status: 'done' }),
      makeFollowUp({ id: '8', dueAt: local(5, 9), status: 'overdue' }),
    ]
    expect(bucketFollowUps(followUps, NOW)).toEqual({
      overdue: 3,
      today: 2,
      tomorrow: 1,
      upcoming: 1,
    })
  })

  it('returns zeros for an empty list', () => {
    expect(bucketFollowUps([], NOW)).toEqual({ overdue: 0, today: 0, tomorrow: 0, upcoming: 0 })
  })

  it('matches the grouped list counts', () => {
    const followUps = [
      makeFollowUp({ id: '1', dueAt: local(5, 9) }),
      makeFollowUp({ id: '2', dueAt: local(7, 16) }),
      makeFollowUp({ id: '3', dueAt: local(8, 11) }),
      makeFollowUp({ id: '4', dueAt: local(12, 11) }),
      makeFollowUp({ id: '5', dueAt: local(6, 9), status: 'done' }),
    ]
    expect(groupsMatchBucketCounts(followUps, NOW)).toBe(true)
    const groups = groupFollowUps(followUps, NOW)
    const counts = bucketFollowUps(followUps, NOW)
    expect(groups.overdue).toHaveLength(counts.overdue)
    expect(groups.today).toHaveLength(counts.today)
    expect(groups.overdue.map((item) => item.id)).toEqual(['1'])
  })
})
