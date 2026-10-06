import { Fragment, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { BreakdownMetricsRow } from '@/types'
import { CampaignStatusBadge } from '../CampaignBadges'
import { MoneyCell, PercentCell, RoasCell } from '../MetricCells'

const HEADERS = ['Spend', 'Leads', 'Qualified', 'Deals', 'Revenue', 'CPL', 'ROAS', 'Conv.']

function Cells({ row, hidden }: { row: BreakdownMetricsRow; hidden: boolean }) {
  const m = row.metrics
  return (
    <>
      <td className="px-2 py-1.5 text-right"><MoneyCell value={m.spend} hidden={hidden} /></td>
      <td className="px-2 py-1.5 text-right tabular-nums">{m.leads}</td>
      <td className="px-2 py-1.5 text-right tabular-nums">{m.qualified}</td>
      <td className="px-2 py-1.5 text-right tabular-nums">{m.deals}</td>
      <td className="px-2 py-1.5 text-right"><MoneyCell value={m.revenue} hidden={hidden} /></td>
      <td className="px-2 py-1.5 text-right"><MoneyCell value={m.cpl} hidden={hidden} /></td>
      <td className="px-2 py-1.5 text-right"><RoasCell value={m.roas} hidden={hidden} /></td>
      <td className="px-2 py-1.5 text-right"><PercentCell value={m.conversionRate} /></td>
    </>
  )
}

function MobileRow({ row, hidden, nested }: { row: BreakdownMetricsRow; hidden: boolean; nested?: boolean }) {
  const m = row.metrics
  return (
    <div className={cn('space-y-1 rounded-md border border-border p-3', nested && 'ml-4')}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{row.name}</p>
        <CampaignStatusBadge status={row.status} />
      </div>
      <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span>Spend <MoneyCell value={m.spend} hidden={hidden} /></span>
        <span>{m.leads} leads</span>
        <span>ROAS <RoasCell value={m.roas} hidden={hidden} /></span>
      </p>
    </div>
  )
}

export function AdSetBreakdownTable({
  rows,
  isLoading,
  isError,
  onRetry,
  spendHidden,
}: {
  rows: BreakdownMetricsRow[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  spendHidden: boolean
}) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>Ad sets and ads</CardTitle>
        {(rows ?? []).some((row) => row.children.length > 0) ? (
          <Button size="sm" variant="ghost" className="hidden md:inline-flex" onClick={() => setOpen(open.size > 0 ? new Set() : new Set((rows ?? []).map((row) => row.id)))}>
            {open.size > 0 ? 'Collapse all' : 'Expand all'}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <QueryState isLoading={isLoading} isError={isError} onRetry={onRetry} isEmpty={(rows?.length ?? 0) === 0} emptyTitle="No ad sets yet" emptyDescription="Ad sets and ads appear here once they are added.">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Metrics per ad set, with the ads inside each one</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-2 py-1.5 font-medium">Ad set / ad</th>
                  {HEADERS.map((h) => <th key={h} scope="col" className="px-2 py-1.5 text-right font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((row) => {
                  const expandable = row.children.length > 0
                  const expanded = open.has(row.id)
                  return (
                    <Fragment key={row.id}>
                      <tr className="border-b border-border">
                        <th scope="row" className="px-2 py-1.5 text-left font-medium">
                          {expandable ? (
                            <button
                              type="button"
                              aria-expanded={expanded}
                                              onClick={() => toggle(row.id)}
                              className="inline-flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} aria-hidden="true" />
                              {row.name}
                              <span className="text-xs font-normal text-muted-foreground">({row.children.length} ads)</span>
                            </button>
                          ) : (
                            <span className="pl-5">{row.name}</span>
                          )}
                        </th>
                        <Cells row={row} hidden={spendHidden} />
                      </tr>
                      {expanded
                        ? row.children.map((ad) => (
                            <tr key={ad.id} className="border-b border-border bg-muted/40">
                              <th scope="row" className="py-2 pl-10 pr-3 text-left font-normal">{ad.name}</th>
                              <Cells row={ad} hidden={spendHidden} />
                            </tr>
                          ))
                        : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          <ul className="space-y-2 md:hidden">
            {(rows ?? []).map((row) => (
              <li key={row.id} className="space-y-2">
                <MobileRow row={row} hidden={spendHidden} />
                {row.children.map((ad) => <MobileRow key={ad.id} row={ad} hidden={spendHidden} nested />)}
              </li>
            ))}
          </ul>
        </QueryState>
      </CardContent>
    </Card>
  )
}
