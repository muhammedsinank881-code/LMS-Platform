import { format } from 'date-fns'
import { Button } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { overdueLabel } from '@/lib/overdue-label'
import type { FollowUp } from '@/types'
import { FOLLOW_UP_TYPE_META } from '../../type-meta'

export function AgendaList({
  day,
  items,
  leadName,
  now,
  onCreate,
  onOpen,
}: {
  day: Date
  items: FollowUp[]
  leadName: (id: string) => string
  now: Date
  onCreate: (day: Date) => void
  onOpen: (followUp: FollowUp) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{format(day, 'EEEE d MMM')}</h3>
        <Button type="button" size="sm" variant="outline" onClick={() => onCreate(day)}>
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const meta = FOLLOW_UP_TYPE_META[item.type]
            const late = overdueLabel(item.dueAt, now)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="flex w-full flex-col rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-medium">{meta.label} · {leadName(item.leadId)}</span>
                  <span className={late ? 'text-destructive' : 'text-muted-foreground'}>
                    {formatDateTime(item.dueAt)}
                    {late ? ` · ${late}` : ''}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
