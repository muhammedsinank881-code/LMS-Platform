import { useState } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { CopyButton } from '@/components/common/CopyButton'
import { QueryState } from '@/components/common/QueryState'
import { Badge, Button, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, toast } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import type { DeliveryStatus, WebhookDelivery, WebhookEndpoint } from '@/types'
import { useDeliveries, useRedeliver } from '../hooks/use-webhooks'

const TONE: Record<DeliveryStatus, 'success' | 'warning' | 'destructive'> = { success: 'success', retrying: 'warning', failed: 'destructive' }

function pretty(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2)
  } catch {
    return json
  }
}

function Detail({ delivery, onBack }: { delivery: WebhookDelivery; onBack: () => void }) {
  const redeliver = useRedeliver()
  const body = pretty(delivery.requestBody)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" variant="ghost" onClick={onBack}><ArrowLeft aria-hidden="true" /> All deliveries</Button>
        <Button size="sm" variant="outline" loading={redeliver.isPending} onClick={() => redeliver.mutate(delivery.id, { onSuccess: (next) => { toast.success(next.status === 'success' ? 'Redelivered' : 'Redelivery failed'); onBack() } })}><RotateCcw aria-hidden="true" /> Redeliver</Button>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Event</dt><dd className="font-medium">{delivery.event}</dd></div>
        <div><dt className="text-muted-foreground">Time</dt><dd>{formatDateTime(delivery.at)}</dd></div>
        <div><dt className="text-muted-foreground">Result</dt><dd>{delivery.httpStatus ?? 'Timed out'} after {delivery.durationMs} ms</dd></div>
        <div><dt className="text-muted-foreground">Attempt</dt><dd>{delivery.attempt}{delivery.nextRetryAt ? ` · retry ${formatDateTime(delivery.nextRetryAt)}` : ''}</dd></div>
      </dl>
      <section aria-labelledby="req-headers" className="space-y-1">
        <h3 id="req-headers" className="text-sm font-medium">Request headers</h3>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{Object.entries(delivery.requestHeaders).map(([name, value]) => `${name}: ${value}`).join('\n')}</pre>
      </section>
      <section aria-labelledby="req-body" className="space-y-1">
        <div className="flex items-center justify-between"><h3 id="req-body" className="text-sm font-medium">Request payload</h3><CopyButton value={body} label="Copy payload" /></div>
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{body}</pre>
      </section>
      <section aria-labelledby="res-body" className="space-y-1">
        <h3 id="res-body" className="text-sm font-medium">Response</h3>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{delivery.responseBody}</pre>
      </section>
      <p className="text-xs text-muted-foreground">Secrets such as header values and tokens are redacted in this log.</p>
    </div>
  )
}

/** Delivery history of one endpoint, newest first, with a detail view and manual redelivery. */
export function DeliveryLogDrawer({ endpoint, onClose }: { endpoint: WebhookEndpoint | null; onClose: () => void }) {
  const deliveries = useDeliveries(endpoint?.id ?? null)
  const [selected, setSelected] = useState<string | null>(null)
  const current = deliveries.data?.find((item) => item.id === selected)
  return (
    <Drawer open={endpoint !== null} onOpenChange={(open) => { if (!open) { setSelected(null); onClose() } }}>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>Deliveries</DrawerTitle>
          <DrawerDescription className="break-all">{endpoint?.url}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          {current ? (
            <Detail delivery={current} onBack={() => setSelected(null)} />
          ) : (
            <QueryState isLoading={deliveries.isLoading} isError={deliveries.isError} onRetry={() => void deliveries.refetch()} isEmpty={deliveries.data?.length === 0} emptyTitle="No deliveries yet" emptyDescription="Send a test event, or wait for a subscribed event to happen." size="sm">
              <ul className="divide-y divide-border rounded-md border border-border">
                {(deliveries.data ?? []).map((delivery) => (
                  <li key={delivery.id}>
                    <button type="button" onClick={() => setSelected(delivery.id)} className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                      <span className="min-w-0">
                        <span className="block font-medium">{delivery.event}{delivery.test ? ' (test)' : ''}</span>
                        <span className="block text-xs text-muted-foreground">{formatDateTime(delivery.at)} · attempt {delivery.attempt} · {delivery.durationMs} ms</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs">{delivery.httpStatus ?? 'timeout'}</span>
                        <Badge tone={TONE[delivery.status]} size="sm" dot>{delivery.status}</Badge>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </QueryState>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
