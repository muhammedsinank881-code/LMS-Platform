import { Lock } from 'lucide-react'
import { Tooltip } from '@/components/ui'
import { formatINR } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'

/** Shown instead of a spend figure when the role lacks view-spend. Text and icon, not colour. */
export function Restricted() {
  return (
    <Tooltip content="You need the view-spend permission to see spend and revenue.">
      <button type="button" className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Restricted
      </button>
    </Tooltip>
  )
}

export function MoneyCell({ value, hidden }: { value: number | null; hidden?: boolean }) {
  if (hidden) return <Restricted />
  return <span className="tabular-nums">{value === null ? EMPTY_VALUE : formatINR(value)}</span>
}

export function RoasCell({ value, hidden }: { value: number | null; hidden?: boolean }) {
  if (hidden) return <Restricted />
  return <span className="tabular-nums">{value === null ? EMPTY_VALUE : `${value.toFixed(2)}x`}</span>
}

export function PercentCell({ value }: { value: number | null }) {
  return <span className="tabular-nums">{value === null ? EMPTY_VALUE : `${value.toFixed(1)}%`}</span>
}

export function CountCell({ value }: { value: number }) {
  return <span className="tabular-nums">{value}</span>
}
