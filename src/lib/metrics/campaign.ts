import type { Campaign, CampaignMetrics, Deal, Lead, PipelineStage } from '@/types'

/** `numerator / denominator`, or null when there is nothing to divide by. */
export function ratio(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null
  return denominator > 0 ? numerator / denominator : null
}

/** Rounds a currency amount to 2 decimals. Non-finite input becomes 0. */
export function roundMoney(value: number): number {
  return Number.isFinite(value) ? Math.round((value + Number.EPSILON) * 100) / 100 : 0
}

const money = (value: number | null) => (value === null ? null : roundMoney(value))

/** Cost per lead. */
export const cpl = (spend: number, leads: number) => money(ratio(spend, leads))
/** Customer acquisition cost: spend per won deal. */
export const cac = (spend: number, wonDeals: number) => money(ratio(spend, wonDeals))
/** Return on ad spend, revenue per rupee of spend. */
export const roas = (revenue: number, spend: number) => money(ratio(revenue, spend))
export const costPerQualified = (spend: number, qualified: number) => money(ratio(spend, qualified))

/** Won deals as a percentage of leads. */
export function conversionPct(wonDeals: number, leads: number): number | null {
  const value = ratio(wonDeals, leads)
  return value === null ? null : value * 100
}

type LeadRef = Pick<Lead, 'id' | 'qualificationStatus'>
type DealRef = Pick<Deal, 'leadId' | 'value' | 'stageId'>
type StageRef = Pick<PipelineStage, 'id' | 'type'>

/**
 * Funnel numbers for a set of leads that were already narrowed to one campaign, ad set or ad.
 * Ratios are null (never Infinity) when the denominator is zero.
 */
export function computeMetrics(
  spend: number,
  leads: readonly LeadRef[],
  deals: readonly DealRef[],
  stages: readonly StageRef[],
): CampaignMetrics {
  const leadIds = new Set(leads.map((lead) => lead.id))
  const own = deals.filter((deal) => leadIds.has(deal.leadId))
  const wonStageIds = new Set(stages.filter((s) => s.type === 'won').map((s) => s.id))
  const won = own.filter((deal) => wonStageIds.has(deal.stageId))
  const revenue = roundMoney(won.reduce((sum, deal) => sum + deal.value, 0))
  const qualified = leads.filter((lead) => lead.qualificationStatus === 'qualified').length
  return {
    spend: roundMoney(spend),
    leads: leads.length,
    qualified,
    deals: own.length,
    wonDeals: won.length,
    revenue,
    cpl: cpl(spend, leads.length),
    cac: cac(spend, won.length),
    roas: roas(revenue, spend),
    costPerQualified: costPerQualified(spend, qualified),
    conversionRate: conversionPct(won.length, leads.length),
  }
}

/** Same as `computeMetrics`, picking the campaign's own non-archived leads out of a wider list. */
export function computeCampaignMetrics(
  campaign: Pick<Campaign, 'id'> & { spend: number },
  leads: ReadonlyArray<LeadRef & Pick<Lead, 'campaignId' | 'archivedAt'>>,
  deals: readonly DealRef[],
  stages: readonly StageRef[],
): CampaignMetrics {
  const own = leads.filter((lead) => lead.campaignId === campaign.id && !lead.archivedAt)
  return computeMetrics(campaign.spend, own, deals, stages)
}

/** Hides spend-derived figures from roles without view-spend. */
export function redactSpend(metrics: CampaignMetrics): CampaignMetrics {
  return {
    ...metrics,
    spend: null,
    revenue: null,
    cpl: null,
    cac: null,
    roas: null,
    costPerQualified: null,
  }
}

/**
 * Totals across several campaigns. Ratios are recomputed from the summed figures, not averaged,
 * so the blended CPL and ROAS match what the rows add up to. Hidden spend stays hidden.
 */
export function sumMetrics(rows: readonly CampaignMetrics[]): CampaignMetrics {
  const add = (pick: (m: CampaignMetrics) => number) => rows.reduce((total, row) => total + pick(row), 0)
  const hidden = rows.some((row) => row.spend === null)
  const spend = add((m) => m.spend ?? 0)
  const revenue = add((m) => m.revenue ?? 0)
  const leads = add((m) => m.leads)
  const qualified = add((m) => m.qualified)
  const wonDeals = add((m) => m.wonDeals)
  const metrics: CampaignMetrics = {
    spend: roundMoney(spend),
    leads,
    qualified,
    deals: add((m) => m.deals),
    wonDeals,
    revenue: roundMoney(revenue),
    cpl: cpl(spend, leads),
    cac: cac(spend, wonDeals),
    roas: roas(revenue, spend),
    costPerQualified: costPerQualified(spend, qualified),
    conversionRate: conversionPct(wonDeals, leads),
  }
  return hidden ? redactSpend(metrics) : metrics
}
