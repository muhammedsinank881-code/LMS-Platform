import { Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { EMPTY_VALUE } from '@/lib/format/shared'
import { hasErrorCode } from '@/services/api/errors'
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs'
import { useDirectory } from '@/features/team/hooks/use-team'
import type { AuditValue, Lead } from '@/types'

export function AuditTab({ lead }: { lead: Lead }) {
  const logs = useAuditLogs({
    filters: [
      { field: 'entity', operator: 'equals', value: 'lead' },
      { field: 'entityId', operator: 'equals', value: lead.id },
    ],
    sort: [{ field: 'createdAt', direction: 'desc' }],
    pageSize: 50,
  })
  const directory = useDirectory()

  if (hasErrorCode(logs.error, 'forbidden')) {
    return (
      <EmptyState
        size="sm"
        title="Audit log is restricted"
        description="Your role cannot view audit history."
      />
    )
  }
  if (logs.isLoading) return <Skeleton className="h-24 w-full" />
  if (logs.isError) {
    return (
      <EmptyState
        size="sm"
        tone="destructive"
        title="Couldn't load the audit log"
        action={<Button variant="outline" onClick={() => void logs.refetch()}>Retry</Button>}
      />
    )
  }
  const items = logs.data?.items ?? []
  if (items.length === 0) {
    return <EmptyState size="sm" title="No audit entries" description="Changes to this lead will be recorded here." />
  }

  return (
    <ol className="space-y-2">
      {items.map((entry) => {
        const user = directory.data?.find((person) => person.id === entry.userId)
        return (
          <li key={entry.id}>
            <Card className="space-y-1 p-4 text-sm">
              <p className="font-medium">{formatChange(entry.previousValue, entry.newValue)}</p>
              <p className="text-muted-foreground">
                {user?.name ?? 'Someone'} · {formatDateTime(entry.createdAt)}
              </p>
            </Card>
          </li>
        )
      })}
    </ol>
  )
}

function formatChange(previous: AuditValue | null, next: AuditValue | null): string {
  const keys = [...new Set([...Object.keys(previous ?? {}), ...Object.keys(next ?? {})])]
  if (keys.length === 0) return 'Updated'
  return keys
    .map((key) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1)
      return `${label}: ${show(previous?.[key])} → ${show(next?.[key])}`
    })
    .join(' · ')
}

function show(value: AuditValue[string] | undefined): string {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}
