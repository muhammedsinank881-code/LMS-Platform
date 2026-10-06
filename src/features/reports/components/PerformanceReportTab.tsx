import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChartCard } from '@/components/common/charts/lazy-charts'
import { EmptyState } from '@/components/ui'
import { ShieldOff } from 'lucide-react'
import { AutomationActivityCard } from '@/features/automations/components/AutomationActivityCard'
import { leadFieldHref } from '@/features/dashboard/lib/links'
import { formatMinutes, formatPercent, moneyPair } from '@/features/dashboard/lib/format-metric'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { sumPerformance } from '@/lib/metrics'
import type { SalesPerformanceRow } from '@/types'
import { useFollowUpMetrics, useSalesPerformance } from '../hooks/use-reports'

const COLUMNS: Array<{ key: keyof SalesPerformanceRow; label: string }> = [
  { key: 'name', label: 'Salesperson' },
  { key: 'leadsAssigned', label: 'Leads assigned' },
  { key: 'leadsContacted', label: 'Leads contacted' },
  { key: 'followUpsDone', label: 'Follow-ups' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposals', label: 'Proposals' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'conversionRate', label: 'Conversion %' },
  { key: 'avgResponseTimeMins', label: 'Avg response' },
]

function cell(row: SalesPerformanceRow, key: keyof SalesPerformanceRow): string {
  const value = row[key]
  if (key === 'revenue' && typeof value === 'number') return moneyPair(value).compact
  if (key === 'conversionRate') return formatPercent(typeof value === 'number' ? value : null)
  if (key === 'avgResponseTimeMins') return formatMinutes(typeof value === 'number' ? value : null)
  return value === null || value === undefined ? '—' : String(value)
}

export function PerformanceReportTab({ state, allowed }: { state: DateRangeState; allowed: boolean }) {
  const navigate = useNavigate()
  const report = useSalesPerformance(state.query)
  const metrics = useFollowUpMetrics(state.query)
  const [sort, setSort] = useState<{ key: keyof SalesPerformanceRow; dir: 'asc' | 'desc' }>({ key: 'revenue', dir: 'desc' })
  const rows = report.data ?? []
  const sorted = useMemo(() => {
    const copy = [...(report.data ?? [])]
    copy.sort((a, b) => {
      const left = a[sort.key]
      const right = b[sort.key]
      const diff = typeof left === 'number' && typeof right === 'number' ? left - right : String(left ?? '').localeCompare(String(right ?? ''))
      return sort.dir === 'asc' ? diff : -diff
    })
    return copy
  }, [report.data, sort])
  const total = sumPerformance(rows)

  if (!allowed) {
    return <EmptyState icon={ShieldOff} title="Performance is limited to managers" description="Your role can view the other report tabs." />
  }

  return (
    <div className="min-w-0 space-y-3">
      <ul className="space-y-3 lg:hidden">
        {sorted.map((row) => (
          <li key={row.userId} className="rounded-md border border-border p-3">
            <button type="button" className="min-h-11 text-left font-medium" onClick={() => navigate(leadFieldHref('assignedTo', row.userId))}>
              {row.name}
            </button>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {COLUMNS.filter((column) => column.key !== 'name').map((column) => (
                <div key={column.key}>
                  <dt className="text-muted-foreground">{column.label}</dt>
                  <dd className="tabular-nums">{cell(row, column.key)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden max-w-full overflow-x-auto rounded-md border border-border lg:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={sort.key === column.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="px-2 py-2 font-medium"
                >
                  <button
                    type="button"
                    className="hover:underline"
                    aria-label={sort.key === column.key ? `${column.label}, sorted ${sort.dir === 'asc' ? 'ascending' : 'descending'}` : `Sort by ${column.label}`}
                    onClick={() => setSort((current) => ({ key: column.key, dir: current.key === column.key && current.dir === 'desc' ? 'asc' : 'desc' }))}
                  >
                    {column.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.userId} className="border-b border-border">
                {COLUMNS.map((column) => (
                  <td key={column.key} className="px-2 py-2 tabular-nums">
                    {column.key === 'name' ? (
                      <button type="button" className="font-medium hover:underline" onClick={() => navigate(leadFieldHref('assignedTo', row.userId))}>
                        {row.name}
                      </button>
                    ) : (
                      cell(row, column.key)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              {COLUMNS.map((column) => (
                <td key={column.key} className="px-2 py-2 tabular-nums">{cell(total, column.key)}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
        <BarChartCard
          title="Average response time"
          points={rows.map((row) => ({ key: row.userId, label: row.name, value: Math.round(row.avgResponseTimeMins ?? 0) }))}
          valueLabel="Minutes"
          isLoading={report.isLoading}
          isError={report.isError}
          onRetry={() => void report.refetch()}
        />
        <BarChartCard
          title="Follow-up completion"
          subtitle={formatPercent(metrics.data?.followUpCompletionRate ?? null)}
          points={(metrics.data?.overdueBySalesperson ?? []).map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          valueLabel="Overdue"
          isLoading={metrics.isLoading}
          isError={metrics.isError}
          onRetry={() => void metrics.refetch()}
        />
        <AutomationActivityCard />
      </div>
    </div>
  )
}
