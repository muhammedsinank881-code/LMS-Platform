import { useState } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { Button, Skeleton } from '@/components/ui'
import { useTemplates } from '@/features/inbox/hooks/use-templates'
import { usePermission } from '@/hooks/use-permission'
import { useBroadcasts, useCancelBroadcast } from '../../hooks/use-broadcasts'
import { BroadcastCard } from './BroadcastCard'
import { BroadcastWizard } from './BroadcastWizard'

export function BroadcastsTab() {
  const { feature, can } = usePermission()
  const canSend = feature('send-broadcasts') && can('campaigns', 'create')
  const list = useBroadcasts()
  const templates = useTemplates()
  const cancel = useCancelBroadcast()
  const [open, setOpen] = useState(false)
  const nameOf = (id: string) => templates.data?.find((t) => t.id === id)?.name ?? 'Template'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Send an approved template to a saved view or tag. Sending is simulated.
        </p>
        {canSend ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" /> New broadcast
          </Button>
        ) : null}
      </div>
      <QueryState
        isLoading={list.isLoading}
        isError={list.isError}
        onRetry={() => void list.refetch()}
        isEmpty={(list.data?.length ?? 0) === 0}
        emptyIcon={MessageSquare}
        emptyTitle="No broadcasts yet"
        emptyDescription="Create a broadcast to message a group of leads on WhatsApp."
        emptyAction={canSend ? <Button onClick={() => setOpen(true)}>New broadcast</Button> : undefined}
        loading={<Skeleton className="h-40 w-full" />}
      >
        <ul className="space-y-3">
          {(list.data ?? []).map((broadcast) => (
            <li key={broadcast.id}>
              <BroadcastCard
                broadcast={broadcast}
                templateName={nameOf(broadcast.templateId)}
                canCancel={canSend}
                cancelling={cancel.isPending && cancel.variables === broadcast.id}
                onCancel={() => cancel.mutate(broadcast.id)}
              />
            </li>
          ))}
        </ul>
      </QueryState>
      <BroadcastWizard open={open} onOpenChange={setOpen} />
    </div>
  )
}
