import { useNavigate } from 'react-router-dom'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { MoneyCell, RoasCell } from '@/features/campaigns/components/MetricCells'
import { leadFieldHref } from '@/features/dashboard/lib/links'
import type { CampaignReportRow } from '@/types'

export interface PerformanceRow extends CampaignReportRow {
  /** Where a click on the name goes: the leads list filtered to this row. */
  href?: string
}

export function CampaignPerformanceTable({
  title,
  rows,
  hidden,
  linkField,
}: {
  title: string
  rows: PerformanceRow[]
  hidden: boolean
  /** Campaign rows drill down to leads; platform, ad set and ad rows do not have a lead filter. */
  linkField?: 'campaignId'
}) {
  const navigate = useNavigate()
  const money = (pick: (r: PerformanceRow) => number | null): ReportColumn<PerformanceRow>['cell'] => (r) => (
    <MoneyCell value={pick(r)} hidden={hidden} />
  )
  const columns: ReportColumn<PerformanceRow>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name, sortValue: (r) => r.name },
    { id: 'spend', header: 'Spend', align: 'right', cell: money((r) => r.spend), sortValue: (r) => r.spend },
    { id: 'leads', header: 'Leads', align: 'right', cell: (r) => r.leads, sortValue: (r) => r.leads },
    { id: 'qualified', header: 'Qualified', align: 'right', cell: (r) => r.qualified, sortValue: (r) => r.qualified },
    { id: 'won', header: 'Won', align: 'right', cell: (r) => r.won, sortValue: (r) => r.won },
    { id: 'revenue', header: 'Revenue', align: 'right', cell: money((r) => r.revenue), sortValue: (r) => r.revenue },
    { id: 'cpl', header: 'CPL', align: 'right', cell: money((r) => r.cpl), sortValue: (r) => r.cpl },
    { id: 'cac', header: 'CAC', align: 'right', cell: money((r) => r.cac), sortValue: (r) => r.cac },
    { id: 'cpq', header: 'Cost / qualified', align: 'right', cell: money((r) => r.costPerQualified), sortValue: (r) => r.costPerQualified },
    { id: 'roas', header: 'ROAS', align: 'right', cell: (r) => <RoasCell value={r.roas} hidden={hidden} />, sortValue: (r) => r.roas },
  ]
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <ReportTable
          caption={title}
          columns={columns}
          rows={rows}
          getKey={(r) => r.id}
          defaultSort={{ id: 'leads', dir: 'desc' }}
          onRowClick={linkField ? (r) => navigate(leadFieldHref(linkField, r.id)) : undefined}
        />
      </CardContent>
    </Card>
  )
}
