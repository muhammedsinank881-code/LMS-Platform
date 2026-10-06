import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, type ChartCardProps } from './ChartCard'
import { formatChartTick } from './chart-theme'
import { ChartTooltip } from './ChartTooltip'

export interface AreaSeriesPoint {
  label: string
  value: number
  previous?: number | null
}

type Frame = Omit<ChartCardProps, 'children' | 'summary' | 'isEmpty'>

export function AreaChartCard({
  points,
  valueLabel,
  previousLabel = 'Previous',
  ...frame
}: Frame & { points: AreaSeriesPoint[]; valueLabel: string; previousLabel?: string }) {
  const hasPrevious = points.some((point) => point.previous !== null && point.previous !== undefined)
  const empty = points.length === 0 || points.every((point) => point.value === 0 && !point.previous)
  return (
    <ChartCard
      {...frame}
      isEmpty={empty}
      summary={{
        caption: frame.title,
        columns: [
          { key: 'label', label: 'Period' },
          { key: 'value', label: valueLabel },
          ...(hasPrevious ? [{ key: 'previous', label: previousLabel }] : []),
        ],
        rows: points.map((point) => [
          point.label,
          String(point.value),
          ...(hasPrevious ? [point.previous === null || point.previous === undefined ? '' : String(point.previous)] : []),
        ]),
      }}
    >
      <div className="h-52 w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              minTickGap={28}
              interval="preserveStartEnd"
            />
            <YAxis
              width={40}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              tickFormatter={(value: number) => formatChartTick(value)}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            {hasPrevious ? (
              <Area type="monotone" dataKey="previous" name={previousLabel} stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="4 3" strokeWidth={1.5} dot={false} />
            ) : null}
            <Area type="monotone" dataKey="value" name={valueLabel} stroke="hsl(var(--primary))" fill="hsl(var(--primary-subtle))" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {hasPrevious ? (
        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" aria-hidden="true" />{valueLabel}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-muted-foreground" aria-hidden="true" />{previousLabel}</span>
        </div>
      ) : null}
    </ChartCard>
  )
}
