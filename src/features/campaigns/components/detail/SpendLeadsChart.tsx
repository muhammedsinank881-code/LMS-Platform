import { DualAxisChartCard } from '@/components/common/charts/lazy-charts'
import type { CampaignTimePoint } from '@/types'

export function SpendLeadsChart({
  points,
  isLoading,
  isError,
  onRetry,
}: {
  points: CampaignTimePoint[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  return (
    <DualAxisChartCard
      title="Spend vs leads over time"
      subtitle="Daily spend (area) against leads created (dashed line)"
      points={(points ?? []).map((p) => ({ label: p.date.slice(5), primary: p.spend, secondary: p.leads }))}
      primaryLabel="Spend"
      secondaryLabel="Leads"
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
    />
  )
}
