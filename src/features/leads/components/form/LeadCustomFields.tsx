import type { UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { useCurrencySymbol } from '@/hooks/use-currency-symbol'
import { DatePicker, Input, MultiSelect, Select, Switch } from '@/components/ui'
import type { CustomFieldDefinition, CustomFieldValue } from '@/types'
import type { LeadFormValues } from '../../lib/lead-form-schema'

export function LeadCustomFields({
  form,
  fields,
}: {
  form: UseFormReturn<LeadFormValues>
  fields: CustomFieldDefinition[]
}) {
  const { watch, setValue, formState } = form
  const currency = useCurrencySymbol()
  const values = watch('customFields') ?? {}

  const setField = (key: string, value: CustomFieldValue) => {
    setValue('customFields', { ...values, [key]: value }, { shouldDirty: true, shouldValidate: true })
  }

  if (fields.length === 0) return null

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Custom fields</h3>
      {fields.map((field) => {
        const error = formState.errors.customFields?.[field.key]?.message as string | undefined
        const current = values[field.key]
        return (
          <FormField
            key={field.id}
            id={`cf-${field.key}`}
            label={field.label}
            required={field.required}
            error={error}
          >
            {(control) => {
              if (field.type === 'boolean') {
                return (
                  <Switch
                    id={control.id}
                    checked={current === true}
                    onCheckedChange={(checked) => setField(field.key, checked)}
                  />
                )
              }
              if (field.type === 'dropdown') {
                return (
                  <Select
                    {...control}
                    options={field.options.map((option) => ({ value: option, label: option }))}
                    value={typeof current === 'string' ? current : undefined}
                    onValueChange={(value) => setField(field.key, value)}
                  />
                )
              }
              if (field.type === 'multiselect') {
                return (
                  <MultiSelect
                    {...control}
                    options={field.options.map((option) => ({ value: option, label: option }))}
                    value={Array.isArray(current) ? current : []}
                    onValueChange={(value) => setField(field.key, value)}
                  />
                )
              }
              if (field.type === 'date') {
                return (
                  <DatePicker
                    {...control}
                    value={typeof current === 'string' ? current : ''}
                    onValueChange={(value) => setField(field.key, value)}
                  />
                )
              }
              if (field.type === 'file') {
                return (
                  <Input {...control} disabled placeholder="File upload coming later" />
                )
              }
              if (field.type === 'number' || field.type === 'currency') {
                return (
                  <Input
                    {...control}
                    type="number"
                    inputMode={field.type === 'currency' ? 'decimal' : 'numeric'}
                    leftAdornment={field.type === 'currency' ? currency : undefined}
                    value={typeof current === 'number' ? current : ''}
                    onChange={(event) =>
                      setField(
                        field.key,
                        event.target.value === '' ? null : Number(event.target.value),
                      )
                    }
                  />
                )
              }
              return (
                <Input
                  {...control}
                  type={field.type === 'url' ? 'url' : 'text'}
                  value={typeof current === 'string' ? current : ''}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
              )
            }}
          </FormField>
        )
      })}
    </section>
  )
}
