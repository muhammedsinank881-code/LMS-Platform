import type { UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Input, MultiSelect, Select, Textarea } from '@/components/ui'
import { useCurrencySymbol } from '@/hooks/use-currency-symbol'
import { LEAD_TYPES } from '@/types'
import type { LeadFormValues } from '../../lib/lead-form-schema'
import type { LeadLookups } from '../../types'

export function LeadFormDetails({
  form,
  lookups,
}: {
  form: UseFormReturn<LeadFormValues>
  lookups: LeadLookups
}) {
  const { register, watch, setValue, formState } = form
  const errors = formState.errors
  const currency = useCurrencySymbol()
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Lead details</h3>
      <FormField id="lead-source" label="Source" required error={errors.sourceId?.message}>
        {(control) => (
          <Select
            {...control}
            options={lookups.sources.map((item) => ({ value: item.id, label: item.name }))}
            value={watch('sourceId')}
            onValueChange={(value) => setValue('sourceId', value, { shouldValidate: true, shouldDirty: true })}
          />
        )}
      </FormField>
      <FormField id="lead-campaign" label="Campaign" error={errors.campaignId?.message}>
        {(control) => (
          <Select
            {...control}
            options={[
              { value: '__none', label: 'None' },
              ...lookups.campaigns.map((item) => ({ value: item.id, label: item.name })),
            ]}
            value={watch('campaignId') || '__none'}
            onValueChange={(value) =>
              setValue('campaignId', value === '__none' ? null : value, { shouldDirty: true })
            }
          />
        )}
      </FormField>
      <FormField id="lead-product" label="Product / service" error={errors.productInterest?.message}>
        {(control) => <Input {...control} {...register('productInterest')} />}
      </FormField>
      <FormField id="lead-budget" label="Budget" error={errors.budget?.message}>
        {(control) => (
          <Input
            {...control}
            type="number"
            inputMode="decimal"
            min={0}
            leftAdornment={currency}
            value={watch('budget') ?? ''}
            onChange={(event) =>
              setValue('budget', event.target.value === '' ? null : Number(event.target.value), {
                shouldDirty: true,
              })
            }
          />
        )}
      </FormField>
      <FormField id="lead-requirement" label="Requirement" error={errors.requirement?.message}>
        {(control) => <Textarea {...control} {...register('requirement')} />}
      </FormField>
      <FormField id="lead-type" label="Lead type">
        {(control) => (
          <Select
            {...control}
            options={LEAD_TYPES.map((value) => ({
              value,
              label: value === 'b2b' ? 'B2B' : 'B2C',
            }))}
            value={watch('leadType')}
            onValueChange={(value) =>
              setValue('leadType', value as LeadFormValues['leadType'], { shouldDirty: true })
            }
          />
        )}
      </FormField>
      <FormField id="lead-tags" label="Tags">
        {(control) => (
          <MultiSelect
            {...control}
            options={lookups.tags.map((tag) => ({ value: tag.name, label: tag.name }))}
            value={watch('tags') ?? []}
            onValueChange={(value) => setValue('tags', value, { shouldDirty: true })}
          />
        )}
      </FormField>
      <FormField id="lead-status" label="Status">
        {(control) => (
          <Select
            {...control}
            options={lookups.statuses.map((item) => ({ value: item.id, label: item.name }))}
            value={watch('statusId')}
            onValueChange={(value) => setValue('statusId', value, { shouldDirty: true })}
          />
        )}
      </FormField>
      <FormField id="lead-owner" label="Assigned to">
        {(control) => (
          <Select
            {...control}
            options={[
              { value: '__none', label: 'Auto-assign' },
              ...lookups.users
                .filter((user) => user.status === 'active')
                .map((user) => ({ value: user.id, label: user.name })),
            ]}
            value={watch('assignedTo') || '__none'}
            onValueChange={(value) =>
              setValue('assignedTo', value === '__none' ? null : value, { shouldDirty: true })
            }
          />
        )}
      </FormField>
    </section>
  )
}
