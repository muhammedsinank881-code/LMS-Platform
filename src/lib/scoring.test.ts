import { describe, expect, it } from 'vitest'
import { makeLead, makeScoringRule } from '@/test/factories'
import {
  calculateLeadScore,
  categoryForScore,
  DEFAULT_SCORING_THRESHOLDS,
  describeScoringRule,
  scoreDistribution,
} from './scoring'

const NOW = new Date(2026, 9, 7, 10)

const rules = [
  makeScoringRule({
    id: 'r-fb',
    name: 'Facebook source',
    order: 1,
    points: 10,
    conditions: [{ field: 'sourceId', operator: 'equals', value: 'source-facebook' }],
  }),
  makeScoringRule({
    id: 'r-budget',
    name: 'Budget above ₹1L',
    order: 2,
    points: 20,
    conditions: [{ field: 'budget', operator: 'gt', value: 100_000 }],
  }),
  makeScoringRule({
    id: 'r-email',
    name: 'Has email',
    order: 3,
    points: 10,
    conditions: [{ field: 'email', operator: 'is_not_empty' }],
  }),
  makeScoringRule({
    id: 'r-import',
    name: 'Imported list',
    order: 4,
    points: -15,
    conditions: [{ field: 'sourceId', operator: 'equals', value: 'source-import' }],
  }),
]

describe('calculateLeadScore', () => {
  it('sums matching rules and explains each one', () => {
    const lead = makeLead({ sourceId: 'source-facebook', budget: 250_000, email: 'a@b.in' })
    const result = calculateLeadScore(lead, rules, DEFAULT_SCORING_THRESHOLDS, NOW)

    expect(result.score).toBe(40)
    expect(result.category).toBe('warm')
    expect(result.breakdown).toEqual([
      { rule: { id: 'r-fb', name: 'Facebook source' }, points: 10 },
      { rule: { id: 'r-budget', name: 'Budget above ₹1L' }, points: 20 },
      { rule: { id: 'r-email', name: 'Has email' }, points: 10 },
    ])
  })

  it('returns cold with an empty breakdown when nothing matches', () => {
    const result = calculateLeadScore(makeLead(), rules, undefined, NOW)
    expect(result).toEqual({ score: 0, category: 'cold', breakdown: [] })
  })

  it('applies negative points but never goes below 0', () => {
    const result = calculateLeadScore(
      makeLead({ sourceId: 'source-import' }),
      rules,
      undefined,
      NOW,
    )
    expect(result.score).toBe(0)
    expect(result.breakdown).toEqual([
      { rule: { id: 'r-import', name: 'Imported list' }, points: -15 },
    ])
  })

  it('caps the score at 100', () => {
    const big = [
      makeScoringRule({ points: 80 }),
      makeScoringRule({ id: 'r2', points: 80, order: 2 }),
    ]
    expect(calculateLeadScore(makeLead(), big, undefined, NOW).score).toBe(100)
  })

  it('skips inactive rules', () => {
    const inactive = [makeScoringRule({ isActive: false, points: 50 })]
    expect(calculateLeadScore(makeLead(), inactive, undefined, NOW).score).toBe(0)
  })

  it('requires every condition of a rule (AND)', () => {
    const both = makeScoringRule({
      points: 30,
      conditions: [
        { field: 'sourceId', operator: 'equals', value: 'source-facebook' },
        { field: 'budget', operator: 'gt', value: 100_000 },
      ],
    })
    expect(
      calculateLeadScore(
        makeLead({ sourceId: 'source-facebook', budget: 1 }),
        [both],
        undefined,
        NOW,
      ).score,
    ).toBe(0)
    expect(
      calculateLeadScore(
        makeLead({ sourceId: 'source-facebook', budget: 2e5 }),
        [both],
        undefined,
        NOW,
      ).score,
    ).toBe(30)
  })

  it('works on unsaved drafts with missing fields', () => {
    expect(calculateLeadScore({ budget: 500_000 }, rules, undefined, NOW).score).toBe(20)
  })

  it('uses custom thresholds', () => {
    const lead = makeLead({ budget: 250_000 })
    expect(calculateLeadScore(lead, rules, { hot: 20, warm: 10 }, NOW).category).toBe('hot')
  })
})

describe('categoryForScore', () => {
  it.each([
    [100, 'hot'],
    [70, 'hot'],
    [69, 'warm'],
    [40, 'warm'],
    [39, 'cold'],
    [0, 'cold'],
  ])('%i is %s', (score, category) => {
    expect(categoryForScore(score)).toBe(category)
  })
})

