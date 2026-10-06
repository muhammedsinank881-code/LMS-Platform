import { useState } from 'react'
import { History, Pencil, Play, Plus, Trash2, Webhook } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryState } from '@/components/common/QueryState'
import { SecretRevealDialog } from '@/components/common/SecretRevealDialog'
import { Badge, Button, Switch } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import type { WebhookEndpointView, WebhookStatus } from '@/types'
import { useRemoveWebhook, useSaveWebhook, useWebhooks } from '../hooks/use-webhooks'
import { DeliveryLogDrawer } from './DeliveryLogDrawer'
import { PayloadReference } from './PayloadReference'
import { TestEventDialog } from './TestEventDialog'
import { WebhookEditorDrawer } from './WebhookEditorDrawer'

const STATUS: Record<WebhookStatus, { label: string; tone: 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Active', tone: 'success' },
  failing: { label: 'Failing', tone: 'warning' },
  paused: { label: 'Paused', tone: 'destructive' },
}

function EndpointCard({ endpoint, onEdit, onTest, onLog, onDelete }: { endpoint: WebhookEndpointView; onEdit: () => void; onTest: () => void; onLog: () => void; onDelete: () => void }) {
  const save = useSaveWebhook()
  const state = STATUS[endpoint.status]
  const toggle = (enabled: boolean) =>
    save.mutate({ id: endpoint.id, values: { url: endpoint.url, description: endpoint.description, events: endpoint.events, enabled, headers: endpoint.headers.map((header) => ({ name: header.name })), filter: endpoint.filter } })
  return (
    <li className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{endpoint.description || 'Webhook endpoint'}</h3>
          <p className="break-all text-sm text-muted-foreground">{endpoint.url}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={state.tone} dot>{state.label}</Badge>
          <Switch aria-label={`${endpoint.enabled ? 'Disable' : 'Enable'} ${endpoint.description || endpoint.url}`} checked={endpoint.enabled} disabled={save.isPending} onCheckedChange={toggle} />
        </div>
      </div>
      {endpoint.status === 'paused' ? (
        <p role="status" className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm">{endpoint.pausedReason} Turn it off and on again once the receiver is fixed.</p>
      ) : null}
      <ul className="flex flex-wrap gap-1.5" aria-label="Subscribed events">
        {endpoint.events.map((event) => <li key={event}><Badge size="sm">{event}</Badge></li>)}
      </ul>
      <p className="text-sm text-muted-foreground">
        {endpoint.health.successRate === null ? 'No deliveries yet' : `${endpoint.health.successRate}% success over the last ${endpoint.health.total}`}
        {endpoint.lastDeliveryAt ? ` · last ${formatDateTime(endpoint.lastDeliveryAt)}` : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onLog}><History aria-hidden="true" /> Deliveries</Button>
        <Button size="sm" variant="outline" onClick={onTest}><Play aria-hidden="true" /> Send test event</Button>
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil aria-hidden="true" /> Edit</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 aria-hidden="true" /> Delete</Button>
      </div>
    </li>
  )
}

export function WebhooksTab() {
  const webhooks = useWebhooks()
  const remove = useRemoveWebhook()
  const [editing, setEditing] = useState<WebhookEndpointView | 'new' | null>(null)
  const [testing, setTesting] = useState<WebhookEndpointView | null>(null)
  const [logging, setLogging] = useState<WebhookEndpointView | null>(null)
  const [deleting, setDeleting] = useState<WebhookEndpointView | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const endpoint = editing === 'new' ? null : editing

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-muted-foreground">LeadFlow sends a signed HTTPS POST to your endpoint when leads and deals change. Failed deliveries retry after 1, 5 and 30 minutes.</p>
        <Button onClick={() => setEditing('new')}><Plus aria-hidden="true" /> Add endpoint</Button>
      </div>
      <QueryState isLoading={webhooks.isLoading} isError={webhooks.isError} onRetry={() => void webhooks.refetch()} isEmpty={webhooks.data?.length === 0} emptyIcon={Webhook} emptyTitle="No webhook endpoints" emptyDescription="Add an endpoint to push lead and deal events to your own systems." emptyAction={<Button onClick={() => setEditing('new')}>Add an endpoint</Button>}>
        <ul className="grid gap-3 lg:grid-cols-2">
          {(webhooks.data ?? []).map((item) => (
            <EndpointCard key={item.id} endpoint={item} onEdit={() => setEditing(item)} onTest={() => setTesting(item)} onLog={() => setLogging(item)} onDelete={() => setDeleting(item)} />
          ))}
        </ul>
      </QueryState>
      <PayloadReference />
      <WebhookEditorDrawer endpoint={endpoint} open={editing !== null} onClose={() => setEditing(null)} onSecret={setSecret} />
      <TestEventDialog endpoint={testing} onClose={() => setTesting(null)} />
      <DeliveryLogDrawer endpoint={logging} onClose={() => setLogging(null)} />
      <SecretRevealDialog secret={secret} label="Signing secret" title="Your signing secret" description="Use it to verify the X-LeadFlow-Signature header on every delivery." onClose={() => setSecret(null)} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this endpoint?"
        description="Its delivery history is removed and no more events are sent to it."
        confirmLabel="Delete endpoint"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  )
}
