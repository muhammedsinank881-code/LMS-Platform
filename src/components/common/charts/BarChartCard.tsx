import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, type ChartCardProps } from './ChartCard'
import { chartColor, formatChartTick } from './chart-theme'
import { ChartTooltip } from './ChartTooltip'

function CategoryTick({ x = 0, y = 0, payload }: { x?: string | number; y?: string | number; payload?: { value?: string | number } }) {
  const raw = String(payload?.value ?? '')
  const label = raw.length > 16 ? `${raw.slice(0, 15)}…` : raw
  return (
    <text x={Number(x)} y={Number(y)} dy={4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={11}>
      {label}
    </text>
  )
}

export interface BarPoint {
  key: string
  label: string
  value: number
}

type Frame = Omit<ChartCardProps, 'children' | 'summary' | 'isEmpty'>

export function BarChartCard({
  points,
  valueLabel,
  layout = 'horizontal',
  onSelect,
  ...frame
}: Frame & {
  points: BarPoint[]
  valueLabel: string
  layout?: 'horizontal' | 'vertical'
  onSelect?: (key: string) => void
}) {
  const horizontal = layout === 'horizontal'
  return (
    <ChartCard
      {...frame}
      isEmpty={points.length === 0}
      summary={{
        caption: frame.title,
        columns: [
          { key: 'label', label: 'Label' },
          { key: 'value', label: valueLabel },
        ],
        rows: points.map((point) => [point.label, String(point.value)]),
      }}
    >
      <div className="h-52 w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={points}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="hsl(var(--border))" horizontal={!horizontal} vertical={horizontal} />
            {horizontal ? (
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" tickFormatter={(value: number) => formatChartTick(value)} allowDecimals={false} />
            ) : (
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" minTickGap={12} interval="preserveStartEnd" />
            )}
            {horizontal ? (
              <YAxis type="category" dataKey="label" width={112} tick={CategoryTick} stroke="hsl(var(--border))" />
            ) : (
              <YAxis width={40} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" tickFormatter={(value: number) => formatChartTick(value)} allowDecimals={false} />
            )}
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="value"
              name={valueLabel}
              fill={chartColor(0)}
              radius={4}
              onClick={(row) => {
                const payload: unknown = row.payload
                if (payload && typeof payload === 'object' && 'key' in payload && typeof payload.key === 'string') {
                  onSelect?.(payload.key)
                }
              }}
              className={onSelect ? 'cursor-pointer' : undefined}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
