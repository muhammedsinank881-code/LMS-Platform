import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard, type ChartCardProps } from './ChartCard'
import { formatChartTick } from './chart-theme'
import { ChartTooltip } from './ChartTooltip'

export interface DualAxisPoint {
  label: string
  /** Drawn as a filled area on the left axis. */
  primary: number | null
  /** Drawn as a dashed line on the right axis. */
  secondary: number | null
}

type Frame = Omit<ChartCardProps, 'children' | 'summary' | 'isEmpty'>

/** Two series with their own axes, e.g. spend (area) against leads (dashed line). */
export function DualAxisChartCard({
  points,
  primaryLabel,
  secondaryLabel,
  ...frame
}: Frame & { points: DualAxisPoint[]; primaryLabel: string; secondaryLabel: string }) {
  const empty = points.every((point) => !point.primary && !point.secondary)
  const axis = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }
  return (
    <ChartCard
      {...frame}
      isEmpty={points.length === 0 || empty}
      summary={{
        caption: frame.title,
        columns: [
          { key: 'label', label: 'Date' },
          { key: 'primary', label: primaryLabel },
          { key: 'secondary', label: secondaryLabel },
        ],
        rows: points.map((p) => [
          p.label,
          p.primary === null ? 'Restricted' : String(p.primary),
          p.secondary === null ? '' : String(p.secondary),
        ]),
      }}
    >
      <div className="h-48 w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={axis} stroke="hsl(var(--border))" minTickGap={28} interval="preserveStartEnd" />
            <YAxis yAxisId="left" width={44} tick={axis} stroke="hsl(var(--border))" tickFormatter={(v: number) => formatChartTick(v)} />
            <YAxis yAxisId="right" orientation="right" width={32} tick={axis} stroke="hsl(var(--border))" allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area yAxisId="left" type="monotone" dataKey="primary" name={primaryLabel} stroke="hsl(var(--primary))" fill="hsl(var(--primary-subtle))" strokeWidth={2} dot={false} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="secondary" name={secondaryLabel} stroke="hsl(var(--info))" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-primary" aria-hidden="true" />
          {primaryLabel} (left axis)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-info" aria-hidden="true" />
          {secondaryLabel} (right axis)
        </span>
      </div>
    </ChartCard>
  )
}
