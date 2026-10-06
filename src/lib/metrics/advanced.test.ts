import { describe, expect, it } from 'vitest'
import {
  attributionKey,
  campaignInsights,
  avgDaysInStage,
  bucketResponseTime,
  budgetUsage,
  buildCohortTable,
  buildTargetRows,
  cac,
  computeMetrics,
  conversionPct,
  cpl,
  costPerQualified,
  findStuck,
  forecastRanges,
  histogramBins,
  monthElapsed,
  pacingStatus,
  paceStatus,
  projectSpend,
  responseDistribution,
  roas,
  redactSpend,
  roundMoney,
  speedVsConversion,
  sumMetrics,
  targetPercent,
  timeToClose,
  underperformerFlags,
} from './index'

describe('campaign ratios', () => {
  it('divides spend by the right denominator', () => {
    expect(cpl(1000, 4)).toBe(250)
    expect(cac(1000, 2)).toBe(500)
    expect(roas(3000, 1000)).toBe(3)
    expect(costPerQualified(900, 3)).toBe(300)
    expect(conversionPct(1, 4)).toBe(25)
  })

  it('returns null instead of Infinity or NaN on zero denominators', () => {
    expect(cpl(1000, 0)).toBeNull()
    expect(cac(1000, 0)).toBeNull()
    expect(roas(1000, 0)).toBeNull()
    expect(costPerQualified(1000, 0)).toBeNull()
    expect(conversionPct(1, 0)).toBeNull()
    expect(cpl(Number.NaN, 3)).toBeNull()
  })

  it('rounds currency to 2 decimals', () => {
    expect(cpl(100, 3)).toBe(33.33)
    expect(roas(200, 3)).toBe(66.67)
    expect(roundMoney(1.005)).toBe(1.01)
    expect(roundMoney(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('budget pacing', () => {
  it('warns above 80% and flags above 100%', () => {
    expect(budgetUsage(50, 100).state).toBe('ok')
    expect(budgetUsage(80, 100).state).toBe('ok')
    expect(budgetUsage(81, 100).state).toBe('warning')
    expect(budgetUsage(100, 100).state).toBe('warning')
    expect(budgetUsage(101, 100)).toMatchObject({ state: 'over', percent: 101 })
  })

  it('has no percentage without a budget', () => {
    expect(budgetUsage(10, 0)).toEqual({ percent: null, state: 'ok' })
  })

  it('projects spend at the end date from the daily rate so far', () => {
    const today = new Date('2026-01-10T12:00:00Z')
    expect(projectSpend(1000, '2026-01-01T00:00:00Z', '2026-01-30T00:00:00Z', today)).toBe(3000)
  })

  it('has no projection without an end date, before the start, or with a bad range', () => {
    const today = new Date('2026-01-10T00:00:00Z')
    expect(projectSpend(1000, '2026-01-01T00:00:00Z', null, today)).toBeNull()
    expect(projectSpend(1000, '2026-02-01T00:00:00Z', '2026-03-01T00:00:00Z', today)).toBeNull()
    expect(projectSpend(1000, '2026-03-01T00:00:00Z', '2026-02-01T00:00:00Z', today)).toBeNull()
  })

  it('returns what was spent once the campaign has ended', () => {
    const today = new Date('2026-03-01T00:00:00Z')
    expect(projectSpend(1234, '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z', today)).toBe(1234)
  })

  it('compares the projection with the budget', () => {
    expect(pacingStatus(1100, 1000)).toBe('over')
    expect(pacingStatus(1000, 1000)).toBe('on_track')
    expect(pacingStatus(500, 1000)).toBe('under')
    expect(pacingStatus(null, 1000)).toBeNull()
    expect(pacingStatus(500, 0)).toBeNull()
  })
})

describe('underperformerFlags', () => {
  it('flags a CPL above 1.5x the tenant average and a ROAS under 1', () => {
    const flags = underperformerFlags({ spend: 1000, cpl: 400, roas: 0.5 }, 200)
    expect(flags.map((f) => f.code)).toEqual(['high_cpl', 'low_roas'])
    expect(flags.every((f) => f.reason.length > 0)).toBe(true)
  })

  it('does not flag healthy, unspent or hidden campaigns', () => {
    expect(underperformerFlags({ spend: 1000, cpl: 250, roas: 2 }, 200)).toEqual([])
    expect(underperformerFlags({ spend: 0, cpl: null, roas: null }, 200)).toEqual([])
    expect(underperformerFlags({ spend: null, cpl: null, roas: null }, 200)).toEqual([])
    expect(underperformerFlags({ spend: 100, cpl: 999, roas: 3 }, null)).toEqual([])
  })
})

describe('velocity', () => {
  const now = new Date('2026-01-31T00:00:00Z')

  it('averages days per stage, counting open visits up to now', () => {
    const result = avgDaysInStage(
      [
        { stageId: 'a', enteredAt: '2026-01-01T00:00:00Z', exitedAt: '2026-01-05T00:00:00Z' },
        { stageId: 'a', enteredAt: '2026-01-01T00:00:00Z', exitedAt: '2026-01-03T00:00:00Z' },
        { stageId: 'b', enteredAt: '2026-01-21T00:00:00Z' },
      ],
      ['a', 'b', 'c'],
      now,
    )
    expect(result).toEqual({ a: 3, b: 10, c: null })
  })

  it('computes time to close, null while open', () => {
    expect(timeToClose('2026-01-01T00:00:00Z', '2026-01-11T00:00:00Z')).toBe(10)
    expect(timeToClose('2026-01-01T00:00:00Z', null)).toBeNull()
  })

  it('bins values with an open-ended last bin and handles empty input', () => {
    const bins = histogramBins([1, 7, 8, 30, 200])
    expect(bins.map((b) => b.count)).toEqual([2, 1, 1, 0, 0, 1])
    expect(bins[0]?.label).toBe('0-7d')
    expect(bins[5]?.label).toBe('91d+')
    expect(histogramBins([]).every((b) => b.count === 0)).toBe(true)
  })

  it('finds items stuck past the threshold, longest first', () => {
    const items = [
      { id: 'x', stageEnteredAt: '2026-01-25T00:00:00Z' },
      { id: 'y', stageEnteredAt: '2026-01-01T00:00:00Z' },
      { id: 'z', stageEnteredAt: '2026-01-10T00:00:00Z' },
    ]
    expect(findStuck(items, 14, now).map((i) => i.id)).toEqual(['y', 'z'])
    expect(findStuck([], 14, now)).toEqual([])
  })
})

describe('buildCohortTable', () => {
  const now = new Date('2026-06-15T00:00:00Z')

  it('shows the share converted within each window and hides windows not yet elapsed', () => {
    const rows = buildCohortTable(
      [
        { createdAt: '2026-01-05T00:00:00Z', convertedAt: '2026-01-20T00:00:00Z' },
        { createdAt: '2026-01-10T00:00:00Z', convertedAt: '2026-03-01T00:00:00Z' },
        { createdAt: '2026-01-12T00:00:00Z', convertedAt: null },
        { createdAt: '2026-01-15T00:00:00Z', convertedAt: null },
        { createdAt: '2026-05-20T00:00:00Z', convertedAt: null },
      ],
      now,
    )
    expect(rows[0]).toMatchObject({ month: '2026-01', leads: 4, d30: 25, d60: 50, d90: 50 })
    expect(rows[1]).toMatchObject({ month: '2026-05', leads: 1, d30: null, d60: null, d90: null })
  })

  it('is empty for no leads', () => {
    expect(buildCohortTable([], now)).toEqual([])
  })
})

describe('response time', () => {
  it('buckets by the documented boundaries', () => {
    expect(bucketResponseTime(0)).toBe('lt5m')
    expect(bucketResponseTime(4.9)).toBe('lt5m')
    expect(bucketResponseTime(5)).toBe('lt15m')
    expect(bucketResponseTime(15)).toBe('lt1h')
    expect(bucketResponseTime(60)).toBe('lt4h')
    expect(bucketResponseTime(240)).toBe('gt4h')
    expect(bucketResponseTime(null)).toBeNull()
    expect(bucketResponseTime(-1)).toBeNull()
  })

  it('counts a distribution and skips leads never answered', () => {
    expect(responseDistribution([1, 2, 10, 500, null])).toEqual({
      lt5m: 2,
      lt15m: 1,
      lt1h: 0,
      lt4h: 0,
      gt4h: 1,
    })
  })

  it('pairs each bucket with its conversion rate', () => {
    const points = speedVsConversion([
      { firstResponseTimeMins: 2, won: true },
      { firstResponseTimeMins: 3, won: false },
      { firstResponseTimeMins: 600, won: false },
    ])
    expect(points[0]).toEqual({ bucket: 'lt5m', leads: 2, conversionRate: 50 })
    expect(points[1]?.conversionRate).toBeNull()
    expect(points[4]).toEqual({ bucket: 'gt4h', leads: 1, conversionRate: 0 })
  })
})

describe('forecastRanges', () => {
  const deals = [
    { value: 1000, probability: 90, expectedCloseDate: '2026-03-10T00:00:00Z' },
    { value: 2000, probability: 60, expectedCloseDate: '2026-03-20T00:00:00Z' },
    { value: 4000, probability: 20, expectedCloseDate: '2026-03-25T00:00:00Z' },
    { value: 500, probability: 80, expectedCloseDate: '2026-04-02T00:00:00Z' },
  ]

  it('derives worst, commit and best from stage probabilities', () => {
    const [march, april] = forecastRanges(deals)
    expect(march).toMatchObject({ month: '2026-03', deals: 3, weighted: 2900, worst: 900, commit: 1000, best: 3000 })
    expect(april).toMatchObject({ month: '2026-04', worst: 400, commit: 500, best: 500 })
  })

  it('keeps worst <= commit <= best and ignores empty or zero-value deals', () => {
    for (const row of forecastRanges(deals)) {
      expect(row.worst).toBeLessThanOrEqual(row.commit)
      expect(row.commit).toBeLessThanOrEqual(row.best)
    }
    expect(forecastRanges([])).toEqual([])
    expect(forecastRanges([{ value: 0, probability: 90, expectedCloseDate: '2026-03-10T00:00:00Z' }])).toEqual([])
  })
})

describe('attributionKey', () => {
  const platformOf = (id: string) => (id === 'c1' ? 'google_ads' : null)

  it('credits first touch to the original source', () => {
    const lead = { sourceId: 'whatsapp', originalSourceId: 'facebook', campaignId: 'c1' }
    expect(attributionKey(lead, 'first', platformOf)).toBe('facebook')
    expect(attributionKey({ sourceId: 'whatsapp', campaignId: null }, 'first', platformOf)).toBe('whatsapp')
  })

  it('credits last touch to the latest campaign platform, else the current source', () => {
    const lead = { sourceId: 'whatsapp', originalSourceId: 'facebook', campaignId: 'c1' }
    expect(attributionKey(lead, 'last', platformOf)).toBe('google_ads')
    expect(attributionKey({ ...lead, campaignId: null }, 'last', platformOf)).toBe('whatsapp')
    expect(attributionKey({ ...lead, campaignId: 'gone' }, 'last', platformOf)).toBe('whatsapp')
  })
})

describe('targets', () => {
  it('measures how much of the month has passed', () => {
    expect(monthElapsed('2026-01', new Date('2025-12-31T00:00:00Z'))).toBe(0)
    expect(monthElapsed('2026-01', new Date('2026-02-02T00:00:00Z'))).toBe(1)
    expect(monthElapsed('2026-01', new Date('2026-01-16T12:00:00Z'))).toBeCloseTo(0.5, 1)
    expect(monthElapsed('bad', new Date())).toBe(0)
  })

  it('computes percent of target and null without one', () => {
    expect(targetPercent(50, 200)).toBe(25)
    expect(targetPercent(300, 200)).toBe(150)
    expect(targetPercent(10, 0)).toBeNull()
  })

  it('classifies pace against the straight line', () => {
    expect(paceStatus(70, 0.5)).toBe('ahead')
    expect(paceStatus(50, 0.5)).toBe('on_track')
    expect(paceStatus(30, 0.5)).toBe('behind')
    expect(paceStatus(null, 0.5)).toBeNull()
    expect(paceStatus(0, 0)).toBe('on_track')
  })

  it('builds a row per metric', () => {
    const rows = buildTargetRows(
      { revenue: 1000, dealsWon: 0, leadsContacted: 20 },
      { revenue: 800, dealsWon: 2, leadsContacted: 5 },
      '2026-01',
      new Date('2026-01-16T12:00:00Z'),
    )
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ metric: 'revenue', percent: 80, pace: 'ahead' })
    expect(rows[1]).toMatchObject({ metric: 'dealsWon', percent: null, pace: null })
    expect(rows[2]?.pace).toBe('behind')
  })
})

describe('computeMetrics, sumMetrics and redactSpend', () => {
  const stages = [
    { id: 'won', type: 'won' as const },
    { id: 'open', type: 'open' as const },
  ]
  const leads = [
    { id: 'L-1' as const, qualificationStatus: 'qualified' as const },
    { id: 'L-2' as const, qualificationStatus: 'needs_info' as const },
  ]
  const deals = [
    { leadId: 'L-1' as const, value: 90_000.456, stageId: 'won' },
    { leadId: 'L-2' as const, value: 10_000, stageId: 'open' },
    { leadId: 'L-9' as const, value: 5, stageId: 'won' },
  ]

  it('computes the funnel for a pre-filtered set of leads and rounds money', () => {
    const m = computeMetrics(100_000.999, leads, deals, stages)
    expect(m).toMatchObject({ leads: 2, qualified: 1, deals: 2, wonDeals: 1, revenue: 90_000.46 })
    expect(m.spend).toBe(100_001)
    expect(m.cpl).toBe(50_000.5)
    expect(m.roas).toBe(0.9)
  })

  it('has no ratios for an empty set and zero spend', () => {
    const m = computeMetrics(0, [], [], stages)
    expect(m).toMatchObject({ leads: 0, cpl: null, cac: null, roas: null, costPerQualified: null, conversionRate: null })
  })

  it('sums rows and recomputes ratios from the totals instead of averaging them', () => {
    const a = computeMetrics(1000, [leads[0]!], deals, stages)
    const b = computeMetrics(3000, [leads[1]!], deals, stages)
    const total = sumMetrics([a, b])
    expect(total.spend).toBe(4000)
    expect(total.leads).toBe(2)
    expect(total.cpl).toBe(2000)
    expect(sumMetrics([])).toMatchObject({ leads: 0, cpl: null, roas: null })
  })

  it('stays hidden when any row is hidden, and redacts only spend-derived fields', () => {
    const a = computeMetrics(1000, leads, deals, stages)
    const hidden = redactSpend(a)
    expect(hidden).toMatchObject({ spend: null, revenue: null, cpl: null, roas: null, leads: 2, qualified: 1 })
    expect(sumMetrics([a, hidden]).spend).toBeNull()
  })
})

describe('campaignInsights', () => {
  const base = computeMetrics(10_000, [{ id: 'L-1' as const, qualificationStatus: 'qualified' as const }], [], [])
  const input = { metrics: base, tenantAvgCpl: 5_000, status: 'active' as const, budget: 100_000, spent: 10_000, projectedSpend: 20_000 }

  it('calls out a high CPL, a ROAS under 1 and an over-budget campaign', () => {
    const texts = campaignInsights({ ...input, spent: 120_000 }).map((i) => i.text).join(' ')
    expect(texts).toMatch(/Over budget by/)
    expect(texts).toMatch(/above the workspace average/)
    expect(texts).toMatch(/not paying for itself/)
  })

  it('leaves spend advice out when spend is hidden', () => {
    const hidden = campaignInsights({ ...input, metrics: redactSpend(base), spent: null, projectedSpend: null })
    expect(hidden.some((i) => /budget|₹/.test(i.text))).toBe(false)
  })

  it('warns about an active campaign with no leads', () => {
    const empty = computeMetrics(0, [], [], [])
    expect(campaignInsights({ ...input, metrics: empty })[0]).toMatchObject({ tone: 'warn' })
  })
});
