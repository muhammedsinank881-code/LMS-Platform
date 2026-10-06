import { describe, expect, it } from 'vitest'
import { makeDeal, makeLead } from '@/test/factories'
import type { ConditionGroup } from '@/types'
import { evaluateConditions } from './conditions'
import type { AutomationContext } from './fields'

const NOW = new Date('2026-09-10T10:00:00.000Z')

function ctx(overrides: Partial<AutomationContext> = {}): AutomationContext {
  return {
    now: NOW,
    lead: makeLead({ sourceId: 'source-facebook', budget: 150_000, tags: ['VIP'], productInterest: 'Website' }),
    deal: null,
    owner: null,
    source: { id: 'source-facebook', key: 'facebook', name: 'Facebook' },
    campaign: null,
    teamOf: () => null,
    withinBusinessHours: true,
    ...overrides,
  }
}

const group = (logic: 'and' | 'or', ...items: ConditionGroup['items']): ConditionGroup => ({ logic, items })

describe('evaluateConditions', () => {
  it('matches an empty group', () => {
    expect(evaluateConditions(group('and'), ctx()).matched).toBe(true)
  })

  it('combines with AND', () => {
    const g = group(
      'and',
      { field: 'sourceId', operator: 'equals', value: 'source-facebook' },
      { field: 'budget', operator: 'gt', value: 100_000 },
    )
    expect(evaluateConditions(g, ctx()).matched).toBe(true)
    const failing = group('and', g.items[0], { field: 'budget', operator: 'gt', value: 200_000 })
    expect(evaluateConditions(failing, ctx()).matched).toBe(false)
  })

  it('combines with OR', () => {
    const g = group(
      'or',
      { field: 'sourceId', operator: 'equals', value: 'source-google' },
      { field: 'tags', operator: 'contains', value: 'vip' },
    )
    expect(evaluateConditions(g, ctx()).matched).toBe(true)
  })

  it('supports nested groups', () => {
    const g = group(
      'and',
      { field: 'sourceId', operator: 'equals', value: 'source-facebook' },
      group(
        'or',
        { field: 'productInterest', operator: 'equals', value: 'SEO' },
        { field: 'productInterest', operator: 'equals', value: 'Website' },
      ),
    )
    expect(evaluateConditions(g, ctx()).matched).toBe(true)
  })

  it('treats missing fields and entities as not matching', () => {
    const noDeal = group('and', { field: 'deal.value', operator: 'gt', value: 1 })
    const result = evaluateConditions(noDeal, ctx())
    expect(result.matched).toBe(false)
    expect(result.trace[0].reason).toMatch(/not available/)
    expect(evaluateConditions(group('and', { field: 'nope', operator: 'equals', value: 1 }), ctx()).matched).toBe(false)
  })

  it('coerces numeric strings', () => {
    const g = group('and', { field: 'budget', operator: 'gt', value: '100000' })
    expect(evaluateConditions(g, ctx()).matched).toBe(true)
  })

  it('reads related entities', () => {
    const deal = makeDeal({ value: 500_000 })
    const g = group(
      'and',
      { field: 'deal.value', operator: 'gt', value: 100_000 },
      { field: 'campaign.platform', operator: 'equals', value: 'facebook' },
      { field: 'owner.role', operator: 'equals', value: 'salesperson' },
      { field: 'time.businessHours', operator: 'equals', value: true },
    )
    const result = evaluateConditions(
      g,
      ctx({
        deal,
        campaign: { id: 'c', platform: 'facebook', name: 'C' },
        owner: { id: 'u', role: 'salesperson', teamId: null, location: null },
      }),
    )
    expect(result.matched).toBe(true)
    expect(evaluateConditions(g, ctx({ withinBusinessHours: false })).matched).toBe(false)
  })

  it('explains each failed condition', () => {
    const g = group('and', { field: 'budget', operator: 'gt', value: 200_000 })
    const [trace] = evaluateConditions(g, ctx()).trace
    expect(trace).toMatchObject({ matched: false })
    expect(trace.reason).toBe('Budget is 1,50,000')
  })

  it('reads engagement counters and custom fields', () => {
    const lead = makeLead({
      customFields: { plan: 'pro' },
      engagement: {
        whatsappReplies: 2,
        emailOpens: 0,
        demosAttended: 0,
        quotationRequests: 0,
        formSubmissions: 0,
        websiteVisits: 0,
        lastActivityAt: null,
      },
    })
    const g = group(
      'and',
      { field: 'engagement.whatsappReplies', operator: 'gt', value: 1 },
      { field: 'custom.plan', operator: 'equals', value: 'pro' },
    )
    expect(evaluateConditions(g, ctx({ lead })).matched).toBe(true)
  })
})
