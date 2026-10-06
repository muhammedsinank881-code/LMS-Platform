import type { FieldErrors, UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { DatePicker, Input, Select } from '@/components/ui'
import type { PipelineWithStages } from '@/types'
import type { ConvertDealFormValues } from '../../lib/detail-schemas'
import { openStages } from '../../lib/deal-defaults'

interface UserOption {
  id: string
  name: string
  status: string
}

/** Deal fields shared by convert-to-deal and the optional step of convert-to-customer. */
export function DealFields({
  form,
  pipelines,
  users,
}: {
  form: UseFormReturn<ConvertDealFormValues>
  pipelines: PipelineWithStages[]
  users: UserOption[]
}) {
  const pipelineId = form.watch('pipelineId')
  const stages = openStages(pipelines, pipelineId)
  const errors = form.formState.errors as FieldErrors<ConvertDealFormValues>
  const activeUsers = users.filter((user) => user.status === 'active')

  const setPipeline = (value: string) => {
    const next = openStages(pipelines, value)[0]
    form.setValue('pipelineId', value, { shouldValidate: true })
    form.setValue('stageId', next?.id ?? '', { shouldValidate: true })
    if (next) form.setValue('probability', next.probability)
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField id="deal-title" label="Title" required error={errors.title?.message} className="sm:col-span-2">
        {(control) => <Input {...control} {...form.register('title')} />}
      </FormField>
      <FormField id="deal-value" label="Value" required error={errors.value?.message}>
        {(control) => <Input {...control} type="number" min={0} {...form.register('value', { valueAsNumber: true })} />}
      </FormField>
      <FormField id="deal-product" label="Product" required error={errors.product?.message}>
        {(control) => <Input {...control} {...form.register('product')} />}
      </FormField>
      <FormField id="deal-close" label="Expected close" required error={errors.expectedCloseDate?.message}>
        {(control) => (
          <DatePicker
            {...control}
            value={form.watch('expectedCloseDate')}
            onValueChange={(value) => form.setValue('expectedCloseDate', value, { shouldValidate: true })}
          />
        )}
      </FormField>
      <FormField id="deal-probability" label="Probability %" error={errors.probability?.message}>
        {(control) => (
          <Input {...control} type="number" min={0} max={100} {...form.register('probability', { valueAsNumber: true })} />
        )}
      </FormField>
      <FormField id="deal-owner" label="Owner" required error={errors.ownerId?.message}>
        {(control) => (
          <Select
            {...control}
            options={activeUsers.map((user) => ({ value: user.id, label: user.name }))}
            value={form.watch('ownerId')}
            onValueChange={(value) => form.setValue('ownerId', value, { shouldValidate: true })}
            placeholder="Select an owner"
          />
        )}
      </FormField>
      <FormField id="deal-pipeline" label="Pipeline" required error={errors.pipelineId?.message}>
        {(control) => (
          <Select
            {...control}
            options={pipelines.map((item) => ({ value: item.id, label: item.name }))}
            value={pipelineId}
            onValueChange={setPipeline}
            placeholder="Select a pipeline"
          />
        )}
      </FormField>
      <FormField id="deal-stage" label="Stage" required error={errors.stageId?.message} className="sm:col-span-2">
        {(control) => (
          <Select
            {...control}
            options={stages.map((stage) => ({ value: stage.id, label: stage.name }))}
            value={form.watch('stageId')}
            onValueChange={(value) => {
              form.setValue('stageId', value, { shouldValidate: true })
              const stage = stages.find((item) => item.id === value)
              if (stage) form.setValue('probability', stage.probability)
            }}
            placeholder="Select a stage"
          />
        )}
      </FormField>
    </div>
  )
}
