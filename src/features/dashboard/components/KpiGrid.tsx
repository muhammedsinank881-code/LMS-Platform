import { StatCard } from '@/components/common/StatCard'
import { compareCaption, type RangePreset } from '@/lib/date-range'
import type { Kpi } from '@/types'

export interface KpiItem {
  label: string
  kpi?: Kpi
  display: string
  hint?: string
  to?: string
  lowerIsBetter?: boolean
  delta?: number | null
  sparkline?: number[]
}

export function KpiGrid({
  items,
  preset,
  isLoading,
  isError,
  onRetry,
}: {
  items: KpiItem[]
  preset: RangePreset
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  const caption = compareCaption(preset)
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.label} className="min-w-0">
          <StatCard
            label={item.label}
            value={item.display}
            hint={item.hint}
            delta={item.delta !== undefined ? item.delta : (item.kpi?.delta ?? null)}
            caption={caption}
            lowerIsBetter={item.lowerIsBetter}
            sparkline={item.sparkline}
            to={item.to}
            isLoading={isLoading}
            isError={isError}
            onRetry={onRetry}
          />
        </li>
      ))}
    </ul>
  )
}
