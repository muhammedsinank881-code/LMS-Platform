import type { Message } from '@/types'
import { BubbleShell } from './BubbleShell'

export function WhatsAppBubble({ message, onRetry }: { message: Message; onRetry?: (id: string) => void }) {
  return (
    <BubbleShell message={message} onRetry={onRetry}>
      {message.body ? <p className="whitespace-pre-wrap break-words">{message.body}</p> : null}
    </BubbleShell>
  )
}
