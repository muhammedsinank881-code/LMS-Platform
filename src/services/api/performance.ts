import type {
  LeaderboardEntry,
  LeaderboardMetric,
  PerformanceQuery,
  RepDetail,
  Target,
  TargetInput,
  TargetProgress,
  TeamPerformance,
} from '@/types'

/**
 * Sales performance. A salesperson only ever receives their own named figures plus the team
 * average: peers come back anonymous or not at all.
 */
export interface PerformanceApiClient {
  /** Managers and above, and team leaders for their team. */
  team(query: PerformanceQuery): Promise<TeamPerformance>
  repDetail(userId: string, query: PerformanceQuery): Promise<RepDetail>
  leaderboard(query: PerformanceQuery, metric: LeaderboardMetric): Promise<LeaderboardEntry[]>
  listTargets(month: string): Promise<Target[]>
  /** Needs the manage-targets permission. Replaces the target for the same rep and month. */
  saveTarget(input: TargetInput): Promise<Target>
  deleteTarget(id: string): Promise<void>
  targetProgress(month: string): Promise<TargetProgress[]>
}
