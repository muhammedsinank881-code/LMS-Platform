import { useNavigate } from 'react-router-dom'
import { Sparkline } from '@/components/common/Sparkline'
import { sparklineLabel } from '@/lib/sparkline'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { formatINR } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'
import { formatMinutes, formatPercent } from '@/features/dashboard/lib/format-metric'
import type { RepPerformanceRow, TeamPerformance } from '@/types'

const money = (value: number | null) => (value === null ? EMPTY_VALUE : formatINR(value))

const COLUMNS: ReportColumn<RepPerformanceRow>[] = [
  { id: 'name', header: 'Salesperson', cell: (r) => r.name, sortValue: (r) => r.name },
  { id: 'leads', header: 'Leads', align: 'right', cell: (r) => r.leadsAssigned, sortValue: (r) => r.leadsAssigned },
  { id: 'contacted', header: 'Contacted', align: 'right', cell: (r) => formatPercent(r.contactedPct), sortValue: (r) => r.contactedPct },
  { id: 'followups', header: 'Follow-ups done / due', align: 'right', cell: (r) => `${r.followUpsDone} / ${r.followUpsDue}`, sortValue: (r) => r.followUpsDone },
  { id: 'qualified', header: 'Qualified', align: 'right', cell: (r) => r.qualified, sortValue: (r) => r.qualified },
  { id: 'proposals', header: 'Proposals', align: 'right', cell: (r) => r.proposals, sortValue: (r) => r.proposals },
  { id: 'won', header: 'Won', align: 'right', cell: (r) => r.won, sortValue: (r) => r.won },
  { id: 'lost', header: 'Lost', align: 'right', cell: (r) => r.lost, sortValue: (r) => r.lost },
  { id: 'revenue', header: 'Revenue', align: 'right', cell: (r) => money(r.revenue), sortValue: (r) => r.revenue },
  { id: 'conversion', header: 'Conversion', align: 'right', cell: (r) => formatPercent(r.conversionRate), sortValue: (r) => r.conversionRate },
  { id: 'response', header: 'Avg response', align: 'right', cell: (r) => formatMinutes(r.avgResponseTimeMins), sortValue: (r) => r.avgResponseTimeMins },
  { id: 'deal', header: 'Avg deal', align: 'right', cell: (r) => money(r.avgDealValue), sortValue: (r) => r.avgDealValue },
  {
    id: 'activity',
    header: 'Calls / msgs / emails / notes',
    align: 'right',
    cell: (r) => `${r.activity.calls} / ${r.activity.messages} / ${r.activity.emails} / ${r.activity.notes}`,
    sortValue: (r) => r.activity.calls + r.activity.messages + r.activity.emails + r.activity.notes,
  },
  { id: 'trend', header: 'Lead trend', cell: (r) => <Sparkline values={r.trend} label={sparklineLabel(`${r.name}: leads`, r.trend)} /> },
]

export function TeamPerformanceTable({ data }: { data: TeamPerformance }) {
  const navigate = useNavigate()
  return (
    <ReportTable
      caption="Sales performance by salesperson, with a totals row"
      columns={COLUMNS}
      rows={data.rows}
      totals={data.rows.length > 1 ? data.totals : undefined}
      getKey={(r) => r.userId}
      defaultSort={{ id: 'revenue', dir: 'desc' }}
      onRowClick={(r) => navigate(`/reports/performance/${r.userId}`)}
    />
  )
}
