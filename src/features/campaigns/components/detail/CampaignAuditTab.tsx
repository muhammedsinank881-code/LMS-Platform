import { History } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { useDirectory } from '@/features/team/hooks/use-team'
import { formatDateTime } from '@/lib/format'
import type { AuditLog } from '@/types'
import { useCampaignActivity } from '../../hooks/use-campaigns'

function describe(log: AuditLog): string {
  const next = log.newValue ?? {}
  const before = log.previousValue ?? {}
  const keys = Object.keys(next)
  if (keys.length === 0) return log.entityLabel
  return keys
    .map((key) => (key in before ? `${key}: ${String(before[key])} → ${String(next[key])}` : `${key}: ${String(next[key])}`))
    .join(', ')
}

export function CampaignAuditTab({ campaignId }: { campaignId: string }) {
  const activity = useCampaignActivity(campaignId)
  const directory = useDirectory()
  const nameOf = (id: string) => directory.data?.find((user) => user.id === id)?.name ?? 'Someone'
  return (
    <QueryState
      isLoading={activity.isLoading}
      isError={activity.isError}
      onRetry={() => void activity.refetch()}
      isEmpty={(activity.data?.length ?? 0) === 0}
      emptyIcon={History}
      emptyTitle="No activity yet"
      emptyDescription="Edits, spend changes and imports are logged here."
    >
      <ol className="space-y-3">
        {(activity.data ?? []).map((log) => (
          <li key={log.id} className="rounded-md border border-border p-3 text-sm">
            <p className="font-medium">
              {nameOf(log.userId)} <span className="font-normal text-muted-foreground">{log.action.replace('_', ' ')} {log.entity === 'spend' ? 'spend' : 'the campaign'}</span>
            </p>
            <p className="text-muted-foreground">{describe(log)}</p>
            <time className="text-xs text-muted-foreground" dateTime={log.createdAt}>{formatDateTime(log.createdAt)}</time>
          </li>
        ))}
      </ol>
    </QueryState>
  )
}
