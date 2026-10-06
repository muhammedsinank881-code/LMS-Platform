import type { UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Checkbox, Input } from '@/components/ui'
import { normalizePhone } from '@/lib/phone'
import type { LeadFormValues } from '../../lib/lead-form-schema'

export interface LeadFormContactProps {
  form: UseFormReturn<LeadFormValues>
  whatsappSameAsPhone: boolean
  onWhatsappSameAsPhone: (same: boolean) => void
  onContactChange?: (contact: { phone: string; email: string }) => void
}

export function LeadFormContact({
  form,
  whatsappSameAsPhone,
  onWhatsappSameAsPhone,
  onContactChange,
}: LeadFormContactProps) {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = form

  const normalizeField = (name: 'phone' | 'whatsapp') => {
    const normalized = normalizePhone(getValues(name))
    if (normalized) setValue(name, normalized, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Contact</h3>
      <FormField id="lead-name" label="Name" required error={errors.name?.message}>
        {(control) => <Input {...control} {...register('name')} autoComplete="name" />}
      </FormField>
      <FormField id="lead-phone" label="Phone" error={errors.phone?.message}>
        {(control) => (
          <Input
            {...control}
            {...register('phone', {
              onChange: (event) =>
                onContactChange?.({
                  phone: event.target.value,
                  email: getValues('email') ?? '',
                }),
            })}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            onBlur={(event) => {
              void register('phone').onBlur(event)
              normalizeField('phone')
              onContactChange?.({
                phone: getValues('phone') ?? '',
                email: getValues('email') ?? '',
              })
              if (whatsappSameAsPhone) {
                const phone = getValues('phone')
                setValue('whatsapp', phone ?? '', { shouldDirty: true })
              }
            }}
          />
        )}
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={whatsappSameAsPhone}
          onCheckedChange={(checked) => {
            const same = checked === true
            onWhatsappSameAsPhone(same)
            if (same) setValue('whatsapp', getValues('phone') ?? '', { shouldDirty: true })
          }}
        />
        WhatsApp is the same as phone
      </label>
      <FormField id="lead-whatsapp" label="WhatsApp" error={errors.whatsapp?.message}>
        {(control) => (
          <Input
            {...control}
            {...register('whatsapp')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            disabled={whatsappSameAsPhone}
            onBlur={(event) => {
              void register('whatsapp').onBlur(event)
              normalizeField('whatsapp')
            }}
          />
        )}
      </FormField>
      <FormField id="lead-email" label="Email" error={errors.email?.message}>
        {(control) => (
          <Input
            {...control}
            type="email"
            inputMode="email"
            autoComplete="email"
            {...register('email', {
              onChange: (event) =>
                onContactChange?.({
                  phone: getValues('phone') ?? '',
                  email: event.target.value,
                }),
            })}
          />
        )}
      </FormField>
    </section>
  )
}
