import { Lock } from 'lucide-react'
import { formatTime } from '@/lib/format'
import type { Message } from '@/types'

/** Internal notes sit centred in warning tones and are never sent to the customer. */
export function NoteBubble({ message }: { message: Message }) {
  return (
    <div className="mx-auto max-w-[92%] rounded-lg border border-dashed border-warning/60 bg-warning/10 px-3 py-2 text-sm sm:max-w-[80%]">
      <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Lock className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
        Internal note · only your team can see this
      </p>
      <p className="whitespace-pre-wrap break-words">{message.body}</p>
      <p className="mt-1 text-right text-[11px] text-muted-foreground">{formatTime(message.sentAt)}</p>
    </div>
  )
}
