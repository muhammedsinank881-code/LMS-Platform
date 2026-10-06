import { useState } from 'react'
import { AlertCircle, ChevronDown, Eye, MousePointerClick } from 'lucide-react'
import { Avatar, Badge, Button, Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { htmlToText, sanitizeEmailHtml } from '@/lib/inbox/sanitize-html'
import type { Message } from '@/types'
import { AttachmentPreview } from './AttachmentPreview'
import type { BubbleContext } from './bubble-map'

function Tracking({ message }: { message: Message }) {
  if (message.direction !== 'outbound') return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {message.openedAt ? (
        <Tooltip content={`Opened ${formatDateTime(message.openedAt)}`}>
          <span className="inline-flex">
            <Badge size="sm" tone="success">
              <Eye className="h-3 w-3" aria-hidden="true" /> Opened
            </Badge>
          </span>
        </Tooltip>
      ) : (
        <Badge size="sm" tone="neutral">
          Not opened yet
        </Badge>
      )}
      {message.clickedAt ? (
        <Tooltip content={`Link clicked ${formatDateTime(message.clickedAt)}`}>
          <span className="inline-flex">
            <Badge size="sm" tone="info">
              <MousePointerClick className="h-3 w-3" aria-hidden="true" /> Clicked
            </Badge>
          </span>
        </Tooltip>
      ) : null}
    </div>
  )
}

/** One email in a thread: a collapsible card with sender, subject, body and open/click tracking. */
export function EmailMessage({ message, context }: { message: Message; context: BubbleContext }) {
  const [open, setOpen] = useState(context.isLast)
  const inbound = message.direction === 'inbound'
  const sender = inbound ? context.contactName : context.userName(message.senderId)
  const recipient = inbound ? 'me' : (context.contactEmail ?? context.contactName)
  const preview = htmlToText(message.body).replace(/\s+/g, ' ')
  const failed = message.status === 'failed'
  return (
    <article className={cn('rounded-lg border bg-surface', failed ? 'border-destructive/40' : 'border-border')}>
      <button
        type="button"
        className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`${sender}, ${message.subject || 'no subject'}`}
      >
        <Avatar name={sender} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold">{sender}</p>
            <time dateTime={message.sentAt} className="shrink-0 text-xs text-muted-foreground">
              {formatDateTime(message.sentAt)}
            </time>
          </div>
          <p className="truncate text-xs text-muted-foreground">to {recipient}</p>
          {!open ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{preview}</p> : null}
        </div>
        <ChevronDown
          className={cn('mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border px-3 py-3 text-sm sm:pl-14">
          <p className="font-semibold">{message.subject || '(no subject)'}</p>
          <div
            className="break-words [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(message.body) }}
          />
          {message.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((file) => (
                <AttachmentPreview key={file.name} file={file} />
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tracking message={message} />
            {failed ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> Not delivered
                </span>
                {context.onRetry ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => context.onRetry?.(message.id)}>
                    Failed, retry
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  )
}
