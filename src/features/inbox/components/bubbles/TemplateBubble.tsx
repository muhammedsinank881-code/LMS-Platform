import { ExternalLink, Phone, Reply } from 'lucide-react'
import type { Message, TemplateButton } from '@/types'
import { useTemplates } from '../../hooks/use-templates'
import { BubbleShell } from './BubbleShell'

const BUTTON_ICON = { quick_reply: Reply, url: ExternalLink, call: Phone } as const

function TemplateButtons({ buttons }: { buttons: TemplateButton[] }) {
  if (buttons.length === 0) return null
  return (
    <ul className="space-y-1 border-t border-border/60 pt-1.5">
      {buttons.map((button) => {
        const Icon = BUTTON_ICON[button.kind]
        return (
          <li
            key={button.label}
            className="flex items-center justify-center gap-1.5 rounded-md bg-surface px-3 py-1.5 text-xs font-medium text-primary"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {button.label}
          </li>
        )
      })}
    </ul>
  )
}

/** A sent template: shows the approved header, footer and buttons around the filled-in body. */
export function TemplateBubble({ message, onRetry }: { message: Message; onRetry?: (id: string) => void }) {
  const templates = useTemplates()
  const template = (templates.data ?? []).find((item) => item.id === message.templateId)
  return (
    <BubbleShell message={message} onRetry={onRetry}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Template{template ? ` · ${template.name}` : ''}
      </p>
      {template?.header ? <p className="font-semibold">{template.header}</p> : null}
      <p className="whitespace-pre-wrap break-words">{message.body}</p>
      {template?.footer ? <p className="text-xs text-muted-foreground">{template.footer}</p> : null}
      {template ? <TemplateButtons buttons={template.buttons} /> : null}
    </BubbleShell>
  )
}
