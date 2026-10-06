import { useState } from 'react'
import { Button, Select, toast } from '@/components/ui'
import { MESSAGE_STATUSES, type MessageStatus } from '@/types'
import {
  useRecentOutbound,
  useSimulateDelivery,
  useSimulateEmailClick,
  useSimulateEmailOpen,
} from '../hooks/use-simulator'

function isMessageStatus(value: string): value is MessageStatus {
  return (MESSAGE_STATUSES as readonly string[]).includes(value)
}

/** Delivery and tracking events for a sent message, picked from the most recent ones. */
export function SimulatorDelivery() {
  const recent = useRecentOutbound()
  const delivery = useSimulateDelivery()
  const opened = useSimulateEmailOpen()
  const clicked = useSimulateEmailClick()
  const [picked, setPicked] = useState('')
  const [status, setStatus] = useState<MessageStatus>('delivered')
  const messages = recent.data ?? []
  const message = messages.find((item) => item.id === picked) ?? messages[0]
  const isEmail = message?.channel === 'email'

  return (
    <section className="space-y-2 border-t border-border pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sent messages</h3>
      {messages.length === 0 ? (
        <p className="text-xs text-muted-foreground">Send a WhatsApp message or email from the Inbox first.</p>
      ) : (
        <>
          <Select
            aria-label="Sent message"
            value={message?.id ?? ''}
            onValueChange={setPicked}
            options={messages.map((item) => ({
              value: item.id,
              label: `${item.channel === 'email' ? 'Email' : 'WhatsApp'} · ${item.contact}: ${item.preview} (${item.status})`,
            }))}
          />
          <div className="flex gap-2">
            <Select
              aria-label="Delivery status"
              className="flex-1"
              value={status}
              onValueChange={(value) => isMessageStatus(value) && setStatus(value)}
              options={MESSAGE_STATUSES.map((item) => ({ value: item, label: item }))}
            />
            <Button
              type="button"
              size="sm"
              disabled={!message}
              loading={delivery.isPending}
              onClick={() => message && delivery.mutate({ messageId: message.id, status }, { onSuccess: () => toast.success(`Marked ${status}`) })}
            >
              Set status
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={!isEmail} onClick={() => message && opened.mutate(message.id, { onSuccess: () => toast.success('Email opened') })}>
              Email opened
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={!isEmail} onClick={() => message && clicked.mutate(message.id, { onSuccess: () => toast.success('Link clicked') })}>
              Link clicked
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
