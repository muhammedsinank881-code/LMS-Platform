import { Clock, Lock } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { getWhatsAppWindow } from '@/lib/inbox/whatsapp-window'

/**
 * Status of WhatsApp's 24-hour customer-service window. Open and closing-soon are quiet hints;
 * expired explains why free text is locked and offers the only way forward: a template.
 */
export function WindowLock({
  expiresAt,
  now,
  onPickTemplate,
}: {
  expiresAt: string | null
  now: Date
  onPickTemplate: () => void
}) {
  const window = getWhatsAppWindow(expiresAt, now)
  if (window.state === 'expired') {
    return (
      <div role="status" className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/60 p-3">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium">
            24-hour window closed <span className="font-normal text-muted-foreground">({window.label})</span>
          </p>
          <p className="text-xs text-muted-foreground">
            WhatsApp only allows approved templates until the customer replies.
          </p>
        </div>
        <Button type="button" size="sm" onClick={onPickTemplate}>
          Send a template
        </Button>
      </div>
    )
  }
  return (
    <p
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        window.state === 'closing_soon' ? 'font-medium text-warning' : 'text-muted-foreground',
      )}
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {window.state === 'closing_soon'
        ? `${window.label}. After that, only templates can be sent.`
        : `Free-form replies are open · ${window.label.replace('Open · ', '')}`}
    </p>
  )
}
