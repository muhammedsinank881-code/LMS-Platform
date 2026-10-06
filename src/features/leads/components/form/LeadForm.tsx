import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type DefaultValues, type Resolver } from 'react-hook-form'
import { FormAlert } from '@/components/common/FormField'
import { Button } from '@/components/ui'
import { getErrorMessage, type ApiFieldErrors } from '@/services/api/errors'
import type { CreateLeadInput, CustomFieldDefinition, Lead } from '@/types'
import { leadFormSchema, type LeadFormValues } from '../../lib/lead-form-schema'
import type { LeadLookups } from '../../types'
import { DuplicateWarningBanner } from './DuplicateWarningBanner'
import { LeadCustomFields } from './LeadCustomFields'
import { LeadFormCompany } from './LeadFormCompany'
import { LeadFormContact } from './LeadFormContact'
import { LeadFormDetails } from './LeadFormDetails'
import type { DuplicateMatch } from '@/types'

export interface LeadFormProps {
  mode: 'create' | 'edit'
  lead?: Lead | null
  lookups: LeadLookups
  customFields: CustomFieldDefinition[]
  duplicateMatches?: DuplicateMatch[]
  submitting?: boolean
  serverError?: unknown
  serverFieldErrors?: ApiFieldErrors
  onSubmit: (values: CreateLeadInput) => Promise<void> | void
  onCancel: () => void
  onDirtyChange?: (dirty: boolean) => void
  onContactChange?: (contact: { phone: string; email: string }) => void
}

function defaultsFromLead(lead?: Lead | null): DefaultValues<LeadFormValues> {
  return {
    name: lead?.name ?? '',
    phone: lead?.phone ?? '',
    whatsapp: lead?.whatsapp ?? '',
    email: lead?.email ?? '',
    company: lead?.company ?? '',
    location: lead?.location ?? '',
    sourceId: lead?.sourceId ?? '',
    campaignId: lead?.campaignId ?? null,
    productInterest: lead?.productInterest ?? '',
    budget: lead?.budget ?? null,
    requirement: lead?.requirement ?? '',
    leadType: lead?.leadType ?? 'b2c',
    tags: lead?.tags ?? [],
    statusId: lead?.statusId ?? '',
    assignedTo: lead?.assignedTo ?? null,
    customFields: lead?.customFields ?? {},
  }
}

export function LeadForm({
  mode,
  lead,
  lookups,
  customFields,
  duplicateMatches = [],
  submitting,
  serverError,
  serverFieldErrors,
  onSubmit,
  onCancel,
  onDirtyChange,
  onContactChange,
}: LeadFormProps) {
  const schema = useMemo(() => leadFormSchema(customFields, mode), [customFields, mode])
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(schema) as Resolver<LeadFormValues>,
    defaultValues: defaultsFromLead(lead),
  })
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(
    Boolean(lead?.phone && lead.phone === lead.whatsapp),
  )

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty)
  }, [form.formState.isDirty, onDirtyChange])

  useEffect(() => {
    if (!serverFieldErrors) return
    for (const [field, messages] of Object.entries(serverFieldErrors)) {
      const message = messages[0]
      if (message) form.setError(field as keyof LeadFormValues, { message })
    }
  }, [form, serverFieldErrors])

  return (
    <form
      className="flex h-full flex-col"
      noValidate
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div className="flex-1 space-y-6 overflow-y-auto">
        {mode === 'edit' && lead ? (
          <p className="text-sm text-muted-foreground">
            Lead ID <span className="font-mono text-foreground">{lead.id}</span>
          </p>
        ) : null}
        {serverError ? (
          <FormAlert title={mode === 'edit' ? 'Could not save lead' : 'Could not create lead'}>
            {getErrorMessage(serverError)}
          </FormAlert>
        ) : null}
        <DuplicateWarningBanner matches={duplicateMatches} />
        <LeadFormContact
          form={form}
          whatsappSameAsPhone={whatsappSameAsPhone}
          onWhatsappSameAsPhone={setWhatsappSameAsPhone}
          onContactChange={onContactChange}
        />
        <LeadFormCompany form={form} />
        <LeadFormDetails form={form} lookups={lookups} />
        <LeadCustomFields form={form} fields={customFields} />
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === 'edit' ? 'Save changes' : 'Create lead'}
        </Button>
      </div>
    </form>
  )
}
