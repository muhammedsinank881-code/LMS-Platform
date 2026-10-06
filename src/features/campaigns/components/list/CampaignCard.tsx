import { Link } from 'react-router-dom'
import { Sparkline } from '@/components/common/Sparkline'
import { sparklineLabel } from '@/lib/sparkline'
import type { CampaignWithMetrics } from '@/types'
import { CampaignStatusBadge, PlatformBadge } from '../CampaignBadges'
import { MoneyCell, PercentCell, RoasCell } from '../MetricCells'
import { PerformanceFlag } from '../PerformanceFlag'

/** Mobile layout for one campaign: the headline numbers as a definition list. */
export function CampaignCard({
  campaign,
  spendHidden,
  tenantAvgCpl,
}: {
  campaign: CampaignWithMetrics
  spendHidden: boolean
  tenantAvgCpl: number | null
}) {
  const m = campaign.metrics
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <Link to={`/campaigns/${campaign.id}`} className="block truncate font-medium hover:underline">
            {campaign.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1.5">
            <PlatformBadge platform={campaign.platform} />
            <CampaignStatusBadge status={campaign.status} />
          </div>
        </div>
        <Sparkline values={campaign.trend} label={sparklineLabel('Leads', campaign.trend)} />
      </div>
      <PerformanceFlag metrics={m} tenantAvgCpl={tenantAvgCpl} />
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Item label="Spend"><MoneyCell value={m.spend} hidden={spendHidden} /></Item>
        <Item label="Revenue"><MoneyCell value={m.revenue} hidden={spendHidden} /></Item>
        <Item label="ROAS"><RoasCell value={m.roas} hidden={spendHidden} /></Item>
        <Item label="Leads"><span className="tabular-nums">{m.leads}</span></Item>
        <Item label="CPL"><MoneyCell value={m.cpl} hidden={spendHidden} /></Item>
        <Item label="Conv."><PercentCell value={m.conversionRate} /></Item>
      </dl>
    </div>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}
