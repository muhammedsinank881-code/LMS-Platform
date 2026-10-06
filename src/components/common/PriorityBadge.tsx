import { Badge, type BadgeTone } from '@/components/ui'
import type { Priority } from '@/types'

const TONE: Record<Priority, BadgeTone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'destructive',
}

const LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge tone={TONE[priority]} dot className={className}>
      {LABEL[priority]}
    </Badge>
  )
}
