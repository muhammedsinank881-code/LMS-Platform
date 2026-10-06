import { AlertTriangle, ArrowDownToLine, CheckCircle2, Link2, Link2Off, MessageSquare, RefreshCw, Settings2, type LucideIcon } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { formatDateTime } from '@/lib/format/date'
import type { IntegrationEventType, IntegrationProvider } from '@/types'
import { useIntegrationEvents } from '../hooks/use-integrations'

const ICON: Record<IntegrationEventType, LucideIcon> = {
  connected: Link2,
  disconnected: Link2Off,
  reconnected: RefreshCw,
  config_changed: Settings2,
  lead_received: ArrowDownToLine,
  message_sent: MessageSquare,
  sync_ok: CheckCircle2,
  error: AlertTriangle,
}

/** The last 50 things this integration did: leads received, messages sent, syncs and errors. */
export function ActivityLog({ provider }: { provider: IntegrationProvider }) {
  const events = useIntegrationEvents(provider)
  return (
    <QueryState isLoading={events.isLoading} isError={events.isError} onRetry={() => void events.refetch()} isEmpty={events.data?.length === 0} emptyTitle="No activity yet" emptyDescription="Events appear here once the integration is used." size="sm">
      <ol className="divide-y divide-border rounded-md border border-border" aria-label="Recent activity">
        {(events.data ?? []).map((event) => {
          const Icon = ICON[event.type]
          return (
            <li key={event.id} className="flex items-start gap-3 p-3 text-sm">
              <Icon aria-hidden="true" className={event.type === 'error' ? 'mt-0.5 h-4 w-4 shrink-0 text-destructive' : 'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground'} />
              <div className="min-w-0 flex-1">
                <p>{event.message}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(event.at)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </QueryState>
  )
}
