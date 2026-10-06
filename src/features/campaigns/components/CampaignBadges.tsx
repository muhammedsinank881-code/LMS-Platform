import { Badge, type BadgeTone } from '@/components/ui'
import { CAMPAIGN_STATUS_LABELS, platformLabel } from '@/lib/campaign-labels'
import type { CampaignStatus } from '@/types'

const TONE: Record<CampaignStatus, BadgeTone> = {
  active: 'success',
  paused: 'warning',
  completed: 'neutral',
  draft: 'info',
}

export function CampaignStatusBadge({ status, archived }: { status: CampaignStatus; archived?: boolean }) {
  return (
    <Badge tone={archived ? 'neutral' : TONE[status]} dot size="sm">
      {archived ? 'Archived' : CAMPAIGN_STATUS_LABELS[status]}
    </Badge>
  )
}

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <Badge tone="neutral" size="sm">
      {platformLabel(platform)}
    </Badge>
  )
}
