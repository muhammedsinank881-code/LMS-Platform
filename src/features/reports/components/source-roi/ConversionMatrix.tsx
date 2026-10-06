import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/cn'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { SourceRoiRow } from '@/types'

const COLUMNS: Array<{ id: string; label: string; pick: (r: SourceRoiRow) => number | null }> = [
  { id: 'qualified', label: 'Lead → qualified', pick: (r) => r.qualifiedRate },
  { id: 'win', label: 'Qualified → won', pick: (r) => r.winRate },
  { id: 'overall', label: 'Lead → won', pick: (r) => r.leadToWonRate },
]

/** Intensity steps. The number is always printed in the cell, so colour is never the only signal. */
function shade(value: number | null): string {
  if (value === null) return 'bg-muted/40'
  if (value >= 60) return 'bg-primary/40'
  if (value >= 40) return 'bg-primary/30'
  if (value >= 20) return 'bg-primary/20'
  if (value > 0) return 'bg-primary/10'
  return 'bg-muted/40'
}

export function ConversionMatrix({ rows }: { rows: SourceRoiRow[] }) {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader>
        <CardTitle>Conversion matrix</CardTitle>
        <CardDescription>Darker cells convert better. Each cell shows its percentage.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-separate border-spacing-1 text-sm">
            <caption className="sr-only">Conversion rates by source and funnel step</caption>
            <thead>
              <tr>
                <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-muted-foreground">Source</th>
                {COLUMNS.map((c) => (
                  <th key={c.id} scope="col" className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sourceId}>
                  <th scope="row" className="px-2 py-1 text-left font-medium">{row.label}</th>
                  {COLUMNS.map((c) => {
                    const value = c.pick(row)
                    return (
                      <td key={c.id} className={cn('rounded-sm px-2 py-1.5 text-center tabular-nums', shade(value))}>
                        {value === null ? EMPTY_VALUE : `${value.toFixed(0)}%`}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
