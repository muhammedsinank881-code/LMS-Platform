import { describe, expect, it } from 'vitest'
import { calendarDayKey, rangeForPreset } from './date-range'
import {
  avgDealValue,
  averageResponseTime,
  conversionRate,
  followUpCompletionRate,
  groupBy,
  groupByDay,
  groupSeries,
  percentChange,
  previousPeriod,
  sumPerformance,
  winRate,
} from './report-metrics'

describe('previousPeriod', () => {
  it('returns an equal-length window that ends 1 ms before the range starts', () => {
    const range = { from: '2026-03-10T00:00:00.000Z', to: '2026-03-20T00:00:00.000Z' }
    const previous = previousPeriod(range)
    expect(previous).not.toBeNull()
    if (!previous) return
    const span = Date.parse(range.to) - Date.parse(range.from)
    expect(Date.parse(previous.to) - Date.parse(previous.from)).toBe(span)
    expect(Date.parse(previous.to)).toBe(Date.parse(range.from) - 1)
    expect(previous.from < range.from).toBe(true)
  })

  it('crosses a month boundary for a custom range', () => {
    const previous = previousPeriod({
      from: '2026-03-01T00:00:00.000Z',
      to: '2026-03-10T00:00:00.000Z',
    })
    expect(previous?.from.startsWith('2026-02-')).toBe(true)
  })

  it('returns null for an empty or invalid range', () => {
    expect(previousPeriod({ from: '2026-01-02T00:00:00.000Z', to: '2026-01-02T00:00:00.000Z' })).toBeNull()
    expect(previousPeriod({ from: '2026-02-01T00:00:00.000Z', to: '2026-01-01T00:00:00.000Z' })).toBeNull()
    expect(previousPeriod({ from: 'nope', to: '2026-01-02T00:00:00.000Z' })).toBeNull()
    expect(previousPeriod({ from: '', to: '' })).toBeNull()
  })
})

describe('percentChange and conversionRate', () => {
  it('returns null when the previous value or the total is zero', () => {
    expect(percentChange(5, 0)).toBeNull()
    expect(percentChange(0, 0)).toBeNull()
    expect(percentChange(Number.NaN, 10)).toBeNull()
    expect(conversionRate(1, 0)).toBeNull()
    expect(conversionRate(0, 0)).toBeNull()
  })

  it('computes a signed percent and a zero conversion', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
    expect(conversionRate(0, 4)).toBe(0)
    expect(conversionRate(1, 4)).toBe(25)
  })
})

describe('groupByDay', () => {
  const range = { from: '2026-01-30T18:30:00.000Z', to: '2026-02-02T18:29:59.999Z' }

  it('fills missing days with zero and crosses a month boundary in Asia/Kolkata', () => {
    const points = groupByDay(
      [{ createdAt: '2026-01-31T18:30:00.000Z' }, { createdAt: null }],
      range,
      'createdAt',
    )
    expect(points.map((point) => point.date)).toEqual(['2026-01-31', '2026-02-01', '2026-02-02'])
    expect(points.map((point) => point.count)).toEqual([0, 1, 0])
  })

  it('counts an instant before UTC midnight on the next Kolkata day', () => {
    expect(calendarDayKey('2026-10-04T19:00:00.000Z')).toBe('2026-10-05')
    const day = { from: '2026-10-04T18:30:00.000Z', to: '2026-10-06T18:29:59.999Z' }
    const points = groupByDay([{ at: '2026-10-04T19:00:00.000Z' }], day, 'at')
    expect(points).toEqual([
      { date: '2026-10-05', count: 1 },
      { date: '2026-10-06', count: 0 },
    ])
  })

  it('returns an empty series for an invalid range', () => {
    expect(groupByDay([{ createdAt: '2026-01-01T00:00:00.000Z' }], { from: 'bad', to: 'bad' }, 'createdAt')).toEqual([])
    expect(groupByDay([], { from: '2026-05-02T00:00:00.000Z', to: '2026-05-01T00:00:00.000Z' }, 'createdAt')).toEqual([])
  })
})

