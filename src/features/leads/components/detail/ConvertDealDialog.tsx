import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import type { Lead } from '@/types'
import { convertDealFormSchema, type ConvertDealFormValues } from '../../lib/detail-schemas'
import { dealDefaults } from '../../lib/deal-defaults'
import type { LeadLookups } from '../../types'
import { DealFields } from './DealFields'

export interface ConvertDealDialogProps {
  open: boolean
  lead: Lead
  lookups: LeadLookups
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: ConvertDealFormValues) => void
}

export function ConvertDealDialog({ open, lead, lookups, loading, onOpenChange, onConfirm }: ConvertDealDialogProps) {
  const pipelines = usePipelines()
  const seeded = useRef(false)
  const form = useForm<ConvertDealFormValues>({
    resolver: zodResolver(convertDealFormSchema),
    defaultValues: dealDefaults(lead, pipelines.data ?? []),
  })

  useEffect(() => {
    if (seeded.current || !pipelines.data) return
    seeded.current = true
    form.reset(dealDefaults(lead, pipelines.data))
  }, [form, lead, pipelines.data])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Convert to deal</ModalTitle>
          <ModalDescription>Create an opportunity for {lead.name}. The lead stays open.</ModalDescription>
        </ModalHeader>
        <form
          onSubmit={form.handleSubmit((values) => {
            onConfirm(values)
          })}
        >
          <ModalBody>
            <DealFields form={form} pipelines={pipelines.data ?? []} users={lookups.users} />
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create deal
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
