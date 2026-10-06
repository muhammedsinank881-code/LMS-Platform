import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartCard, type ChartCardProps } from './ChartCard'
import { chartColor } from './chart-theme'
import { ChartTooltip } from './ChartTooltip'

const SWATCH = [
  'bg-primary',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-score-hot',
  'bg-score-warm',
  'bg-score-cold',
  'bg-muted-foreground',
] as const

export interface DonutSlice {
  key: string
  label: string
  value: number
}

type Frame = Omit<ChartCardProps, 'children' | 'summary' | 'isEmpty'>

export function DonutChartCard({
  slices,
  onSelect,
  ...frame
}: Frame & { slices: DonutSlice[]; onSelect?: (key: string) => void }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  return (
    <ChartCard
      {...frame}
      isEmpty={slices.length === 0 || total === 0}
      summary={{
        caption: frame.title,
        columns: [
          { key: 'label', label: 'Segment' },
          { key: 'value', label: 'Count' },
          { key: 'share', label: 'Share' },
        ],
        rows: slices.map((slice) => [
          slice.label,
          String(slice.value),
          total > 0 ? `${Math.round((slice.value / total) * 100)}%` : '0%',
        ]),
      }}
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="h-52 w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2}>
                {slices.map((slice, index) => (
                  <Cell key={slice.key} fill={chartColor(index)} onClick={() => onSelect?.(slice.key)} className={onSelect ? 'cursor-pointer' : undefined} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-0.5 text-sm">
          {slices.map((slice, index) => (
            <li key={slice.key}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-sm px-1 py-0.5 text-left hover:bg-muted"
                onClick={() => onSelect?.(slice.key)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${SWATCH[index % SWATCH.length] ?? SWATCH[0]}`} aria-hidden="true" />
                  <span className="truncate">{slice.label}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {slice.value} · {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
