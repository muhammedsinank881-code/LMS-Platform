import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { FollowUpGroups } from '@/lib/followup-groups'
import { FOLLOWUP_BUCKETS, type FollowUp, type FollowUpBucket } from '@/types'
import { FollowUpItem } from './FollowUpItem'

const LABELS: Record<FollowUpBucket, string> = {
  overdue: 'Overdue',
  today: 'Due today',
  tomorrow: 'Tomorrow',
  upcoming: 'Upcoming',
}

export function FollowUpGroups({
  groups,
  active,
  now,
  leadName,
  assigneeName,
  contact,
  selected,
  onSelectedChange,
  onComplete,
  onReschedule,
  onSnooze,
}: {
  groups: FollowUpGroups
  active: FollowUpBucket | null
  now: Date
  leadName: (id: string) => string
  assigneeName: (id: string) => { name: string; avatar?: string | null } | null
  contact: (id: string) => { phone?: string | null; email?: string | null; whatsapp?: string | null }
  selected: Set<string>
  onSelectedChange: (id: string, checked: boolean) => void
  onComplete: (followUp: FollowUp) => void
  onReschedule: (followUp: FollowUp) => void
  onSnooze: (id: string, minutes: number) => void
}) {
  const [closed, setClosed] = useState<Partial<Record<FollowUpBucket, boolean>>>({})
  const buckets = active ? [active] : [...FOLLOWUP_BUCKETS]
  return (
    <div className="space-y-2">
      {buckets.map((bucket) => {
        const items = groups[bucket]
        if (items.length === 0) return null
        const open = !closed[bucket]
        return (
          <section key={bucket} aria-label={LABELS[bucket]}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setClosed((current) => ({ ...current, [bucket]: open }))}
              className="sticky top-0 z-10 flex w-full items-center gap-2 bg-background py-1 text-left text-sm font-medium"
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', !open && '-rotate-90')} />
              {LABELS[bucket]}
              <span className="text-muted-foreground">{items.length}</span>
            </button>
            {open ? (
              <div className="flex flex-col gap-1">
                {items.map((item) => {
                  const person = assigneeName(item.assigneeId)
                  return (
                    <FollowUpItem
                      key={item.id}
                        followUp={item}
                        leadName={leadName(item.leadId)}
                        assigneeName={person?.name}
                        assigneeAvatar={person?.avatar}
                        now={now}
                        selected={selected.has(item.id)}
                        onSelectedChange={(checked) => onSelectedChange(item.id, checked)}
                        actions={{
                          ...contact(item.leadId),
                          onComplete: () => onComplete(item),
                          onReschedule: () => onReschedule(item),
                          onSnooze: (minutes) => onSnooze(item.id, minutes),
                        }}
                    />
                  )
                })}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
