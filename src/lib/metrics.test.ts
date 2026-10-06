import { describe, expect, it } from 'vitest'
import { makeDeal, makeLead, makeStage } from '@/test/factories'
import { computeCampaignMetrics, computePipelineValue, summarizeDeals } from './metrics'

const stages = [
  makeStage({ id: 'new', order: 1, probability: 10, type: 'open' }),
  makeStage({ id: 'proposal', order: 2, probability: 50, type: 'open' }),
  makeStage({ id: 'won', order: 3, probability: 100, type: 'won' }),
  makeStage({ id: 'lost', order: 4, probability: 0, type: 'lost' }),
]

describe('computeCampaignMetrics', () => {
  const campaign = { id: 'camp-1', spend: 100_000 }
  const leads = [
    makeLead({ id: 'L-10001', campaignId: 'camp-1', qualificationStatus: 'qualified' }),
    makeLead({ id: 'L-10002', campaignId: 'camp-1', qualificationStatus: 'qualified' }),
    makeLead({ id: 'L-10003', campaignId: 'camp-1', qualificationStatus: 'needs_info' }),
    makeLead({ id: 'L-10004', campaignId: 'camp-1', qualificationStatus: 'not_qualified' }),
    makeLead({ id: 'L-10005', campaignId: 'camp-other', qualificationStatus: 'qualified' }),
    makeLead({ id: 'L-10006', campaignId: 'camp-1', archivedAt: '2026-09-01T00:00:00Z' }),
  ]
  const deals = [
    makeDeal({ leadId: 'L-10001', value: 300_000, stageId: 'won' }),
    makeDeal({ leadId: 'L-10002', value: 200_000, stageId: 'proposal' }),
    makeDeal({ leadId: 'L-10005', value: 999_999, stageId: 'won' }),
  ]

  it('computes funnel counts, CPL, CAC, ROAS and conversion rate', () => {
    expect(computeCampaignMetrics(campaign, leads, deals, stages)).toEqual({
      spend: 100_000,
      costPerQualified: 50_000,
      leads: 4,
      qualified: 2,
      deals: 2,
      wonDeals: 1,
      revenue: 300_000,
      cpl: 25_000,
      cac: 100_000,
      roas: 3,
      conversionRate: 25,
    })
  })

  it('returns null ratios instead of Infinity when there is nothing to divide by', () => {
    const metrics = computeCampaignMetrics({ id: 'camp-empty', spend: 5_000 }, leads, deals, stages)
    expect(metrics).toMatchObject({ leads: 0, cpl: null, cac: null, conversionRate: null, roas: 0 })

    const noSpend = computeCampaignMetrics({ id: 'camp-1', spend: 0 }, leads, deals, stages)
    expect(noSpend.roas).toBeNull()
    expect(noSpend.cpl).toBe(0)
  })

  it('has no CAC when nothing was won', () => {
    expect(computeCampaignMetrics(campaign, leads, [], stages).cac).toBeNull()
  })
})

describe('computePipelineValue', () => {
  const deals = [
    makeDeal({ id: 'D-1001', value: 100_000, probability: 10, stageId: 'new' }),
    makeDeal({ id: 'D-1002', value: 200_000, probability: 50, stageId: 'proposal' }),
    makeDeal({ id: 'D-1003', value: 300_000, probability: 100, stageId: 'won' }),
    makeDeal({ id: 'D-1004', value: 400_000, probability: 0, stageId: 'lost' }),
  ]

  it('totals open deals only and weights by each deal probability', () => {
    expect(computePipelineValue(deals, stages)).toEqual({
      total: 300_000,
      weighted: 110_000,
      count: 2,
    })
  })

  it('is zero for no deals', () => {
    expect(computePipelineValue([], stages)).toEqual({ total: 0, weighted: 0, count: 0 })
  })

  it('summarizes every stage for the board column headers', () => {
    const summary = summarizeDeals(deals, stages)
    expect(summary).toMatchObject({ total: 300_000, weighted: 110_000, count: 2 })
    expect(summary.byStage.map((s) => [s.stageId, s.count, s.total, s.weighted])).toEqual([
      ['new', 1, 100_000, 10_000],
      ['proposal', 1, 200_000, 100_000],
      ['won', 1, 300_000, 300_000],
      ['lost', 1, 400_000, 0],
    ])
  })
})
