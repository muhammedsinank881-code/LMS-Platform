import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowDown, ArrowUp, Info, Minus } from 'lucide-react'
import { Button, Card, EmptyState, Skeleton, Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface StatCardProps {
  label: string
  value: string
  hint?: string
  delta: number | null
  caption: string
  /** When true, a drop is shown as a positive change. */
  lowerIsBetter?: boolean
  sparkline?: number[]
  /** Short definition shown from an info icon beside the label. */
  help?: string
  /** Leaves out the change line, for tiles that have nothing to compare with. */
  hideTrend?: boolean
  to?: string
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const width = 96
  const height = 28
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 2) - 1
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-7 w-24 text-primary" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
    </svg>
  )
}

function Trend({ delta, caption, lowerIsBetter }: { delta: number | null; caption: string; lowerIsBetter?: boolean }) {
  if (delta === null) return <p className="text-xs text-muted-foreground">No prior period</p>
  const up = delta > 0
  const down = delta < 0
  const positive = lowerIsBetter ? down : up
  const negative = lowerIsBetter ? up : down
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus
  const word = up ? 'Up' : down ? 'Down' : 'No change'
  return (
    <p className={cn('inline-flex items-center gap-1 text-xs', positive && 'text-success', negative && 'text-destructive', !positive && !negative && 'text-muted-foreground')}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>
        {word} {Math.abs(delta).toFixed(1)}% {caption}
      </span>
    </p>
  )
}

function Body(props: StatCardProps) {
  return (
    <>
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        {props.label}
        {props.help ? (
          <Tooltip content={props.help}>
            <button type="button" aria-label={`What is ${props.label}? ${props.help}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </Tooltip>
        ) : null}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{props.value}</p>
      {props.hideTrend ? null : <Trend delta={props.delta} caption={props.caption} lowerIsBetter={props.lowerIsBetter} />}
      {props.sparkline ? <Sparkline values={props.sparkline} /> : null}
    </>
  )
}

export function StatCard(props: StatCardProps) {
  if (props.isLoading) {
    return (
      <Card className="p-4" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-20" />
      </Card>
    )
  }
  if (props.isError) {
    return (
      <Card className="p-4">
        <EmptyState
          size="sm"
          tone="destructive"
          icon={AlertTriangle}
          title={props.label}
          action={
            <Button size="sm" variant="outline" onClick={props.onRetry}>
              Retry
            </Button>
          }
        />
      </Card>
    )
  }
  const body: ReactNode = <Body {...props} />
  if (!props.to) return <Card className="p-4">{body}</Card>
  const link = (
    <Link to={props.to} className="block rounded-md p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {body}
    </Link>
  )
  return (
    <Card variant="interactive">
      {props.hint ? <Tooltip content={props.hint}>{link}</Tooltip> : link}
    </Card>
  )
}