describe('repeat caps', () => {
  const replied = makeScoringRule({
    id: 'r-replied',
    name: 'WhatsApp replied',
    order: 1,
    points: 5,
    maxApplications: 3,
    repeatField: 'engagement.whatsappReplies',
    conditions: [{ field: 'engagement.whatsappReplies', operator: 'gt', value: 0 }],
  })
  const engaged = (whatsappReplies: number) =>
    makeLead({
      engagement: { whatsappReplies, emailOpens: 0, demosAttended: 0, quotationRequests: 0, formSubmissions: 0, websiteVisits: 0, lastActivityAt: null },
    })

  it('repeats per signal up to the cap', () => {
    expect(calculateLeadScore(engaged(2), [replied], undefined, NOW).score).toBe(10)
    expect(calculateLeadScore(engaged(9), [replied], undefined, NOW).score).toBe(15)
    expect(calculateLeadScore(engaged(0), [replied], undefined, NOW).breakdown).toEqual([])
  })

  it('applies once by default, however many signals there are', () => {
    const once = { ...replied, maxApplications: 'once' as const, repeatField: null }
    expect(calculateLeadScore(engaged(9), [once], undefined, NOW).score).toBe(5)
  })

  it('shows the repeated total in the breakdown', () => {
    expect(calculateLeadScore(engaged(2), [replied], undefined, NOW).breakdown).toEqual([
      { rule: { id: 'r-replied', name: 'WhatsApp replied' }, points: 10 },
    ])
  })
})

describe('negative points', () => {
  it('subtracts but the total never goes below 0 or above 100', () => {
    const low = [makeScoringRule({ points: -30 })]
    expect(calculateLeadScore(makeLead(), low, undefined, NOW).score).toBe(0)
    const high = [makeScoringRule({ points: 80 }), makeScoringRule({ id: 'b', order: 2, points: 80 })]
    expect(calculateLeadScore(makeLead(), high, undefined, NOW).score).toBe(100)
  })
})

describe('score decay', () => {
  const rules = [makeScoringRule({ points: 50 })]
  const decay = { enabled: true, afterDays: 14, points: 10 }
  const lead = (lastContactedAt: string) => makeLead({ lastContactedAt, createdAt: '2026-01-01T00:00:00.000Z' })

  it('removes points once the lead has been inactive past the limit', () => {
    const stale = calculateLeadScore(lead('2026-09-01T00:00:00.000Z'), rules, undefined, NOW, { decay })
    expect(stale.score).toBe(40)
    expect(stale.breakdown.at(-1)).toMatchObject({ points: -10, rule: { id: 'decay' } })
  })

  it('leaves recently active leads alone, and does nothing when disabled', () => {
    expect(calculateLeadScore(lead('2026-10-05T00:00:00.000Z'), rules, undefined, NOW, { decay }).score).toBe(50)
    expect(calculateLeadScore(lead('2026-09-01T00:00:00.000Z'), rules, undefined, NOW, { decay: { ...decay, enabled: false } }).score).toBe(50)
  })

  it('counts an engagement signal as activity', () => {
    const active = makeLead({
      lastContactedAt: '2026-09-01T00:00:00.000Z',
      engagement: { whatsappReplies: 0, emailOpens: 1, demosAttended: 0, quotationRequests: 0, formSubmissions: 0, websiteVisits: 0, lastActivityAt: '2026-10-06T00:00:00.000Z' },
    })
    expect(calculateLeadScore(active, rules, undefined, NOW, { decay }).score).toBe(50)
  })
})

describe('thresholds, distribution and rule text', () => {
  it('categorizes at the boundaries of custom thresholds', () => {
    const t = { hot: 80, warm: 50 }
    expect([49, 50, 79, 80].map((s) => categoryForScore(s, t))).toEqual(['cold', 'warm', 'warm', 'hot'])
  })

  it('counts leads per category under given thresholds', () => {
    const leads = [10, 45, 55, 75, 95].map((score) => ({ score }))
    expect(scoreDistribution(leads, { hot: 70, warm: 40 })).toEqual({ hot: 2, warm: 2, cold: 1, total: 5 })
    expect(scoreDistribution(leads, { hot: 90, warm: 50 })).toEqual({ hot: 1, warm: 2, cold: 2, total: 5 })
  })

  it('describes a rule in plain language', () => {
    expect(describeScoringRule(makeScoringRule({ points: 20, conditions: [{ field: 'budget', operator: 'gt', value: 100000 }] }))).toBe('Budget greater than 1,00,000: +20')
    expect(describeScoringRule(makeScoringRule({ points: -10, conditions: [] }))).toBe('Every lead: -10')
  })
})
