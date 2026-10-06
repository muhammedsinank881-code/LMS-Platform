import type { DateRange } from './common'

/** A headline number with its change versus the previous period of the same length. */
export interface Kpi {
  value: number
  /** Percentage change. Null when compare is off or the previous period was zero. */
  delta: number | null
}

export interface TimeSeriesPoint {
  /** yyyy-MM-dd in the report timezone. */
  date: string
  count: number
}

export const SERIES_GRAINS = ['day', 'week', 'month'] as const
export type SeriesGranularity = (typeof SERIES_GRAINS)[number]

export interface RevenuePoint {
  date: string
  revenue: number
}

export interface BreakdownRow {
  key: string
  label: string
  count: number
}

export interface ReportQuery {
  range: DateRange
  compare?: boolean
  sourceId?: string
  userId?: string
  campaignId?: string
  teamId?: string
}

export interface CountSeries {
  points: TimeSeriesPoint[]
  previous: TimeSeriesPoint[] | null
}

export interface RevenueSeries {
  points: RevenuePoint[]
  previous: RevenuePoint[] | null
}

export const BREAKDOWN_DIMENSIONS = ['source', 'status', 'campaign', 'location', 'salesperson'] as const
export type BreakdownDimension = (typeof BREAKDOWN_DIMENSIONS)[number]

export interface BreakdownReport {
  dimension: BreakdownDimension
  total: number
  rows: BreakdownRow[]
}

export interface FunnelStage {
  stageId: string
  name: string
  count: number
  value: number
  /** Share of the previous stage's count. Null on the first stage and when the previous count is 0. */
  conversionFromPrevious: number | null
}

export interface DashboardSummary {
  range: DateRange
  totalLeads: Kpi
  openLeads: Kpi
  newLeads: Kpi
  qualified: Kpi
  hotLeads: Kpi
  openDeals: Kpi
  won: Kpi
  lost: Kpi
  pipelineValue: Kpi
  weightedPipeline: Kpi
  revenue: Kpi
  conversionRate: Kpi
}

export interface WinLossReport {
  won: Kpi
  lost: Kpi
  winRate: Kpi
  reasons: Array<BreakdownRow & { percent: number }>
}

export interface LostAnalysis {
  total: number
  reasons: Array<BreakdownRow & { percent: number }>
  bySource: BreakdownRow[]
  bySalesperson: BreakdownRow[]
  trend: TimeSeriesPoint[]
  previousTrend: TimeSeriesPoint[] | null
}

export interface FollowUpMetrics {
  avgResponseTimeMins: number | null
  previousAvgResponseTimeMins: number | null
  followUpCompletionRate: number | null
  previousFollowUpCompletionRate: number | null
  overdueBySalesperson: BreakdownRow[]
}

export interface SalesPerformanceRow {
  userId: string
  name: string
  leadsAssigned: number
  leadsContacted: number
  followUpsDone: number
  qualified: number
  proposals: number
  won: number
  lost: number
  revenue: number
  conversionRate: number | null
  avgResponseTimeMins: number | null
}

export interface CallListItem {
  id: string
  name: string
  phone: string | null
  company: string
  score: number
  reason: 'overdue' | 'hot'
}

export interface RecentActivityItem {
  id: string
  leadId: string
  leadName: string
  type: string
  label: string
  createdAt: string
}

export const REPORT_TABS = [
  'leads',
  'sales',
  'performance',
  'lost',
  'campaigns',
  'source_roi',
  'funnel',
  'response',
  'forecast',
] as const
export type ReportTab = (typeof REPORT_TABS)[number]

export interface ReportExportRequest extends ReportQuery {
  tab: ReportTab
  dimension?: BreakdownDimension
  attribution?: 'first' | 'last'
  stuckDays?: number
}

export interface ReportExportResult {
  filename: string
  headers: string[]
  rows: string[][]
}
