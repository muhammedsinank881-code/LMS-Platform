import { ChartCard, type ChartCardProps } from './ChartCard'

export interface FunnelStep {
  key: string
  label: string
  count: number
  valueLabel: string
  conversionFromPrevious: number | null
}

type Frame = Omit<ChartCardProps, 'children' | 'summary' | 'isEmpty'>

export function FunnelChart({
  steps,
  onSelect,
  ...frame
}: Frame & { steps: FunnelStep[]; onSelect?: (key: string) => void }) {
  const max = Math.max(1, ...steps.map((step) => step.count))
  return (
    <ChartCard
      {...frame}
      isEmpty={steps.length === 0 || steps.every((step) => step.count === 0)}
      summary={{
        caption: frame.title,
        columns: [
          { key: 'stage', label: 'Stage' },
          { key: 'count', label: 'Count' },
          { key: 'value', label: 'Value' },
          { key: 'conversion', label: 'From previous' },
        ],
        rows: steps.map((step) => [
          step.label,
          String(step.count),
          step.valueLabel,
          step.conversionFromPrevious === null ? '' : `${Math.round(step.conversionFromPrevious)}%`,
        ]),
      }}
    >
      <ol className="space-y-1.5">
        {steps.map((step) => {
          const share = step.conversionFromPrevious
          const shareLabel = share !== null && share <= 100 ? `${Math.round(share)}%` : null
          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onSelect?.(step.key)}
                className="flex w-full min-w-0 items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="w-24 shrink-0 truncate text-sm">{step.label}</span>
                <span className="h-6 min-w-0 flex-1 rounded-sm bg-muted">
                  <span
                    className="block h-6 max-w-full rounded-sm bg-primary/80"
                    style={{ width: `${Math.max(4, (step.count / max) * 100)}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                  {step.count}
                  <span className="block truncate text-xs text-muted-foreground">{shareLabel ?? step.valueLabel}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </ChartCard>
  )
}
