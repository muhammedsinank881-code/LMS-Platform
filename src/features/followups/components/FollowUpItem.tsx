import { Link } from 'react-router-dom'
import { Avatar, Checkbox } from '@/components/ui'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { overdueLabel } from '@/lib/overdue-label'
import type { FollowUp } from '@/types'
import { FOLLOW_UP_TYPE_META } from '../type-meta'
import { FollowUpQuickActions, type FollowUpQuickActionsProps } from './FollowUpQuickActions'

export interface FollowUpItemProps {
  followUp: FollowUp
  leadName: string
  assigneeName?: string | null
  assigneeAvatar?: string | null
  now: Date
  showLead?: boolean
  selected?: boolean
  onSelectedChange?: (checked: boolean) => void
  actions: Omit<FollowUpQuickActionsProps, 'leadId'>
}

export function FollowUpItem({
  followUp,
  leadName,
  assigneeName,
  assigneeAvatar,
  now,
  showLead = true,
  selected,
  onSelectedChange,
  actions,
}: FollowUpItemProps) {
  const meta = FOLLOW_UP_TYPE_META[followUp.type]
  const Icon = meta.icon
  const late = overdueLabel(followUp.dueAt, now)
  return (
    <article
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5',
        late && 'border-destructive/40',
      )}
    >
      {onSelectedChange ? (
        <Checkbox
          size="sm"
          checked={selected}
          aria-label={`Select ${meta.label} with ${leadName}`}
          onCheckedChange={(value) => onSelectedChange(value === true)}
        />
      ) : null}
      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md border', meta.chip)}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-sm font-medium text-foreground">{meta.label}</span>
          {showLead ? (
            <Link to={`/leads/${followUp.leadId}`} className="truncate text-sm text-primary hover:underline">
              {leadName}
            </Link>
          ) : null}
          <span className={cn('ml-auto hidden shrink-0 whitespace-nowrap text-xs text-muted-foreground lg:inline', late && 'text-destructive')}>
            {formatDateTime(followUp.dueAt)}
            {late ? ` · ${late}` : ''}
          </span>
        </div>
        <p className={cn('truncate text-xs text-muted-foreground lg:hidden', late && 'text-destructive')}>
          {formatDateTime(followUp.dueAt)}
          {late ? ` · ${late}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <PriorityBadge priority={followUp.priority} />
        {assigneeName ? <Avatar name={assigneeName} src={assigneeAvatar} size="xs" /> : null}
        <span className="hidden text-xs capitalize text-muted-foreground lg:inline">{followUp.status}</span>
        <FollowUpQuickActions leadId={followUp.leadId} {...actions} />
      </div>
    </article>
  )
}
