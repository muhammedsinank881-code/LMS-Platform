import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Select,
  Textarea,
  toast,
} from '@/components/ui'
import { TemplatePreview } from '@/features/inbox/components/composers/TemplatePreview'
import { useCreateTemplate, useCloneTemplate, useSubmitTemplate, useUpdateTemplate } from '@/features/inbox/hooks/use-templates'
import { SAMPLE_LEAD, SAMPLE_OWNER } from '@/lib/inbox/sample-lead'
import {
  parseTemplateVariables,
  renderTemplate,
  templateEdgeVariableError,
  validateTemplateVariables,
} from '@/lib/inbox/template-variables'
import { useAuthStore } from '@/store/auth-store'
import { TEMPLATE_CATEGORIES, type MessageTemplate } from '@/types'
import { useCustomFields } from '../../hooks/use-settings'
import {
  LANGUAGES,
  WHATSAPP_BODY_LIMIT,
  templateDefaults,
  templateFormSchema,
  toTemplateInput,
  type TemplateFormValues,
} from '../../lib/template-form'
import { TemplateButtonsField } from './TemplateButtonsField'
import { TemplateSampleValues } from './TemplateSampleValues'
import { VariableToolbar } from './VariableToolbar'

const FIELD_FOR_ID = { 'tpl-subject': 'subject', 'tpl-header': 'header', 'tpl-body': 'body', 'tpl-footer': 'footer' } as const
type TextField = (typeof FIELD_FOR_ID)[keyof typeof FIELD_FOR_ID]

