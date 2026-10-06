import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/format'
import type { Message } from '@/types'
import { AttachmentPreview } from './AttachmentPreview'
import { DeliveryTicks } from './DeliveryTicks'

/** Chat bubble frame shared by text, media and template messages. */
export function BubbleShell({
  message,
  onRetry,
  children,
}: {
  message: Message
  onRetry?: (id: string) => void
  children: ReactNode
}) {
  const mine = message.direction === 'outbound'
  const failed = message.status === 'failed'
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[88%] space-y-1.5 rounded-2xl border px-3 py-2 text-sm sm:max-w-[75%]',
          mine ? 'rounded-br-md border-primary/20 bg-primary/10' : 'rounded-bl-md border-border bg-surface',
          failed && 'border-destructive/40 bg-destructive/5',
        )}
      >
        {message.attachments.map((file) => (
          <AttachmentPreview key={file.name} file={file} />
        ))}
        {children}
        <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
          <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
          <DeliveryTicks message={message} />
        </div>
        {failed ? (
          <div className="flex items-center justify-between gap-3 border-t border-destructive/20 pt-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> Not delivered
            </span>
            {onRetry ? (
              <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onRetry(message.id)}>
                Failed, retry
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
