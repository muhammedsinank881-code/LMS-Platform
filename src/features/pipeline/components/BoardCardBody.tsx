import { memo } from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { CurrencyText } from '@/components/common/CurrencyText'
import { LeadScoreBadge } from '@/components/common/LeadScoreBadge'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { SourceIcon } from '@/components/common/SourceIcon'
import { Avatar } from '@/components/ui'
import { getDaysInStage } from '@/lib/pipeline'
import { cn } from '@/lib/cn'
import type { BoardCardModel } from '../lib/board-model'

export const BoardCardBody = memo(function BoardCardBody({
  card,
  ownerName,
  sourceIcon,
  now,
  className,
}: {
  card: BoardCardModel
  ownerName: string
  sourceIcon: string
  now: Date
  className?: string
}) {
  const overdue = card.nextFollowUpAt ? isPast(parseISO(card.nextFollowUpAt)) : false
  const days = getDaysInStage(card, now)
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{card.name}</p>
          {card.company ? <p className="truncate text-xs text-muted-foreground">{card.company}</p> : null}
        </div>
        <Avatar name={ownerName} size="xs" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <CurrencyText amount={card.value} className="text-sm font-medium" />
        <LeadScoreBadge score={card.score} category={card.scoreCategory} />
        <PriorityBadge priority={card.priority} />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className={cn(overdue && 'font-medium text-destructive')}>
          {card.nextFollowUpAt ? format(parseISO(card.nextFollowUpAt), 'd MMM') : 'No follow-up'}
        </span>
        <span className="inline-flex items-center gap-1">
          {sourceIcon ? <SourceIcon icon={sourceIcon} /> : null}
          <span>{days === 0 ? 'Today' : `${days}d`}</span>
        </span>
      </div>
    </div>
  )
})
