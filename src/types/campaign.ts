import type { DateRange, ListParams, TenantOwned } from './common'
import type { CampaignId } from './ids'

export const CAMPAIGN_PLATFORMS = [
  'facebook',
  'instagram',
  'google_ads',
  'linkedin',
  'whatsapp',
  'email',
  'offline',
  'other',
] as const
export type CampaignPlatform = (typeof CAMPAIGN_PLATFORMS)[number]

export const CAMPAIGN_OBJECTIVES = ['awareness', 'leads', 'sales', 'engagement', 'retention'] as const
export type CampaignObjective = (typeof CAMPAIGN_OBJECTIVES)[number]

export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed'] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export interface Campaign extends TenantOwned {
  id: CampaignId
  name: string
  platform: CampaignPlatform
  objective: CampaignObjective
  status: CampaignStatus
  startDate: string
  endDate: string | null
  budget: number
  ownerId: string
  tags: string[]
  archivedAt: string | null
  createdAt: string
}

/**
 * Computed from spend entries, leads and deals. Ratios are null when the denominator is zero.
 * `spend`, `revenue` and the ratios built from them are null for roles without view-spend.
 */
export interface CampaignMetrics {
  spend: number | null
  leads: number
  qualified: number
  deals: number
  wonDeals: number
  revenue: number | null
  /** Cost per lead. */
  cpl: number | null
  /** Customer acquisition cost. */
  cac: number | null
  /** Return on ad spend (revenue / spend). */
  roas: number | null
  costPerQualified: number | null
  /** Won deals / leads, as a percentage. */
  conversionRate: number | null
}

export interface CampaignWithMetrics extends Campaign {
  metrics: CampaignMetrics
  /** Daily lead counts across the range, for the table sparkline. */
  trend: number[]
}

export type CampaignFilterField =
  | 'name'
  | 'platform'
  | 'status'
  | 'ownerId'
  | 'startDate'
  | 'spend'
  | 'roas'
  | 'leads'
  | 'revenue'
  | 'cpl'
  | 'overspent'

export interface CampaignListParams extends ListParams<CampaignFilterField> {
  range?: DateRange
  includeArchived?: boolean
}

export interface CampaignMetricsQuery {
  range: DateRange
  compare?: boolean
}

export interface CampaignDetailMetrics {
  campaign: CampaignWithMetrics
  previous: CampaignMetrics | null
  /** Average CPL across the tenant, for the underperformer flag. */
  tenantAvgCpl: number | null
}

export interface FunnelStep {
  label: 'Spend' | 'Leads' | 'Qualified' | 'Deals' | 'Revenue'
  /** Money for Spend and Revenue, counts otherwise. */
  value: number | null
  /** Share of the previous step. Null for the first step and when the previous value is zero. */
  conversionFromPrevious: number | null
}

export interface CampaignTimePoint {
  date: string
  spend: number | null
  leads: number
}

export interface BreakdownMetricsRow {
  id: string
  name: string
  status: CampaignStatus
  metrics: CampaignMetrics
  /** Ads under an ad set. Empty for ad rows. */
  children: BreakdownMetricsRow[]
}
