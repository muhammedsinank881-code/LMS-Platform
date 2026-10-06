import { ExternalLink, Phone, Reply } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { TemplateButton, TemplateChannel } from '@/types'

const BUTTON_ICON = { quick_reply: Reply, url: ExternalLink, call: Phone } as const

/** What the customer will see: a chat bubble for WhatsApp, a subject and body for email. */
export function TemplatePreview({
  channel,
  header,
  subject,
  body,
  footer,
  buttons = [],
  className,
}: {
  channel: TemplateChannel
  header?: string | null
  subject?: string | null
  body: string
  footer?: string | null
  buttons?: TemplateButton[]
  className?: string
}) {
  return (
    <div
      className={cn('rounded-lg bg-muted/60 p-3', className)}
      role="group"
      aria-label="Preview"
    >
      <div className="max-w-sm space-y-1.5 rounded-2xl rounded-bl-md border border-border bg-surface px-3 py-2 text-sm">
        {channel === 'email' && subject ? <p className="font-semibold">{subject}</p> : null}
        {header ? <p className="font-semibold">{header}</p> : null}
        <p className="whitespace-pre-wrap break-words">{body || 'Your message appears here'}</p>
        {footer ? <p className="text-xs text-muted-foreground">{footer}</p> : null}
        {buttons.length > 0 ? (
          <ul className="space-y-1 border-t border-border pt-1.5">
            {buttons.map((button) => {
              const Icon = BUTTON_ICON[button.kind]
              return (
                <li key={button.label} className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {button.label}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
