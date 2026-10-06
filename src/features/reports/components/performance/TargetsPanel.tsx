import { useState } from 'react'
import { Pencil, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { Button, Card, CardContent, CardHeader, CardTitle, ProgressBar } from '@/components/ui'
import { formatINR } from '@/lib/format'
import { usePermission } from '@/hooks/use-permission'
import type { PaceStatus, TargetMetric, TargetProgress } from '@/types'
import { useTargetProgress } from '../../hooks/use-performance'
import { TargetsEditor } from './TargetsEditor'

const LABEL: Record<TargetMetric, string> = {
  revenue: 'Revenue',
  dealsWon: 'Deals won',
  leadsContacted: 'Leads contacted',
}
const PACE: Record<PaceStatus, { text: string; icon: typeof Minus; tone: 'primary' | 'success' | 'warning' }> = {
  ahead: { text: 'Ahead of pace', icon: TrendingUp, tone: 'success' },
  on_track: { text: 'On track', icon: Minus, tone: 'primary' },
  behind: { text: 'Behind pace', icon: TrendingDown, tone: 'warning' },
}

const show = (metric: TargetMetric, value: number) => (metric === 'revenue' ? formatINR(value) : String(value))

function Progress({ item }: { item: TargetProgress }) {
  return (
    <Card size="sm">
      <CardHeader><CardTitle>{item.name}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {item.rows.map((row) => {
          const pace = row.pace ? PACE[row.pace] : null
          return (
            <div key={row.metric} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span>{LABEL[row.metric]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {show(row.metric, row.actual)} of {show(row.metric, row.target)}
                  {row.percent !== null ? ` (${Math.round(row.percent)}%)` : ''}
                </span>
              </div>
              <ProgressBar value={Math.min(row.percent ?? 0, 100)} tone={pace?.tone ?? 'primary'} aria-label={`${LABEL[row.metric]} progress for ${item.name}`} />
              {pace ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <pace.icon className="h-3 w-3" aria-hidden="true" /> {pace.text}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No target set</p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function TargetsPanel({ month }: { month: string }) {
  const progress = useTargetProgress(month)
  const { feature } = usePermission()
  const [editing, setEditing] = useState(false)
  const canManage = feature('manage-targets')
  return (
    <section aria-labelledby="targets-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="targets-heading" className="text-base font-semibold">Targets for {month}</h2>
        {canManage ? (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="print:hidden">
            <Pencil aria-hidden="true" /> Edit targets
          </Button>
        ) : null}
      </div>
      <QueryState
        isLoading={progress.isLoading}
        isError={progress.isError}
        onRetry={() => void progress.refetch()}
        isEmpty={(progress.data?.length ?? 0) === 0}
        emptyTitle="No targets for this month"
        emptyDescription={canManage ? 'Set a revenue, deals won and leads contacted target.' : 'Your manager has not set targets yet.'}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(progress.data ?? []).map((item) => <Progress key={item.userId ?? 'team'} item={item} />)}
        </div>
      </QueryState>
      {canManage ? <TargetsEditor open={editing} month={month} onOpenChange={setEditing} /> : null}
    </section>
  )
}
