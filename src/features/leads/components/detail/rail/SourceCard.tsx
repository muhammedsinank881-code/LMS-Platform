import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { SourceIcon } from '@/components/common/SourceIcon'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { Lead } from '@/types'
import { campaignById, sourceById, type LeadLookups } from '../../../types'

export function SourceCard({ lead, lookups }: { lead: Lead; lookups: LeadLookups }) {
  const source = sourceById(lookups, lead.sourceId)
  const campaign = campaignById(lookups, lead.campaignId)
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Source and campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          {source ? <SourceIcon icon={source.icon} /> : null}
          {source?.name ?? EMPTY_VALUE}
        </p>
        <p className="text-muted-foreground">{campaign?.name ?? 'No campaign'}</p>
      </CardContent>
    </Card>
  )
}
