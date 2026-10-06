import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, type Control, type UseFormRegister, type UseFormSetValue, type UseFormWatch, type FieldErrors } from 'react-hook-form'
import { Button, Input, Select } from '@/components/ui'
import type { TemplateButtonKind } from '@/types'
import { MAX_BUTTONS, type TemplateFormValues } from '../../lib/template-form'

const KIND_LABEL: Record<TemplateButtonKind, string> = {
  quick_reply: 'Quick reply',
  url: 'Open website',
  call: 'Call phone',
}

const VALUE_HINT: Partial<Record<TemplateButtonKind, string>> = {
  url: 'https://example.com/pricing',
  call: '+91 98765 43210',
}

/** Up to three call-to-action buttons, the limit WhatsApp enforces. */
export function TemplateButtonsField({
  control,
  register,
  watch,
  setValue,
  errors,
  disabled,
}: {
  control: Control<TemplateFormValues>
  register: UseFormRegister<TemplateFormValues>
  watch: UseFormWatch<TemplateFormValues>
  setValue: UseFormSetValue<TemplateFormValues>
  errors: FieldErrors<TemplateFormValues>
  disabled?: boolean
}) {
  const { fields, append, remove } = useFieldArray({ control, name: 'buttons' })
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="flex w-full items-center justify-between text-sm font-medium">
        <span>
          Buttons <span className="font-normal text-muted-foreground">({fields.length}/{MAX_BUTTONS})</span>
        </span>
        <Button type="button" size="sm" variant="outline" disabled={disabled || fields.length >= MAX_BUTTONS} onClick={() => append({ kind: 'quick_reply', label: '', value: '' })}>
          <Plus /> Add button
        </Button>
      </legend>
      {fields.length === 0 ? <p className="text-xs text-muted-foreground">Optional. Add up to {MAX_BUTTONS} buttons customers can tap.</p> : null}
      {fields.map((field, index) => {
        const kind = watch(`buttons.${index}.kind`)
        return (
          <div key={field.id} className="grid gap-2 rounded-md border border-border p-2 sm:grid-cols-[9rem_1fr_auto]">
            <Select
              aria-label={`Button ${index + 1} type`}
              value={kind}
              onValueChange={(value) => setValue(`buttons.${index}.kind`, value as TemplateButtonKind, { shouldDirty: true })}
              options={(Object.keys(KIND_LABEL) as TemplateButtonKind[]).map((item) => ({ value: item, label: KIND_LABEL[item] }))}
            />
            <div className="space-y-1.5">
              <Input aria-label={`Button ${index + 1} label`} placeholder="Button text" {...register(`buttons.${index}.label`)} />
              {kind !== 'quick_reply' ? <Input aria-label={`Button ${index + 1} ${kind === 'url' ? 'address' : 'phone number'}`} placeholder={VALUE_HINT[kind]} {...register(`buttons.${index}.value`)} /> : null}
              {errors.buttons?.[index]?.label ? <p className="text-xs text-destructive">{errors.buttons[index]?.label?.message}</p> : null}
            </div>
            <Button type="button" size="icon-sm" variant="ghost" aria-label={`Remove button ${index + 1}`} onClick={() => remove(index)}>
              <Trash2 />
            </Button>
          </div>
        )
      })}
    </fieldset>
  )
}