describe('groupBy and rates', () => {
  it('groups items by a key', () => {
    const groups = groupBy([{ id: 'a', city: 'Pune' }, { id: 'b', city: 'Pune' }, { id: 'c', city: 'Jaipur' }], (item) => item.city)
    expect(groups.get('Pune')?.map((item) => item.id)).toEqual(['a', 'b'])
    expect(groups.get('Jaipur')).toHaveLength(1)
  })

  it('averages response time and ignores nulls', () => {
    expect(averageResponseTime([])).toBeNull()
    expect(averageResponseTime([{ firstResponseTimeMins: null }])).toBeNull()
    expect(averageResponseTime([{ firstResponseTimeMins: 10 }, { firstResponseTimeMins: null }, { firstResponseTimeMins: 30 }])).toBe(20)
  })

  it('computes win rate, completion, and average deal value', () => {
    expect(winRate([])).toBeNull()
    expect(winRate([{ outcome: 'open' }])).toBeNull()
    expect(winRate([{ outcome: 'won' }, { outcome: 'lost' }, { outcome: 'open' }])).toBe(50)
    expect(followUpCompletionRate([])).toBeNull()
    expect(followUpCompletionRate([{ status: 'done' }, { status: 'pending' }])).toBe(50)
    expect(avgDealValue([])).toBeNull()
    expect(avgDealValue([{ value: 100 }, { value: 300 }])).toBe(200)
  })
})

describe('groupSeries and sumPerformance', () => {
  it('rolls daily counts into a week and a month', () => {
    const days = [
      { date: '2026-03-01', count: 1 },
      { date: '2026-03-02', count: 2 },
      { date: '2026-03-08', count: 4 },
    ]
    expect(groupSeries(days, 'day', (point) => point.count, (date, count) => ({ date, count }))).toEqual(days)
    expect(groupSeries(days, 'week', (point) => point.count, (date, count) => ({ date, count }))).toEqual([
      { date: '2026-02-23', count: 1 },
      { date: '2026-03-02', count: 6 },
    ])
    expect(groupSeries(days, 'month', (point) => point.count, (date, count) => ({ date, count }))).toEqual([
      { date: '2026-03', count: 7 },
    ])
  })

  it('sums additive columns and weights the rates', () => {
    const total = sumPerformance([
      {
        userId: 'a',
        name: 'A',
        leadsAssigned: 4,
        leadsContacted: 2,
        followUpsDone: 1,
        qualified: 1,
        proposals: 1,
        won: 1,
        lost: 0,
        revenue: 100,
        conversionRate: 50,
        avgResponseTimeMins: 10,
      },
      {
        userId: 'b',
        name: 'B',
        leadsAssigned: 6,
        leadsContacted: 2,
        followUpsDone: 3,
        qualified: 2,
        proposals: 0,
        won: 2,
        lost: 1,
        revenue: 50,
        conversionRate: 25,
        avgResponseTimeMins: 30,
      },
    ])
    expect(total.leadsAssigned).toBe(10)
    expect(total.revenue).toBe(150)
    expect(total.won).toBe(3)
    expect(total.conversionRate).toBe(35)
    expect(total.avgResponseTimeMins).toBe(20)
  })
})

describe('range presets', () => {
  const now = new Date('2026-10-04T06:00:00.000Z')

  it('places last month on the previous calendar month in Kolkata', () => {
    const range = rangeForPreset('last_month', now)
    expect(calendarDayKey(range.from)).toBe('2026-09-01')
    expect(calendarDayKey(range.to)).toBe('2026-09-30')
  })

  it('starts this quarter on the first day of the quarter', () => {
    expect(calendarDayKey(rangeForPreset('this_quarter', now).from)).toBe('2026-10-01')
    expect(calendarDayKey(rangeForPreset('this_month', new Date('2026-03-15T06:00:00.000Z')).from)).toBe('2026-03-01')
  })
})
