import { Badge, Button } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import { INTEGRATION_PROVIDER_LABEL, type Integration } from '@/types'
import { PROVIDER_META, STATUS_LABEL, STATUS_TONE } from '../lib/provider-meta'

/** One provider: what it does for the CRM, its status, and the one action that makes sense next. */
export function IntegrationCard({ integration, canManage, onConnect, onManage }: { integration: Integration; canManage: boolean; onConnect: () => void; onManage: () => void }) {
  const { provider, status } = integration
  const meta = PROVIDER_META[provider]
  const Icon = meta.icon
  const label = INTEGRATION_PROVIDER_LABEL[provider]
  const connected = status !== 'not_connected' && status !== 'connecting'
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted"><Icon aria-hidden="true" className="h-5 w-5" /></span>
        <Badge tone={STATUS_TONE[status]} dot>{STATUS_LABEL[status]}</Badge>
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{meta.description}</p>
        {connected ? (
          <p className="text-xs text-muted-foreground">{integration.accountLabel}{integration.lastSyncAt ? ` · synced ${formatDateTime(integration.lastSyncAt)}` : ''}</p>
        ) : null}
      </div>
      {canManage ? (
        connected ? (
          <Button variant="outline" aria-label={`Manage ${label}`} onClick={onManage}>Manage</Button>
        ) : (
          <Button aria-label={`Connect ${label}`} onClick={onConnect}>{status === 'connecting' ? 'Continue connecting' : 'Connect'}</Button>
        )
      ) : null}
    </li>
  )
}
