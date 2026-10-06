import { useState } from 'react'
import { History } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryState } from '@/components/common/QueryState'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import { useAutomationVersions, useRestoreAutomationVersion } from '../../hooks/use-automations'

/** Published versions, newest first. Restoring loads one into the draft; publishing makes it live. */
export function VersionHistory({
  automationId,
  currentVersion,
  canRestore,
  userName,
}: {
  automationId: string
  currentVersion: number
  canRestore: boolean
  userName: (id: string | null) => string
}) {
  const versions = useAutomationVersions(automationId)
  const restore = useRestoreAutomationVersion()
  const [target, setTarget] = useState<number | null>(null)

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History aria-hidden="true" className="h-4 w-4" />
          Version history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <QueryState
          isLoading={versions.isLoading}
          isError={versions.isError}
          onRetry={() => void versions.refetch()}
          isEmpty={(versions.data ?? []).length === 0}
          emptyTitle="Not published yet"
          emptyDescription="Each publish creates a version you can restore."
          size="sm"
          loading={<Skeleton className="h-16 w-full" />}
        >
          <ul className="space-y-2">
            {(versions.data ?? []).map((v) => (
              <li key={v.id} className="flex items-center gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    Version {v.version}{' '}
                    {v.version === currentVersion ? (
                      <Badge size="sm" tone="primary">
                        Current
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDateTime(v.publishedAt)} · {userName(v.publishedBy)}
                  </p>
                </div>
                {v.version !== currentVersion ? (
                  <Button type="button" variant="outline" size="sm" disabled={!canRestore} onClick={() => setTarget(v.version)}>
                    Restore
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </QueryState>
      </CardContent>
      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={`Restore version ${target ?? ''}?`}
        description="It replaces the draft and pauses the automation until you publish. Nothing changes for running work."
        confirmLabel="Restore as draft"
        loading={restore.isPending}
        onConfirm={() =>
          target !== null &&
          restore.mutate(
            { id: automationId, version: target },
            {
              onSuccess: () => setTarget(null),
            },
          )
        }
      />
    </Card>
  )
}
