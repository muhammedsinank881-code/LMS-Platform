import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  toast,
} from '@/components/ui'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ApiError } from '@/services/api/errors'
import type { CreateLeadInput, CustomFieldDefinition, Lead, LeadId } from '@/types'
import { useDuplicateCheck } from '../../hooks/use-leads'
import { useCreateLead, useUpdateLead } from '../../hooks/use-lead-mutations'
import type { LeadLookups } from '../../types'
import { LeadForm } from './LeadForm'

export interface LeadDrawerProps {
  open: boolean
  mode: 'create' | 'edit'
  lead?: Lead | null
  lookups: LeadLookups
  customFields: CustomFieldDefinition[]
  onOpenChange: (open: boolean) => void
}

export function LeadDrawer({
  open,
  mode,
  lead,
  lookups,
  customFields,
  onOpenChange,
}: LeadDrawerProps) {
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const [dirty, setDirty] = useState(false)
  const [guardOpen, setGuardOpen] = useState(false)
  const [probe, setProbe] = useState({
    phone: lead?.phone ?? '',
    email: lead?.email ?? '',
  })
  const debounced = useDebouncedValue(probe, 400)
  const duplicates = useDuplicateCheck(
    { phone: debounced.phone || null, email: debounced.email || null },
    { excludeId: lead?.id, enabled: open },
  )

  const submitting = createLead.isPending || updateLead.isPending
  const serverError = createLead.error ?? updateLead.error
  const fieldErrors =
    serverError instanceof ApiError ? serverError.fieldErrors : undefined

  const requestClose = () => {
    if (dirty) setGuardOpen(true)
    else onOpenChange(false)
  }

  const submit = async (values: CreateLeadInput) => {
    setProbe({ phone: values.phone ?? '', email: values.email ?? '' })
    if (mode === 'edit' && lead) {
      await updateLead.mutateAsync({ id: lead.id as LeadId, patch: values })
      toast.success('Lead updated')
    } else {
      await createLead.mutateAsync(values)
      toast.success('Lead created')
    }
    setDirty(false)
    onOpenChange(false)
  }

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose()
          else onOpenChange(true)
        }}
      >
        <DrawerContent side="right" size="lg">
          <DrawerHeader>
            <DrawerTitle>{mode === 'edit' ? 'Edit lead' : 'Add lead'}</DrawerTitle>
            <DrawerDescription>
              {mode === 'edit'
                ? 'Update contact and lead details.'
                : 'Capture a new lead. At least one contact method is required.'}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <LeadForm
              key={lead?.id ?? 'create'}
              mode={mode}
              lead={lead}
              lookups={lookups}
              customFields={customFields}
              duplicateMatches={duplicates.data ?? []}
              submitting={submitting}
              serverError={serverError}
              serverFieldErrors={fieldErrors}
              onSubmit={submit}
              onCancel={requestClose}
              onDirtyChange={setDirty}
              onContactChange={setProbe}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <ConfirmDialog
        open={guardOpen}
        onOpenChange={setGuardOpen}
        title="Discard unsaved changes?"
        description="Your edits will be lost if you close this drawer."
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setGuardOpen(false)
          setDirty(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
