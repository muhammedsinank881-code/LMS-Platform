import type { CampaignPlatform } from './campaign'
import type { BreakdownRow } from './report'

export type Attribution = 'first' | 'last'

export interface CampaignReportRow {
  id: string
  name: string
  platform: CampaignPlatform
  spend: number | null
  leads: number
  qualified: number
  won: number
  revenue: number | null
  cpl: number | null
  cac: number | null
  roas: number | null
  costPerQualified: number | null
}

export type PlatformReportRow = Omit<CampaignReportRow, 'id' | 'name' | 'platform'> & {
  key: string
  label: string
}

export interface CampaignReport {
  campaigns: CampaignReportRow[]
  platforms: PlatformReportRow[]
  /** Share of leads by platform, for the channel mix donut. */
  channelMix: BreakdownRow[]
  adSets: CampaignReportRow[]
  ads: CampaignReportRow[]
  spendHidden: boolean
}

export interface AttributionRow {
  key: string
  label: string
  leads: number
  won: number
  revenue: number
}

export interface SourceRoiRow {
  sourceId: string
  label: string
  leads: number
  qualified: number
  won: number
  qualifiedRate: number | null
  winRate: number | null
  leadToWonRate: number | null
  avgDealValue: number | null
  avgDaysToClose: number | null
}

export interface StageVelocityRow {
  stageId: string
  name: string
  count: number
  conversionFromPrevious: number | null
  avgDaysInStage: number | null
}

export interface HistogramBin {
  label: string
  count: number
}

export interface StuckDeal {
  dealId: string
  leadId: string
  title: string
  stageName: string
  ownerName: string
  daysInStage: number
  value: number
}

export interface CohortRow {
  /** yyyy-MM */
  month: string
  leads: number
  d30: number | null
  d60: number | null
  d90: number | null
}

export interface FunnelVelocity {
  stages: StageVelocityRow[]
  timeToClose: HistogramBin[]
  avgDaysToClose: number | null
  stuck: StuckDeal[]
  cohorts: CohortRow[]
}

export const RESPONSE_BUCKETS = ['lt5m', 'lt15m', 'lt1h', 'lt4h', 'gt4h'] as const
export type ResponseBucket = (typeof RESPONSE_BUCKETS)[number]
export type ResponseDistribution = Record<ResponseBucket, number>

export interface ResponseGroupRow {
  key: string
  label: string
  distribution: ResponseDistribution
  total: number
}

export interface SpeedConversionPoint {
  bucket: ResponseBucket
  leads: number
  conversionRate: number | null
}

export interface ResponseFollowUp {
  bySource: ResponseGroupRow[]
  byRep: ResponseGroupRow[]
  followUpCompletionRate: number | null
  missedFollowUps: number
  speedToLead: SpeedConversionPoint[]
}

export interface ForecastMonth {
  /** yyyy-MM */
  month: string
  weighted: number
  worst: number
  commit: number
  best: number
  deals: number
}

export interface Forecast {
  months: ForecastMonth[]
  totals: { weighted: number; worst: number; commit: number; best: number }
}

export interface SavedReport {
  id: string
  tenantId: string
  userId: string
  name: string
  tab: string
  /** The URL search string of the report, without the leading `?`. */
  search: string
  createdAt: string
}

export type SavedReportInput = Pick<SavedReport, 'name' | 'tab' | 'search'>

export interface SpendRevenuePoint {
  date: string
  spend: number | null
  revenue: number | null
}
