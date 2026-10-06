import type { UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Input } from '@/components/ui'
import type { LeadFormValues } from '../../lib/lead-form-schema'

export function LeadFormCompany({ form }: { form: UseFormReturn<LeadFormValues> }) {
  const {
    register,
    formState: { errors },
  } = form
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Company</h3>
      <FormField id="lead-company" label="Company" error={errors.company?.message}>
        {(control) => <Input {...control} {...register('company')} />}
      </FormField>
      <FormField id="lead-location" label="Location" error={errors.location?.message}>
        {(control) => <Input {...control} {...register('location')} />}
      </FormField>
    </section>
  )
}
