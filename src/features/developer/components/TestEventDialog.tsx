import { useState } from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, Select, toast } from '@/components/ui'
import { samplePayload } from '@/lib/webhooks/payload'
import { WEBHOOK_EVENTS, WEBHOOK_OUTCOMES, type WebhookEndpoint, type WebhookEvent, type WebhookOutcome } from '@/types'
import { useSendTestEvent } from '../hooks/use-webhooks'

const OUTCOME_LABEL: Record<WebhookOutcome, string> = { success: 'Success (200)', http_500: 'Server error (500)', timeout: 'Timeout' }

/** Sends a sample event to one endpoint. In development the outcome can be forced, to see retries and failures. */
export function TestEventDialog({ endpoint, onClose }: { endpoint: WebhookEndpoint | null; onClose: () => void }) {
  const send = useSendTestEvent()
  const [event, setEvent] = useState<WebhookEvent>('lead.created')
  const [outcome, setOutcome] = useState<WebhookOutcome | 'default'>('default')
  const subscribed = endpoint ? WEBHOOK_EVENTS.filter((item) => endpoint.events.includes(item)) : []
  const options = (subscribed.length > 0 ? subscribed : WEBHOOK_EVENTS).map((item) => ({ value: item, label: item }))

  return (
    <Modal open={endpoint !== null} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Send a test event</ModalTitle>
          <ModalDescription className="break-all">Delivers a sample payload to {endpoint?.url}. Test events are never retried.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="test-event" className="text-sm font-medium">Event</label>
            <Select id="test-event" value={event} onValueChange={(value) => setEvent(value as WebhookEvent)} options={options} />
          </div>
          {import.meta.env.DEV ? (
            <div className="space-y-1">
              <label htmlFor="test-outcome" className="text-sm font-medium">Simulated response (dev only)</label>
              <Select id="test-outcome" value={outcome} onValueChange={(value) => setOutcome(value as WebhookOutcome | 'default')} options={[{ value: 'default', label: 'Use the simulator default' }, ...WEBHOOK_OUTCOMES.map((item) => ({ value: item, label: OUTCOME_LABEL[item] }))]} />
            </div>
          ) : null}
          <div className="space-y-1">
            <p className="text-sm font-medium">Sample payload</p>
            <pre className="max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(samplePayload(event), null, 2)}</pre>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button
            loading={send.isPending}
            onClick={() => endpoint && send.mutate({ endpointId: endpoint.id, event, outcome: outcome === 'default' ? undefined : outcome }, { onSuccess: (delivery) => (delivery.status === 'success' ? toast.success(`Delivered: HTTP ${delivery.httpStatus}`) : toast.error('Delivery failed', { description: delivery.httpStatus ? `HTTP ${delivery.httpStatus}` : 'The request timed out.' })) })}
          >
            Send test event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
