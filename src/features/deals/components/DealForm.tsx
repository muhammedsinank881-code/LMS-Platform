import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { CurrencyText } from '@/components/common/CurrencyText'
import { DynamicFields } from '@/components/common/DynamicFields'
import { DatePicker, Input, Select } from '@/components/ui'
import { activeFields } from '@/lib/settings/custom-field'
import type { CustomFieldDefinition } from '@/types'
import { LeadPicker } from '@/features/followups/components/LeadPicker'
import { computeExpectedRevenue } from '@/lib/pipeline'
import type { DirectoryUser } from '@/services/api/team'
import { createDealSchema, type CreateDealInput, type PipelineWithStages } from '@/types'
import { openStages } from '@/features/leads/lib/deal-defaults'

export function DealForm({
  formId,
  users,
  pipelines,
  currency,
  customFields = [],
  defaultValues,
  onSubmit,
}: {
  formId: string
  users: DirectoryUser[]
  pipelines: PipelineWithStages[]
  currency: string
  customFields?: CustomFieldDefinition[]
  defaultValues?: Partial<CreateDealInput>
  onSubmit: (values: CreateDealInput) => void
}) {
  const form = useForm<CreateDealInput>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      title: '',
      leadId: '' as CreateDealInput['leadId'],
      value: 0,
      expectedCloseDate: '',
      product: '',
      pipelineId: pipelines.find((pipeline) => pipeline.isDefault)?.id ?? pipelines[0]?.id ?? '',
      stageId: '',
      probability: 10,
      ownerId: '',
      customFields: {},
      ...defaultValues,
    },
  })
  const pipelineId = form.watch('pipelineId')
  const stageId = form.watch('stageId')
  const stages = openStages(pipelines, pipelineId)
  const probability = form.watch('probability') ?? stages.find((stage) => stage.id === stageId)?.probability ?? 0
  const revenue = computeExpectedRevenue(Number(form.watch('value')) || 0, probability)

  useEffect(() => {
    const stage = stages.find((item) => item.id === stageId) ?? stages[0]
    if (!stageId && stage) form.setValue('stageId', stage.id)
  }, [form, stageId, stages])

  return (
    <form id={formId} className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
      <FormField id="deal-lead" label="Lead" required error={form.formState.errors.leadId?.message} className="sm:col-span-2">
        {(control) => (
          <LeadPicker
            id={control.id}
            value={form.watch('leadId')}
            onChange={(leadId) => form.setValue('leadId', leadId as CreateDealInput['leadId'], { shouldValidate: true })}
          />
        )}
      </FormField>
      <Field form={form} name="title" label="Title" className="sm:col-span-2" />
      <Field form={form} name="value" label={`Value (${currency})`} numeric />
      <Field form={form} name="product" label="Product" />
      <FormField id="deal-close" label="Expected close" required error={form.formState.errors.expectedCloseDate?.message}>
        {(control) => <DatePicker {...control} value={form.watch('expectedCloseDate')} onValueChange={(value) => form.setValue('expectedCloseDate', value, { shouldValidate: true })} />}
      </FormField>
      <FormField id="deal-probability" label="Probability" error={form.formState.errors.probability?.message}>
        {(control) => <Input {...control} type="number" inputMode="numeric" min={0} max={100} {...form.register('probability', { valueAsNumber: true })} />}
      </FormField>
      <p className="text-sm text-muted-foreground sm:col-span-2">Expected revenue <CurrencyText amount={revenue} /></p>
      <FormField id="deal-pipeline" label="Pipeline" required className="sm:col-span-2">
        {(control) => (
          <Select
            {...control}
            value={pipelineId}
            onValueChange={(value) => {
              form.setValue('pipelineId', value, { shouldValidate: true })
              const next = openStages(pipelines, value)[0]
              form.setValue('stageId', next?.id ?? '')
              if (next) form.setValue('probability', next.probability)
            }}
            options={pipelines.map((pipeline) => ({ value: pipeline.id, label: pipeline.name }))}
          />
        )}
      </FormField>
      <FormField id="deal-stage" label="Stage" required>
        {(control) => (
          <Select
            {...control}
            value={stageId}
            onValueChange={(value) => {
              form.setValue('stageId', value, { shouldValidate: true })
              const next = stages.find((stage) => stage.id === value)
              if (next) form.setValue('probability', next.probability)
            }}
            options={stages.map((stage) => ({ value: stage.id, label: stage.name }))}
          />
        )}
      </FormField>
      <FormField id="deal-owner" label="Owner">
        {(control) => (
          <Select
            {...control}
            value={form.watch('ownerId') ?? ''}
            onValueChange={(value) => form.setValue('ownerId', value)}
            options={users.filter((user) => user.status === 'active').map((user) => ({ value: user.id, label: user.name }))}
          />
        )}
      </FormField>
      <div className="sm:col-span-2">
        <DynamicFields
          fields={activeFields(customFields, 'deal')}
          values={form.watch('customFields') ?? {}}
          onChange={(key, value) => form.setValue('customFields', { ...form.getValues('customFields'), [key]: value })}
        />
      </div>
    </form>
  )
}

function Field({
  form,
  name,
  label,
  numeric,
  className,
}: {
  form: UseFormReturn<CreateDealInput>
  name: 'title' | 'value' | 'product'
  label: string
  numeric?: boolean
  className?: string
}) {
  return (
    <FormField id={`deal-${name}`} label={label} required error={form.formState.errors[name]?.message} className={className}>
      {(control) => (
        <Input
          {...control}
          type={numeric ? 'number' : 'text'}
          inputMode={numeric ? 'decimal' : undefined}
          min={numeric ? 0 : undefined}
          {...form.register(name, numeric ? { valueAsNumber: true } : undefined)}
        />
      )}
    </FormField>
  )
}
