import { StatCard } from '@/components/common/StatCard'
import { formatINRCompact } from '@/lib/format'
import type { CampaignMetrics } from '@/types'

interface Tile {
  label: string
  help: string
  money?: boolean
  value: (m: CampaignMetrics) => number | null
  format?: (n: number) => string
}

const TILES: Tile[] = [
  { label: 'Total spend', help: 'Ad spend across the campaigns shown.', money: true, value: (m) => m.spend },
  { label: 'Leads', help: 'Leads from these campaigns.', value: (m) => m.leads },
  { label: 'Deals', help: 'Leads that became deals.', value: (m) => m.deals },
  { label: 'Revenue', help: 'Value of deals won.', money: true, value: (m) => m.revenue },
  { label: 'Blended CPL', help: 'Total spend divided by total leads.', money: true, value: (m) => m.cpl },
  { label: 'CAC', help: 'Total spend divided by deals won.', money: true, value: (m) => m.cac },
  { label: 'ROAS', help: 'Revenue for every ₹1 spent.', money: true, value: (m) => m.roas, format: (n) => `${n.toFixed(2)}x` },
]

/** Totals for everything the filters match, in the same card style as the dashboard. */
export function CampaignSummaryStrip({
  summary,
  isLoading,
  isError,
  onRetry,
  spendHidden,
}: {
  summary: CampaignMetrics | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  spendHidden: boolean
}) {
  return (
    <div role="group" aria-label="Campaign totals" className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      {TILES.map((tile) => {
        const raw = summary ? tile.value(summary) : null
        const text = raw === null ? '—' : tile.format ? tile.format(raw) : tile.money ? formatINRCompact(raw) : String(raw)
        return (
          <StatCard
            key={tile.label}
            label={tile.label}
            help={tile.help}
            value={tile.money && spendHidden ? 'Restricted' : text}
            delta={null}
            caption=""
            hideTrend
            isLoading={isLoading}
            isError={isError}
            onRetry={onRetry}
          />
        )
      })}
    </div>
  )
}
