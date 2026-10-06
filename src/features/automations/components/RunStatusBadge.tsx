import { Check, CircleDot, Clock, Minus, X, type LucideIcon } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui'
import type { RunStatus } from '@/types'

const META: Record<RunStatus, { label: string; tone: BadgeTone; icon: LucideIcon }> = {
  running: { label: 'Running', tone: 'info', icon: CircleDot },
  waiting: { label: 'Waiting', tone: 'warning', icon: Clock },
  succeeded: { label: 'Succeeded', tone: 'success', icon: Check },
  failed: { label: 'Failed', tone: 'destructive', icon: X },
  skipped: { label: 'Skipped', tone: 'neutral', icon: Minus },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: X },
}

/** Icon and text, never colour alone. */
export function RunStatusBadge({ status }: { status: RunStatus }) {
  const { label, tone, icon: Icon } = META[status]
  return (
    <Badge tone={tone} size="sm">
      <Icon aria-hidden="true" className="h-3 w-3" />
      {label}
    </Badge>
  )
}
