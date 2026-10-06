import { Navigate } from 'react-router-dom'
import { QueryState } from '@/components/common/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { DateRangePicker, Select } from '@/components/ui'
import { useDateRangeState } from '@/hooks/use-date-range-state'
import { usePermission } from '@/hooks/use-permission'
import { useTeams } from '@/features/team/hooks/use-team'
import { useAuthStore } from '@/store/auth-store'
import { LeaderboardWidget } from '../components/performance/LeaderboardWidget'
import { TargetsPanel } from '../components/performance/TargetsPanel'
import { TeamPerformanceTable } from '../components/performance/TeamPerformanceTable'
import { useTeamPerformance } from '../hooks/use-performance'

export function PerformancePage() {
  const { getScope } = usePermission()
  const scope = getScope('reports')
  const userId = useAuthStore((state) => state.user?.id)
  const state = useDateRangeState()
  const teams = useTeams()
  const query = { range: state.range, teamId: scope === 'all' ? state.teamId : undefined }
  const team = useTeamPerformance(query, scope !== 'own' && scope !== null)
  const month = new Date().toISOString().slice(0, 7)

  // Salespeople only ever see their own rep view.
  if (scope === 'own' && userId) return <Navigate to={`/reports/performance/${userId}`} replace />

  return (
    <div className="space-y-5">
      <PageHeader
        className="mb-0"
        title="Sales performance"
        breadcrumbs={[{ label: 'Reports', to: '/reports' }, { label: 'Performance' }]}
        description="Every rep, side by side. Open a name for their detail."
      />
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <DateRangePicker
          preset={state.preset}
          fromDay={state.fromDay}
          toDay={state.toDay}
          compare={state.compare}
          onPreset={state.setPreset}
          onCustom={state.setCustom}
          onCompare={state.setCompare}
        />
        {scope === 'all' ? (
          <Select
            className="w-44"
            aria-label="Team"
            value={state.teamId ?? 'all'}
            onValueChange={(value) => state.setFilter('team', value === 'all' ? null : value)}
            options={[{ value: 'all', label: 'All teams' }, ...(teams.data ?? []).map((t) => ({ value: t.id, label: t.name }))]}
          />
        ) : null}
      </div>
      <TargetsPanel month={month} />
      <QueryState
        isLoading={team.isLoading}
        isError={team.isError}
        onRetry={() => void team.refetch()}
        isEmpty={(team.data?.rows.length ?? 0) === 0}
        emptyTitle="No reps to show"
        emptyDescription="Nobody in your scope matches these filters."
      >
        {team.data ? <TeamPerformanceTable data={team.data} /> : null}
      </QueryState>
      <LeaderboardWidget query={query} />
    </div>
  )
}
