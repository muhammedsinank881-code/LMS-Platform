import { StatCard } from '@/components/common/StatCard'
import { compareCaption, type RangePreset } from '@/lib/date-range'
import { formatINR } from '@/lib/format'
import { percentChange } from '@/lib/metrics'
import type { CampaignMetrics } from '@/types'

interface Def {
  label: string
  /** One-line meaning, shown from the info icon. */
  help: string
  pick: (m: CampaignMetrics) => number | null
  format: (n: number) => string
  money?: boolean
  lowerIsBetter?: boolean
}

const count = (n: number) => String(n)
const money = (n: number) => formatINR(n)

const DEFS: Def[] = [
  { label: 'Leads', help: 'People who enquired because of this campaign.', pick: (m) => m.leads, format: count },
  { label: 'Qualified', help: 'Leads marked as a good fit.', pick: (m) => m.qualified, format: count },
  { label: 'Deals', help: 'Leads that became a deal.', pick: (m) => m.deals, format: count },
  { label: 'Revenue', help: 'Value of deals won from this campaign.', pick: (m) => m.revenue, format: money, money: true },
  { label: 'Spend', help: 'Total ad spend in this period.', pick: (m) => m.spend, format: money, money: true, lowerIsBetter: true },
  { label: 'CPL', help: 'Cost per lead: spend divided by leads.', pick: (m) => m.cpl, format: money, money: true, lowerIsBetter: true },
  { label: 'CAC', help: 'Customer acquisition cost: spend divided by deals won.', pick: (m) => m.cac, format: money, money: true, lowerIsBetter: true },
  { label: 'ROAS', help: 'Return on ad spend: revenue for every ₹1 spent. Above 1 means it paid for itself.', pick: (m) => m.roas, format: (n) => `${n.toFixed(2)}x`, money: true },
]

/** Uses the same StatCard as the dashboard, so numbers read the same across the app. */
export function CampaignStatCards({
  current,
  previous,
  preset,
  isLoading,
  isError,
  onRetry,
  spendHidden,
}: {
  current: CampaignMetrics | undefined
  previous: CampaignMetrics | null | undefined
  preset: RangePreset
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  spendHidden: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {DEFS.map((def) => {
        const now = current ? def.pick(current) : null
        const before = previous ? def.pick(previous) : null
        const hidden = def.money && spendHidden
        return (
          <StatCard
            key={def.label}
            label={def.label}
            help={def.help}
            value={hidden ? 'Restricted' : now === null ? '—' : def.format(now)}
            delta={hidden || now === null || before === null ? null : percentChange(now, before)}
            caption={compareCaption(preset)}
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
