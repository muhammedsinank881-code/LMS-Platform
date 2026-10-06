import type { DataScope } from '@/types'

export type DashboardLayoutKind = 'salesperson' | 'manager'

/** Own-scope roles see their book of business. Team and workspace scopes see the manager layout. */
export function dashboardLayout(scope: DataScope | null): DashboardLayoutKind {
  return scope === 'team' || scope === 'all' ? 'manager' : 'salesperson'
}

/** Performance and the team leaderboard are limited to workspace-wide report access. */
export function showTeamReports(scope: DataScope | null): boolean {
  return scope === 'all'
}
