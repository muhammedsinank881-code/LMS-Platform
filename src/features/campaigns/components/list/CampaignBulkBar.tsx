import { Archive, Pause, Play } from 'lucide-react'
import { BulkActionBar } from '@/components/common/BulkActionBar'
import { Button } from '@/components/ui'
import type { CampaignBulkAction } from '@/services/api/campaigns'

export function CampaignBulkBar({
  count,
  busy,
  onClear,
  onAction,
}: {
  count: number
  busy: boolean
  onClear: () => void
  onAction: (action: CampaignBulkAction) => void
}) {
  return (
    <BulkActionBar count={count} busy={busy} onClear={onClear} label={`${count} campaign${count === 1 ? '' : 's'} selected`}>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction('pause')}>
        <Pause aria-hidden="true" /> Pause
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction('resume')}>
        <Play aria-hidden="true" /> Resume
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction('archive')}>
        <Archive aria-hidden="true" /> Archive
      </Button>
    </BulkActionBar>
  )
}
