import { useState } from 'react'
import { Tooltip } from '@/components/ui'
import { formatDateTime, formatRelative } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'
import { isOverdue } from '../lib/is-overdue'

export function RelativeTime({ value, className }: { value: string | null; className?: string }) {
  if (!value) return <span className="text-muted-foreground">{EMPTY_VALUE}</span>
  return (
    <Tooltip content={formatDateTime(value)}>
      <span className={className}>{formatRelative(value)}</span>
    </Tooltip>
  )
}

export function FollowUpTime({ value }: { value: string | null }) {
  const [now] = useState(() => Date.now())
  return <RelativeTime value={value} className={isOverdue(value, now) ? 'text-destructive' : undefined} />
}
