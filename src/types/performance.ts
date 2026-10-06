import type { DateRange } from './common'
import type { FunnelStage, SalesPerformanceRow } from './report'

export interface ActivityCounts {
  calls: number
  messages: number
  emails: number
  notes: number
}

export interface RepPerformanceRow extends SalesPerformanceRow {
  contactedPct: number | null
  followUpsDue: number
  avgDealValue: number | null
  activity: ActivityCounts
  teamId: string | null
  /** Daily lead counts for the sparkline. */
  trend: number[]
}

export interface TeamPerformance {
  rows: RepPerformanceRow[]
  totals: RepPerformanceRow
}

export const LEADERBOARD_METRICS = ['revenue', 'won', 'conversion', 'speed'] as const
export type LeaderboardMetric = (typeof LEADERBOARD_METRICS)[number]

export interface LeaderboardEntry {
  userId: string
  /** Null when the viewer may not see other reps' names. */
  name: string | null
  value: number
  isSelf: boolean
  rank: number
}

export interface PerformanceQuery {
  range: DateRange
  teamId?: string
}

export interface RepKpis {
  leadsAssigned: number
  contactedPct: number | null
  won: number
  revenue: number
  conversionRate: number | null
  avgResponseTimeMins: number | null
  avgDealValue: number | null
}

export interface TrendPoint {
  date: string
  value: number
}

export interface AgingBucket {
  label: string
  count: number
}

export interface RepDetail {
  userId: string
  name: string
  isSelf: boolean
  kpis: RepKpis
  teamAverage: RepKpis
  funnel: FunnelStage[]
  activityOverTime: Array<{ date: string } & ActivityCounts>
  responseTrend: TrendPoint[]
  leadAging: AgingBucket[]
  lostReasons: Array<{ key: string; label: string; count: number }>
  backlog: Array<{ id: string; leadId: string; leadName: string; type: string; dueAt: string }>
}

export const TARGET_METRICS = ['revenue', 'dealsWon', 'leadsContacted'] as const
export type TargetMetric = (typeof TARGET_METRICS)[number]

export interface Target {
  id: string
  /** A user id for a rep target, or null for the whole team. */
  userId: string | null
  /** yyyy-MM. */
  month: string
  revenue: number
  dealsWon: number
  leadsContacted: number
}

export type TargetInput = Omit<Target, 'id'>

export type PaceStatus = 'ahead' | 'on_track' | 'behind'

export interface TargetProgressRow {
  metric: TargetMetric
  target: number
  actual: number
  /** Percent of target, uncapped. Null when the target is 0. */
  percent: number | null
  pace: PaceStatus | null
}

export interface TargetProgress {
  userId: string | null
  name: string
  month: string
  rows: TargetProgressRow[]
}
