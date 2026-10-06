import { useMemo, useState } from 'react'
import { Button, Input, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui'
import { cn } from '@/lib/cn'
import { renderTemplate, templateValue, type TemplateRenderContext } from '@/lib/inbox/template-variables'
import { useAuthStore } from '@/store/auth-store'
import type { Lead, MessageTemplate, TemplateChannel } from '@/types'
import { useTemplates } from '../../hooks/use-templates'
import { TemplatePreview } from './TemplatePreview'

export interface PickedTemplate {
  template: MessageTemplate
  text: string
  subject: string | null
  variables: Record<string, string>
}

/** Values the sender can still change: any variable the lead and owner data cannot fill. */
function initialValues(template: MessageTemplate, ctx: TemplateRenderContext): Record<string, string> {
  return Object.fromEntries(
    template.variables.map((name) => [name, templateValue(name, ctx) ?? template.sampleValues[name] ?? '']),
  )
}

export function TemplatePicker({
  open,
  onOpenChange,
  channel,
  lead,
  owner,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: TemplateChannel
  lead?: Lead | null
  owner?: { name: string } | null
  onPick: (picked: PickedTemplate) => void
}) {
  const templates = useTemplates()
  const companyName = useAuthStore((state) => state.tenant?.name ?? null)
  const approved = (templates.data ?? []).filter((item) => item.channel === channel && item.status === 'approved')
  const [id, setId] = useState('')
  const [edited, setEdited] = useState<Record<string, string>>({})
  const selected = approved.find((item) => item.id === id)
  const ctx = useMemo<TemplateRenderContext>(() => ({ lead, owner, companyName }), [lead, owner, companyName])
  const values = selected ? { ...initialValues(selected, ctx), ...edited } : {}
  const render = (text: string) => renderTemplate(text, { ...ctx, fallbacks: values })
  const body = selected ? render(selected.body) : null
  const subject = selected?.subject ? render(selected.subject) : null
  const missing = [...(body?.missing ?? []), ...(subject?.missing ?? [])]

  const choose = (next: string) => {
    setId(next)
    setEdited({})
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Send a template</ModalTitle>
          <ModalDescription>
            Pick an approved {channel === 'whatsapp' ? 'WhatsApp' : 'email'} template and fill in its variables.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="grid gap-4 md:grid-cols-[14rem_1fr]">
          <ul className="max-h-72 space-y-1 overflow-y-auto" aria-label="Approved templates">
            {approved.length === 0 ? (
              <li className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                No approved templates yet. Create one in Settings → Message templates.
              </li>
            ) : null}
            {approved.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={item.id === id}
                  onClick={() => choose(item.id)}
                  className={cn(
                    'w-full rounded-md border px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    item.id === id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                  )}
                >
                  <span className="block font-medium">{item.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.category} · {item.language}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="min-w-0 space-y-3">
            {selected ? (
              <>
                {selected.variables.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selected.variables.map((name) => (
                      <label key={name} className="space-y-1 text-xs font-medium text-muted-foreground">
                        {`{{${name}}}`}
                        <Input
                          aria-label={name}
                          value={values[name] ?? ''}
                          onChange={(event) => setEdited((current) => ({ ...current, [name]: event.target.value }))}
                        />
                      </label>
                    ))}
                  </div>
                ) : null}
                <TemplatePreview
                  channel={channel}
                  header={selected.header ? render(selected.header).text : null}
                  subject={subject?.text ?? null}
                  body={body?.text ?? ''}
                  footer={selected.footer ? render(selected.footer).text : null}
                  buttons={selected.buttons}
                />
                {missing.length > 0 ? (
                  <p className="text-xs text-warning">Still empty: {missing.join(', ')}. Fill them in before sending.</p>
                ) : null}
              </>
            ) : (
              <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Choose a template to preview it.
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selected || missing.length > 0}
            onClick={() => {
              if (!selected || !body) return
              onPick({ template: selected, text: body.text, subject: subject?.text ?? null, variables: values })
              onOpenChange(false)
            }}
          >
            Use template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