export function TemplateEditorDrawer({
  open,
  template,
  onOpenChange,
}: {
  open: boolean
  template: MessageTemplate | null
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateTemplate()
  const update = useUpdateTemplate()
  const submit = useSubmitTemplate()
  const clone = useCloneTemplate()
  const customFields = useCustomFields()
  const companyName = useAuthStore((state) => state.tenant?.name ?? null)
  const [activeField, setActiveField] = useState<TextField>('body')
  const form = useForm<TemplateFormValues>({ resolver: zodResolver(templateFormSchema), defaultValues: templateDefaults(template) })
  const { register, watch, setValue, control, formState } = form
  const { errors } = formState
  const locked = template?.status === 'approved' || template?.status === 'pending'
  const values = useWatch({ control }) as TemplateFormValues
  const whatsapp = values.channel === 'whatsapp'
  const leadFields = useMemo(
    () => (customFields.data ?? []).filter((field) => field.entity === 'lead' && !field.archived).map((field) => ({ key: field.key, label: field.label })),
    [customFields.data],
  )
  const text = [values.subject, values.header, values.body, values.footer].filter(Boolean).join(' ')
  const variables = parseTemplateVariables(text)
  const unknown = validateTemplateVariables(text, leadFields.map((field) => field.key)).unknown
  const edgeError = whatsapp ? templateEdgeVariableError(values.body) : null
  const bodyError = errors.body?.message ?? (unknown.length ? `Unknown variable: ${unknown.join(', ')}` : undefined)
  const blocked = unknown.length > 0 || (whatsapp && values.body.length > WHATSAPP_BODY_LIMIT)
  const busy = create.isPending || update.isPending || submit.isPending

  useEffect(() => {
    form.reset(templateDefaults(template))
  }, [form, template, open])

  const preview = (value: string | undefined) =>
    renderTemplate(value ?? '', {
      lead: SAMPLE_LEAD,
      owner: SAMPLE_OWNER,
      companyName,
      fallbacks: Object.fromEntries(Object.entries(values.sampleValues).filter(([, sample]) => sample)),
    }).text

  const insert = (token: string) => {
    const id = (Object.keys(FIELD_FOR_ID) as Array<keyof typeof FIELD_FOR_ID>).find((key) => FIELD_FOR_ID[key] === activeField) ?? 'tpl-body'
    const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null
    const current = values[activeField] ?? ''
    const start = element?.selectionStart ?? current.length
    const end = element?.selectionEnd ?? current.length
    setValue(activeField, `${current.slice(0, start)}${token}${current.slice(end)}`, { shouldDirty: true, shouldValidate: true })
    requestAnimationFrame(() => {
      element?.focus()
      element?.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const save = (andSubmit: boolean) =>
    form.handleSubmit(async (input) => {
      if (blocked) return
      const payload = toTemplateInput(input)
      const saved = template
        ? await update.mutateAsync({ id: template.id, patch: payload })
        : await create.mutateAsync(payload)
      if (andSubmit) await submit.mutateAsync(saved.id)
      toast.success(andSubmit ? 'Submitted for approval' : 'Template saved')
      onOpenChange(false)
    })()

  const field = (id: keyof typeof FIELD_FOR_ID) => ({ onFocus: () => setActiveField(FIELD_FOR_ID[id]) })

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="lg" className="sm:max-w-4xl">
        <DrawerHeader>
          <DrawerTitle>{template ? (locked ? template.name : 'Edit template') : 'New template'}</DrawerTitle>
          <DrawerDescription>
            {whatsapp ? 'WhatsApp templates are reviewed before they can be sent.' : 'Email templates are ready to use as soon as you save them.'}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="grid gap-6 md:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-4">
            {locked ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/60 p-3 text-sm">
                <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="min-w-0 flex-1">
                  {template?.status === 'approved' ? 'Approved templates are locked.' : 'This template is in review.'} Clone it to make changes.
                </p>
                {template ? (
                  <Button type="button" size="sm" variant="outline" loading={clone.isPending} onClick={() => clone.mutate(template.id, { onSuccess: () => { toast.success('Cloned as a draft'); onOpenChange(false) } })}>
                    Clone as draft
                  </Button>
                ) : null}
              </div>
            ) : null}
            {template?.status === 'rejected' && template.rejectionReason ? (
              <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <p className="font-medium text-destructive">Rejected by the review</p>
                <p className="text-muted-foreground">{template.rejectionReason}</p>
                <p className="mt-1 text-xs text-muted-foreground">Fix the issue, then save and submit again.</p>
              </div>
            ) : null}
            <fieldset disabled={locked} className="min-w-0 space-y-4">
              <FormField id="tpl-name" label="Name" required error={errors.name?.message}>
                {(control) => <Input {...control} {...register('name')} />}
              </FormField>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField id="tpl-channel" label="Channel">
                  {(control) => (
                    <Select
                      {...control}
                      disabled={Boolean(template)}
                      value={values.channel}
                      onValueChange={(value) => setValue('channel', value as TemplateFormValues['channel'], { shouldDirty: true })}
                      options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'email', label: 'Email' }]}
                    />
                  )}
                </FormField>
                <FormField id="tpl-category" label="Category">
                  {(control) => (
                    <Select
                      {...control}
                      value={values.category}
                      onValueChange={(value) => setValue('category', value as TemplateFormValues['category'], { shouldDirty: true })}
                      options={TEMPLATE_CATEGORIES.map((item) => ({ value: item, label: item[0].toUpperCase() + item.slice(1) }))}
                    />
                  )}
                </FormField>
                <FormField id="tpl-language" label="Language">
                  {(control) => (
                    <Select {...control} value={values.language} onValueChange={(value) => setValue('language', value, { shouldDirty: true })} options={LANGUAGES.map((item) => ({ value: item.value, label: item.label }))} />
                  )}
                </FormField>
              </div>
              {!whatsapp ? (
                <FormField id="tpl-subject" label="Subject" error={errors.subject?.message}>
                  {(control) => <Input {...control} {...register('subject')} {...field('tpl-subject')} />}
                </FormField>
              ) : (
                <FormField id="tpl-header" label="Header (optional)" error={errors.header?.message}>
                  {(control) => <Input {...control} {...register('header')} {...field('tpl-header')} />}
                </FormField>
              )}
              <VariableToolbar customFields={leadFields} disabled={locked} onInsert={insert} />
              <FormField
                id="tpl-body"
                label="Body"
                required
                error={bodyError ?? edgeError ?? undefined}
                hint={whatsapp ? `${values.body.length}/${WHATSAPP_BODY_LIMIT} characters` : undefined}
              >
                {(control) => <Textarea {...control} rows={7} {...register('body')} {...field('tpl-body')} />}
              </FormField>
              {whatsapp ? (
                <>
                  <FormField id="tpl-footer" label="Footer (optional)" error={errors.footer?.message}>
                    {(control) => <Input {...control} {...register('footer')} {...field('tpl-footer')} />}
                  </FormField>
                  <TemplateButtonsField control={control} register={register} watch={watch} setValue={setValue} errors={errors} disabled={locked} />
                </>
              ) : null}
              <TemplateSampleValues
                variables={variables}
                values={values.sampleValues}
                disabled={locked}
                onChange={(name, value) => setValue('sampleValues', { ...values.sampleValues, [name]: value }, { shouldDirty: true })}
              />
            </fieldset>
          </div>
          <aside aria-label="Live preview" className="space-y-2 md:sticky md:top-0 md:self-start">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
            <TemplatePreview
              channel={values.channel}
              header={values.header ? preview(values.header) : null}
              subject={values.subject ? preview(values.subject) : null}
              body={preview(values.body)}
              footer={values.footer ? preview(values.footer) : null}
              buttons={whatsapp ? values.buttons.filter((button) => button.label).map((button) => ({ kind: button.kind, label: button.label })) : []}
            />
            <p className="text-xs text-muted-foreground">Previewed with a sample lead, Riya Shah of Shah Traders.</p>
          </aside>
        </DrawerBody>
        {locked ? null : (
          <DrawerFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant={whatsapp ? 'outline' : 'primary'} disabled={busy || blocked} loading={busy && !submit.isPending} onClick={() => void save(false)}>
              Save {whatsapp ? 'draft' : 'template'}
            </Button>
            {whatsapp ? (
              <Button type="button" disabled={busy || blocked || Boolean(edgeError)} loading={submit.isPending} onClick={() => void save(true)}>
                Save and submit for approval
              </Button>
            ) : null}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
