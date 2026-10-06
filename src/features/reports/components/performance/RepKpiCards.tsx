import { StatCard } from '@/components/common/StatCard'
import { formatINR } from '@/lib/format'
import { percentChange } from '@/lib/metrics'
import { formatMinutes, formatPercent } from '@/features/dashboard/lib/format-metric'
import type { RepKpis } from '@/types'

interface Def {
  label: string
  pick: (k: RepKpis) => number | null
  format: (n: number | null) => string
  lowerIsBetter?: boolean
}

const num = (n: number | null) => (n === null ? '—' : String(Math.round(n * 10) / 10))
const inr = (n: number | null) => (n === null ? '—' : formatINR(n))

const DEFS: Def[] = [
  { label: 'Leads assigned', pick: (k) => k.leadsAssigned, format: num },
  { label: 'Contacted', pick: (k) => k.contactedPct, format: formatPercent },
  { label: 'Deals won', pick: (k) => k.won, format: num },
  { label: 'Revenue', pick: (k) => k.revenue, format: inr },
  { label: 'Conversion', pick: (k) => k.conversionRate, format: formatPercent },
  { label: 'Avg response time', pick: (k) => k.avgResponseTimeMins, format: formatMinutes, lowerIsBetter: true },
  { label: 'Avg deal value', pick: (k) => k.avgDealValue, format: inr },
]

/** Each card shows the rep's figure and how far it is from the team average. */
export function RepKpiCards({
  kpis,
  teamAverage,
  isLoading,
  isError,
  onRetry,
}: {
  kpis: RepKpis | undefined
  teamAverage: RepKpis | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {DEFS.map((def) => {
        const mine = kpis ? def.pick(kpis) : null
        const avg = teamAverage ? def.pick(teamAverage) : null
        return (
          <StatCard
            key={def.label}
            label={def.label}
            value={def.format(mine)}
            hint={`Team average: ${def.format(avg)}`}
            delta={mine === null || avg === null ? null : percentChange(mine, avg)}
            caption="vs team average"
            lowerIsBetter={def.lowerIsBetter}
            isLoading={isLoading}
            isError={isError}
            onRetry={onRetry}
          />
        )
      })}
    </div>
  )
}
