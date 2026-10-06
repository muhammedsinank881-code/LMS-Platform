import { QueryState } from '@/components/common/QueryState'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Select } from '@/components/ui'
import { formatINR } from '@/lib/format'
import type { Attribution, AttributionRow } from '@/types'

const COLUMNS: ReportColumn<AttributionRow>[] = [
  { id: 'label', header: 'Channel', cell: (r) => r.label, sortValue: (r) => r.label },
  { id: 'leads', header: 'Leads', align: 'right', cell: (r) => r.leads, sortValue: (r) => r.leads },
  { id: 'won', header: 'Won', align: 'right', cell: (r) => r.won, sortValue: (r) => r.won },
  { id: 'revenue', header: 'Revenue', align: 'right', cell: (r) => formatINR(r.revenue), sortValue: (r) => r.revenue },
]

export function AttributionTable({
  mode,
  onModeChange,
  rows,
  isLoading,
  isError,
  onRetry,
}: {
  mode: Attribution
  onModeChange: (mode: Attribution) => void
  rows: AttributionRow[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Attribution</CardTitle>
          <CardDescription>
            {mode === 'first'
              ? 'First touch: credited to the source the lead originally came from.'
              : 'Last touch: credited to the platform of the lead’s latest campaign.'}
          </CardDescription>
        </div>
        <Select
          className="w-36 print:hidden"
          aria-label="Attribution model"
          value={mode}
          onValueChange={(value) => onModeChange(value as Attribution)}
          options={[
            { value: 'last', label: 'Last touch' },
            { value: 'first', label: 'First touch' },
          ]}
        />
      </CardHeader>
      <CardContent>
        <QueryState isLoading={isLoading} isError={isError} onRetry={onRetry} isEmpty={(rows?.length ?? 0) === 0} emptyTitle="No attributed leads in this period">
          <ReportTable caption={`Leads and revenue by channel, ${mode}-touch`} columns={COLUMNS} rows={rows ?? []} getKey={(r) => r.key} defaultSort={{ id: 'leads', dir: 'desc' }} />
        </QueryState>
      </CardContent>
    </Card>
  )
}
