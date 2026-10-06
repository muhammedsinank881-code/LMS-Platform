import { Archive, Pause, Pencil, Play } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'
import { OBJECTIVE_LABELS } from '@/lib/campaign-labels'
import { formatDate } from '@/lib/format'
import type { CampaignWithMetrics } from '@/types'
import { CampaignStatusBadge, PlatformBadge } from '../CampaignBadges'

export function CampaignHeader({
  campaign,
  canEdit,
  busy,
  onEdit,
  onToggle,
  onArchive,
}: {
  campaign: CampaignWithMetrics
  canEdit: boolean
  busy: boolean
  onEdit: () => void
  onToggle: () => void
  onArchive: () => void
}) {
  const togglable = campaign.status === 'active' || campaign.status === 'paused'
  const dates = `${formatDate(campaign.startDate)} to ${campaign.endDate ? formatDate(campaign.endDate) : 'no end date'}`
  return (
    <PageHeader
      className="mb-4"
      title={campaign.name}
      breadcrumbs={[{ label: 'Campaigns', to: '/campaigns' }, { label: campaign.name }]}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={campaign.platform} />
          <CampaignStatusBadge status={campaign.status} archived={Boolean(campaign.archivedAt)} />
          <span>{OBJECTIVE_LABELS[campaign.objective]}</span>
          <span aria-hidden="true">·</span>
          <span>{dates}</span>
        </span>
      }
      actions={
        canEdit ? (
          <>
            <Button variant="outline" onClick={onEdit}><Pencil aria-hidden="true" /> Edit</Button>
            {togglable ? (
              <Button variant="outline" loading={busy} onClick={onToggle}>
                {campaign.status === 'active' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                {campaign.status === 'active' ? 'Pause' : 'Resume'}
              </Button>
            ) : null}
            {!campaign.archivedAt ? (
              <Button variant="outline" loading={busy} onClick={onArchive}><Archive aria-hidden="true" /> Archive</Button>
            ) : null}
          </>
        ) : null
      }
    />
  )
}
