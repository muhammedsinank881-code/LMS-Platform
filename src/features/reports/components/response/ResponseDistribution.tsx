import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/cn'
import { RESPONSE_BUCKET_LABELS } from '@/lib/metrics'
import { RESPONSE_BUCKETS, type ResponseBucket, type ResponseGroupRow } from '@/types'

/** Fastest to slowest. Patterns differ as well as tints, so the buckets are not colour-only. */
const TINT: Record<ResponseBucket, string> = {
  lt5m: 'bg-success/70',
  lt15m: 'bg-success/40',
  lt1h: 'bg-warning/50',
  lt4h: 'bg-warning/80',
  gt4h: 'bg-destructive/70',
}

export function ResponseDistribution({
  title,
  description,
  rows,
}: {
  title: string
  description: string
  rows: ResponseGroupRow[]
}) {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs" aria-label="Legend">
          {RESPONSE_BUCKETS.map((bucket) => (
            <li key={bucket} className="inline-flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-sm', TINT[bucket])} aria-hidden="true" />
              {RESPONSE_BUCKET_LABELS[bucket]}
            </li>
          ))}
        </ul>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">No responses recorded in this period.</p> : null}
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-medium">{row.label}</span>
                <span className="text-xs text-muted-foreground">{row.total} leads</span>
              </div>
              <div className="flex h-5 overflow-hidden rounded-sm bg-muted" role="img" aria-label={RESPONSE_BUCKETS.map((b) => `${RESPONSE_BUCKET_LABELS[b]}: ${row.distribution[b]}`).join(', ')}>
                {RESPONSE_BUCKETS.map((bucket) => {
                  const count = row.distribution[bucket]
                  return count > 0 ? (
                    <span key={bucket} className={cn('flex items-center justify-center text-[10px] font-medium', TINT[bucket])} style={{ width: `${(count / row.total) * 100}%` }}>
                      {count}
                    </span>
                  ) : null
                })}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
