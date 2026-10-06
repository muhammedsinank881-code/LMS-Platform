import { Select } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { useDateRangeState } from '@/hooks/use-date-range-state'
import { useTeams } from '@/features/team/hooks/use-team'
import { useAuthStore } from '@/store/auth-store'
import { DashboardHeader } from '../components/DashboardHeader'
import { ManagerDashboard } from '../components/ManagerDashboard'
import { SalesDashboard } from '../components/SalesDashboard'
import { dashboardLayout, showTeamReports } from '../lib/layout'

export function DashboardPage() {
  const name = useAuthStore((state) => state.user?.name ?? 'there')
  const { getScope } = usePermission()
  const scope = getScope('dashboard')
  const rangeState = useDateRangeState()
  const layout = dashboardLayout(scope)
  const teams = useTeams()
  const showTeamFilter = scope === 'all'
  const query = showTeamFilter ? rangeState.query : { ...rangeState.query, teamId: undefined }

  return (
    <div>
      <DashboardHeader name={name} rangeState={rangeState} />
      {showTeamFilter ? (
        <div className="mb-3 w-full max-w-xs print:hidden">
          <Select
            className="w-full sm:w-44"
            aria-label="Team"
            value={rangeState.teamId ?? 'all'}
            onValueChange={(value) => rangeState.setFilter('team', value === 'all' ? null : value)}
            options={[
              { value: 'all', label: 'All teams' },
              ...(teams.data ?? []).map((team) => ({ value: team.id, label: team.name })),
            ]}
          />
        </div>
      ) : null}
      {layout === 'manager' ? (
        <ManagerDashboard query={query} preset={rangeState.preset} showTeam={showTeamReports(getScope('reports'))} />
      ) : (
        <SalesDashboard query={query} preset={rangeState.preset} />
      )}
    </div>
  )
}
