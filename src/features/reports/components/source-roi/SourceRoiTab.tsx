import { useNavigate } from 'react-router-dom'
import { QueryState } from '@/components/common/QueryState'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { leadFieldHref } from '@/features/dashboard/lib/links'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { formatINR } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { SourceRoiRow } from '@/types'
import { useSourceRoi } from '../../hooks/use-advanced-reports'
import { ConversionMatrix } from './ConversionMatrix'

const pct = (value: number | null) => (value === null ? EMPTY_VALUE : `${value.toFixed(1)}%`)

const COLUMNS: ReportColumn<SourceRoiRow>[] = [
  { id: 'label', header: 'Source', cell: (r) => r.label, sortValue: (r) => r.label },
  { id: 'leads', header: 'Leads', align: 'right', cell: (r) => r.leads, sortValue: (r) => r.leads },
  { id: 'qualified', header: 'Qualified', align: 'right', cell: (r) => `${r.qualified} (${pct(r.qualifiedRate)})`, sortValue: (r) => r.qualifiedRate },
  { id: 'won', header: 'Won', align: 'right', cell: (r) => r.won, sortValue: (r) => r.won },
  { id: 'rate', header: 'Lead → won', align: 'right', cell: (r) => pct(r.leadToWonRate), sortValue: (r) => r.leadToWonRate },
  { id: 'avg', header: 'Avg deal value', align: 'right', cell: (r) => (r.avgDealValue === null ? EMPTY_VALUE : formatINR(r.avgDealValue)), sortValue: (r) => r.avgDealValue },
  { id: 'days', header: 'Avg days to close', align: 'right', cell: (r) => (r.avgDaysToClose === null ? EMPTY_VALUE : r.avgDaysToClose.toFixed(1)), sortValue: (r) => r.avgDaysToClose },
]

export function SourceRoiTab({ state }: { state: DateRangeState }) {
  const navigate = useNavigate()
  const report = useSourceRoi(state.query)
  const rows = report.data ?? []
  const retry = () => void report.refetch()
  return (
    <div className="min-w-0 space-y-3">
      <QueryState isLoading={report.isLoading} isError={report.isError} onRetry={retry} isEmpty={rows.length === 0} emptyTitle="No leads in this period" emptyDescription="Try a wider date range.">
        <Card size="sm" className="min-w-0">
          <CardHeader>
            <CardTitle>Lead source quality</CardTitle>
            <CardDescription>Click a source to open its leads.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportTable
              caption="Lead source quality: leads, qualified, won, deal value and time to close"
              columns={COLUMNS}
              rows={rows}
              getKey={(r) => r.sourceId}
              defaultSort={{ id: 'leads', dir: 'desc' }}
              onRowClick={(r) => navigate(leadFieldHref('sourceId', r.sourceId))}
            />
          </CardContent>
        </Card>
        <ConversionMatrix rows={rows} />
      </QueryState>
    </div>
  )
}
