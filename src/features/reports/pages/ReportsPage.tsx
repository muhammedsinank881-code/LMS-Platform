import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { useDateRangeState } from '@/hooks/use-date-range-state'
import { presetLabel } from '@/lib/date-range'
import { showTeamReports } from '@/features/dashboard/lib/layout'
import { CampaignsReportTab } from '../components/campaigns/CampaignsReportTab'
import { ForecastTab } from '../components/forecast/ForecastTab'
import { FunnelVelocityTab } from '../components/funnel/FunnelVelocityTab'
import { LeadsReportTab } from '../components/LeadsReportTab'
import { LostReportTab } from '../components/LostReportTab'
import { PerformanceReportTab } from '../components/PerformanceReportTab'
import { ReportToolbar } from '../components/ReportToolbar'
import { ResponseFollowUpTab } from '../components/response/ResponseFollowUpTab'
import { SalesReportTab } from '../components/SalesReportTab'
import { SourceRoiTab } from '../components/source-roi/SourceRoiTab'

const TITLES: Record<string, string> = {
  leads: 'Leads report',
  sales: 'Sales report',
  performance: 'Performance report',
  lost: 'Lost leads report',
  campaigns: 'Campaign performance',
  source_roi: 'Source ROI',
  funnel: 'Funnel and velocity',
  response: 'Response and follow-up',
  forecast: 'Forecast',
}

export function ReportsPage() {
  const state = useDateRangeState()
  const { can, getScope } = usePermission()
  const teamReports = showTeamReports(getScope('reports'))
  const scope = getScope('reports')
  const query = {
    ...state.query,
    userId: scope === 'own' ? undefined : state.query.userId,
    teamId: scope === 'all' ? state.query.teamId : undefined,
  }
  const scoped = { ...state, query }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">Reports</h1>
        {scope !== 'own' ? (
          <Link to="/reports/performance" className="text-sm text-primary hover:underline print:hidden">
            Sales performance deep dive
          </Link>
        ) : (
          <Link to="/reports/performance" className="text-sm text-primary hover:underline print:hidden">
            My performance
          </Link>
        )}
      </div>
      <p className="mb-3 hidden text-sm print:block">
        {TITLES[state.tab] ?? 'Report'} · {presetLabel(state.preset)} ({state.fromDay} to {state.toDay})
      </p>
      <ReportToolbar state={scoped} canExport={can('reports', 'export')} />
      <Tabs value={state.tab} onValueChange={(value) => state.setTab(value as typeof state.tab)}>
        <TabsList className="print:hidden">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          {teamReports ? <TabsTrigger value="performance">Performance</TabsTrigger> : null}
          <TabsTrigger value="lost">Lost leads</TabsTrigger>
          {can('campaigns', 'view') ? <TabsTrigger value="campaigns">Campaigns</TabsTrigger> : null}
          <TabsTrigger value="source_roi">Source ROI</TabsTrigger>
          <TabsTrigger value="funnel">Funnel &amp; velocity</TabsTrigger>
          <TabsTrigger value="response">Response &amp; follow-up</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="mt-3"><LeadsReportTab state={scoped} /></TabsContent>
        <TabsContent value="sales" className="mt-3"><SalesReportTab state={scoped} /></TabsContent>
        <TabsContent value="performance" className="mt-3"><PerformanceReportTab state={scoped} allowed={teamReports} /></TabsContent>
        <TabsContent value="lost" className="mt-3"><LostReportTab state={scoped} /></TabsContent>
        <TabsContent value="campaigns" className="mt-3"><CampaignsReportTab state={scoped} /></TabsContent>
        <TabsContent value="source_roi" className="mt-3"><SourceRoiTab state={scoped} /></TabsContent>
        <TabsContent value="funnel" className="mt-3"><FunnelVelocityTab state={scoped} /></TabsContent>
        <TabsContent value="response" className="mt-3"><ResponseFollowUpTab state={scoped} /></TabsContent>
        <TabsContent value="forecast" className="mt-3"><ForecastTab state={scoped} /></TabsContent>
      </Tabs>
    </div>
  )
}
