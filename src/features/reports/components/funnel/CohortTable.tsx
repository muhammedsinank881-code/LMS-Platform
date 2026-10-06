import { QueryState } from '@/components/common/QueryState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/cn'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { CohortRow } from '@/types'

function shade(value: number | null): string {
  if (value === null) return 'bg-muted/40 text-muted-foreground'
  if (value >= 30) return 'bg-primary/40'
  if (value >= 15) return 'bg-primary/25'
  if (value > 0) return 'bg-primary/10'
  return 'bg-muted/40'
}

const cell = (value: number | null) => (value === null ? 'Not yet' : `${value.toFixed(0)}%`)

export function CohortTable({
  rows,
  isLoading,
  isError,
  onRetry,
}: {
  rows: CohortRow[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader>
        <CardTitle>Conversion by lead creation month</CardTitle>
        <CardDescription>Share of each month’s leads that were won within 30, 60 and 90 days. “Not yet” means the window has not fully passed.</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryState isLoading={isLoading} isError={isError} onRetry={onRetry} isEmpty={rows.length === 0} emptyTitle="No leads to build cohorts from">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-separate border-spacing-1 text-sm">
              <caption className="sr-only">Percent of each creation month’s leads converted after 30, 60 and 90 days</caption>
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th scope="col" className="px-2 py-1 text-left font-medium">Month</th>
                  <th scope="col" className="px-2 py-1 text-right font-medium">Leads</th>
                  <th scope="col" className="px-2 py-1 text-center font-medium">30 days</th>
                  <th scope="col" className="px-2 py-1 text-center font-medium">60 days</th>
                  <th scope="col" className="px-2 py-1 text-center font-medium">90 days</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.month}>
                    <th scope="row" className="px-2 py-1 text-left font-medium">{row.month}</th>
                    <td className="px-2 py-1 text-right tabular-nums">{row.leads}</td>
                    {[row.d30, row.d60, row.d90].map((value, index) => (
                      <td key={index} className={cn('rounded-sm px-2 py-1.5 text-center tabular-nums', shade(value))}>
                        {value === null ? <span aria-label="Not yet">{cell(value)}</span> : value === undefined ? EMPTY_VALUE : cell(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </QueryState>
      </CardContent>
    </Card>
  )
}
