import { useState } from 'react'
import { Plus, RefreshCw, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { SecretField } from '@/components/common/SecretField'
import { Button, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, Input, MultiSelect, Switch, toast } from '@/components/ui'
import { useSources } from '@/features/settings/hooks/use-lead-config'
import { WEBHOOK_EVENTS, webhookSchema, type WebhookEndpoint, type WebhookInput } from '@/types'
import { useRotateWebhookSecret, useSaveWebhook } from '../hooks/use-webhooks'

const EMPTY: WebhookInput = { url: 'https://', description: '', events: ['lead.created'], enabled: true, headers: [], filter: null }

const toInput = (endpoint: WebhookEndpoint): WebhookInput => ({
  url: endpoint.url,
  description: endpoint.description,
  events: endpoint.events,
  enabled: endpoint.enabled,
  headers: endpoint.headers.map((header) => ({ name: header.name, value: '' })),
  filter: endpoint.filter,
})

/** Create or edit an endpoint. Header values and the signing secret are write-only. */
export function WebhookEditorDrawer({ endpoint, open, onClose, onSecret }: { endpoint: WebhookEndpoint | null; open: boolean; onClose: () => void; onSecret: (secret: string) => void }) {
  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      {open ? <EditorBody key={endpoint?.id ?? 'new'} endpoint={endpoint} onClose={onClose} onSecret={onSecret} /> : null}
    </Drawer>
  )
}

/** Mounted fresh each time the drawer opens, so its draft always starts from the saved endpoint. */
function EditorBody({ endpoint, onClose, onSecret }: { endpoint: WebhookEndpoint | null; onClose: () => void; onSecret: (secret: string) => void }) {
  const save = useSaveWebhook()
  const rotate = useRotateWebhookSecret()
  const sources = useSources()
  const [values, setValues] = useState<WebhookInput>(() => (endpoint ? toInput(endpoint) : EMPTY))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmRotate, setConfirmRotate] = useState(false)


  const set = (patch: Partial<WebhookInput>) => setValues((current) => ({ ...current, ...patch }))

  function submit() {
    const payload: WebhookInput = { ...values, headers: values.headers.map((header) => ({ name: header.name, value: header.value || undefined })) }
    const parsed = webhookSchema.safeParse(payload)
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])))
      return
    }
    setErrors({})
    save.mutate({ id: endpoint?.id ?? null, values: payload }, {
      onSuccess: (result) => {
        if (result.secret) onSecret(result.secret)
        else toast.success('Endpoint saved')
        save.reset()
        onClose()
      },
    })
  }

  const setHeader = (index: number, patch: Partial<WebhookInput['headers'][number]>) => set({ headers: values.headers.map((header, i) => (i === index ? { ...header, ...patch } : header)) })

  return (
    <>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>{endpoint ? 'Edit endpoint' : 'Add a webhook endpoint'}</DrawerTitle>
          <DrawerDescription>LeadFlow sends a signed POST to this URL when the events you pick happen.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="space-y-5">
          <FormField id="wh-url" label="Endpoint URL" required error={errors.url}>
            {(control) => <Input {...control} type="url" value={values.url} onChange={(event) => set({ url: event.target.value })} />}
          </FormField>
          <FormField id="wh-desc" label="Description" error={errors.description}>
            {(control) => <Input {...control} value={values.description} placeholder="Warehouse sync" onChange={(event) => set({ description: event.target.value })} />}
          </FormField>
          <FormField id="wh-events" label="Events" required error={errors.events}>
            {(control) => <MultiSelect id={control.id} aria-label="Events" maxVisible={2} value={values.events} onValueChange={(events) => set({ events: events as WebhookInput['events'] })} options={WEBHOOK_EVENTS.map((event) => ({ value: event, label: event }))} placeholder="Choose events" />}
          </FormField>
          <FormField id="wh-filter" label="Only for leads from these sources" hint="Optional. Empty sends every lead.">
            {(control) => <MultiSelect id={control.id} aria-label="Source filter" value={values.filter?.sourceIds ?? []} onValueChange={(sourceIds) => set({ filter: sourceIds.length > 0 ? { sourceIds } : null })} options={(sources.data ?? []).map((source) => ({ value: source.id, label: source.name }))} placeholder="All sources" />}
          </FormField>
          <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
            <label htmlFor="wh-enabled" className="text-sm font-medium">Enabled</label>
            <Switch id="wh-enabled" checked={values.enabled} onCheckedChange={(enabled) => set({ enabled })} />
          </div>
          <section className="space-y-2" aria-labelledby="wh-headers">
            <div className="flex items-center justify-between">
              <h3 id="wh-headers" className="text-sm font-medium">Custom headers</h3>
              <Button size="sm" variant="outline" disabled={values.headers.length >= 5} onClick={() => set({ headers: [...values.headers, { name: '', value: '' }] })}><Plus aria-hidden="true" /> Add header</Button>
            </div>
            {errors.headers ? <p role="alert" className="text-sm text-destructive">{errors.headers}</p> : null}
            {values.headers.map((header, index) => {
              const stored = endpoint?.headers.find((item) => item.name === header.name)
              return (
                <div key={index} className="flex items-center gap-2">
                  <Input aria-label={`Header ${index + 1} name`} placeholder="X-Api-Token" value={header.name} onChange={(event) => setHeader(index, { name: event.target.value })} />
                  <Input aria-label={`Header ${index + 1} value`} type="password" autoComplete="off" placeholder={stored ? `${stored.masked} (leave blank to keep)` : 'Value'} value={header.value ?? ''} onChange={(event) => setHeader(index, { value: event.target.value })} />
                  <Button size="icon-sm" variant="ghost" aria-label={`Remove header ${index + 1}`} onClick={() => set({ headers: values.headers.filter((_, i) => i !== index) })}><X /></Button>
                </div>
              )
            })}
          </section>
          {endpoint ? (
            <section className="space-y-2 rounded-md border border-border p-3" aria-labelledby="wh-secret">
              <h3 id="wh-secret" className="text-sm font-medium">Signing secret</h3>
              <div className="flex flex-wrap items-center gap-3">
                <SecretField masked={`whsec_••••${endpoint.secretLast4}`} label="Signing secret" />
                <Button size="sm" variant="outline" onClick={() => setConfirmRotate(true)}><RefreshCw aria-hidden="true" /> Rotate secret</Button>
              </div>
              <p className="text-sm text-muted-foreground">Use it to verify the X-LeadFlow-Signature header. It was shown once when the endpoint was created.</p>
            </section>
          ) : null}
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} onClick={submit}>{endpoint ? 'Save changes' : 'Add endpoint'}</Button>
        </DrawerFooter>
      </DrawerContent>
      <ConfirmDialog
        open={confirmRotate}
        onOpenChange={setConfirmRotate}
        title="Rotate the signing secret?"
        description="Deliveries are signed with the new secret straight away. Update your receiver first, or it will reject them."
        confirmLabel="Rotate secret"
        loading={rotate.isPending}
        onConfirm={() => endpoint && rotate.mutate(endpoint.id, { onSuccess: ({ secret }) => { onSecret(secret); rotate.reset(); setConfirmRotate(false) } })}
      />
    </>
  )
}
