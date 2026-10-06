import { AlertCircle, Check, CheckCheck, Clock3 } from 'lucide-react'
import type { Message, MessageStatus } from '@/types'

const LABEL: Record<MessageStatus, string> = {
  queued: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed',
}

/** WhatsApp convention: clock = sending, one tick = sent, two grey = delivered, two blue = read. */
export function DeliveryTicks({ message }: { message: Message }) {
  if (message.direction !== 'outbound' || message.isInternalNote) return null
  const label = LABEL[message.status]
  const icon = 'h-3.5 w-3.5'
  return (
    <span className="inline-flex" role="img" aria-label={label} title={label}>
      {message.status === 'queued' ? <Clock3 className={`${icon} text-muted-foreground`} /> : null}
      {message.status === 'sent' ? <Check className={`${icon} text-muted-foreground`} /> : null}
      {message.status === 'delivered' ? <CheckCheck className={`${icon} text-muted-foreground`} /> : null}
      {message.status === 'read' ? <CheckCheck className={`${icon} text-info`} /> : null}
      {message.status === 'failed' ? <AlertCircle className={`${icon} text-destructive`} /> : null}
    </span>
  )
}
