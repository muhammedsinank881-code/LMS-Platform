import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/cn'
import { campaignInsights, projectSpend, type Insight, type InsightInput } from '@/lib/metrics'
import type { Campaign, CampaignMetrics } from '@/types'

const ICON = { good: CheckCircle2, warn: TriangleAlert, info: Info } as const
const LABEL = { good: 'Good', warn: 'Needs attention', info: 'Note' } as const

/** "How is it doing?" in plain words. Each line has an icon and a label, not just a colour. */
export function CampaignInsights({
  campaign,
  metrics,
  spent,
  tenantAvgCpl,
  now = new Date(),
}: {
  campaign: Campaign
  metrics: CampaignMetrics | undefined
  spent: number | null
  tenantAvgCpl: number | null
  now?: Date
}) {
  if (!metrics) return null
  const input: InsightInput = {
    metrics,
    tenantAvgCpl,
    status: campaign.status,
    budget: campaign.budget,
    spent,
    projectedSpend: spent === null ? null : projectSpend(spent, campaign.startDate, campaign.endDate, now),
  }
  const items: Insight[] = campaignInsights(input)
  if (items.length === 0) return null
  return (
    <Card size="sm">
      <CardHeader><CardTitle>How is it doing?</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-1.5">
          {items.map((item) => {
            const Icon = ICON[item.tone]
            return (
              <li key={item.text} className="flex items-start gap-2 text-sm">
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', item.tone === 'good' && 'text-success', item.tone === 'warn' && 'text-warning')} aria-hidden="true" />
                <span><span className="sr-only">{LABEL[item.tone]}: </span>{item.text}</span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
