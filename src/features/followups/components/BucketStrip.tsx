import { cn } from '@/lib/cn'
import type { FollowUpBucket, FollowUpBuckets } from '@/types'

const BUCKETS: Array<{ id: FollowUpBucket; label: string; mark: string }> = [
  { id: 'overdue', label: 'Overdue', mark: '🔴' },
  { id: 'today', label: 'Due Today', mark: '🟠' },
  { id: 'tomorrow', label: 'Tomorrow', mark: '🟡' },
  { id: 'upcoming', label: 'Upcoming', mark: '🟢' },
]

export function BucketStrip({
  counts,
  active,
  onChange,
}: {
  counts: FollowUpBuckets
  active: FollowUpBucket | null
  onChange: (bucket: FollowUpBucket | null) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="toolbar" aria-label="Follow-up buckets">
      {BUCKETS.map((bucket) => {
        const pressed = active === bucket.id
        return (
          <button
            key={bucket.id}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(pressed ? null : bucket.id)}
            className={cn(
              'flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-left text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              pressed && 'border-primary bg-primary/5',
            )}
          >
            <span>
              <span aria-hidden="true">{bucket.mark} </span>
              {bucket.label}
            </span>
            <span className="font-semibold tabular-nums">{counts[bucket.id]}</span>
          </button>
        )
      })}
    </div>
  )
}
