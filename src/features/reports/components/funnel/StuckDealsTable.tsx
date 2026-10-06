import { Link } from 'react-router-dom'
import { QueryState } from '@/components/common/QueryState'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { Card, CardContent, CardHeader, CardTitle, Select } from '@/components/ui'
import { formatINR } from '@/lib/format'
import type { StuckDeal } from '@/types'

const COLUMNS: ReportColumn<StuckDeal>[] = [
  { id: 'title', header: 'Deal', cell: (r) => <Link className="hover:underline" to={`/deals/${r.dealId}`}>{r.title}</Link> },
  { id: 'stage', header: 'Stage', cell: (r) => r.stageName, sortValue: (r) => r.stageName },
  { id: 'owner', header: 'Owner', cell: (r) => r.ownerName, sortValue: (r) => r.ownerName },
  { id: 'days', header: 'Days in stage', align: 'right', cell: (r) => r.daysInStage, sortValue: (r) => r.daysInStage },
  { id: 'value', header: 'Value', align: 'right', cell: (r) => formatINR(r.value), sortValue: (r) => r.value },
]

export function StuckDealsTable({
  deals,
  days,
  onDaysChange,
  isLoading,
  isError,
  onRetry,
}: {
  deals: StuckDeal[]
  days: number
  onDaysChange: (days: number) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <CardTitle>Stuck deals</CardTitle>
        <Select
          className="w-44 print:hidden"
          aria-label="Stuck after"
          value={String(days)}
          onValueChange={(value) => onDaysChange(Number(value))}
          options={[7, 14, 30, 60].map((d) => ({ value: String(d), label: `Over ${d} days in a stage` }))}
        />
      </CardHeader>
      <CardContent>
        <QueryState isLoading={isLoading} isError={isError} onRetry={onRetry} isEmpty={deals.length === 0} emptyTitle="Nothing is stuck" emptyDescription={`No open deal has sat in a stage for more than ${days} days.`}>
          <ReportTable caption={`Open deals in a stage for more than ${days} days`} columns={COLUMNS} rows={deals} getKey={(r) => r.dealId} defaultSort={{ id: 'days', dir: 'desc' }} />
        </QueryState>
      </CardContent>
    </Card>
  )
}
