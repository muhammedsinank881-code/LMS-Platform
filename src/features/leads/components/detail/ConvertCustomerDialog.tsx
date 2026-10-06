import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Stepper,
  Switch,
} from '@/components/ui'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import type { ConvertToCustomerInput } from '@/services/api/leads'
import type { Lead } from '@/types'
import { convertCustomerSchema, type ConvertCustomerValues, type ConvertDealFormValues } from '../../lib/detail-schemas'
import { dealDefaults } from '../../lib/deal-defaults'
import type { LeadLookups } from '../../types'
import { DealFields } from './DealFields'

const STEPS = [
  { id: 'customer', label: 'Customer' },
  { id: 'deal', label: 'Deal' },
  { id: 'summary', label: 'Summary' },
]

export interface ConvertCustomerDialogProps {
  open: boolean
  lead: Lead
  statusId: string
  lookups: LeadLookups
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (input: ConvertToCustomerInput) => void
}

export function ConvertCustomerDialog({
  open,
  lead,
  statusId,
  lookups,
  loading,
  onOpenChange,
  onConfirm,
}: ConvertCustomerDialogProps) {
  const pipelines = usePipelines()
  const [step, setStep] = useState(0)
  const seeded = useRef(false)
  const form = useForm<ConvertCustomerValues>({
    resolver: zodResolver(convertCustomerSchema),
    defaultValues: {
      name: lead.name,
      phone: lead.phone ?? '',
      email: lead.email ?? '',
      companyName: lead.company ?? '',
      location: lead.location ?? '',
      createDeal: false,
      ...dealDefaults(lead, pipelines.data ?? []),
    },
  })
  useEffect(() => {
    if (seeded.current || !pipelines.data) return
    seeded.current = true
    const defaults = dealDefaults(lead, pipelines.data)
    form.setValue('title', defaults.title)
    form.setValue('value', defaults.value)
    form.setValue('expectedCloseDate', defaults.expectedCloseDate)
    form.setValue('probability', defaults.probability)
    form.setValue('product', defaults.product)
    form.setValue('ownerId', defaults.ownerId)
    form.setValue('pipelineId', defaults.pipelineId)
    form.setValue('stageId', defaults.stageId)
  }, [form, lead, pipelines.data])

  const values = form.watch()

  const next = async () => {
    if (step === 0) {
      const valid = await form.trigger(['name', 'phone', 'email', 'companyName', 'location'])
      if (valid) setStep(1)
      return
    }
    if (step === 1) {
      if (!values.createDeal) {
        setStep(2)
        return
      }
      const valid = await form.trigger()
      if (valid) setStep(2)
    }
  }

  const submit = form.handleSubmit((current) => {
    onConfirm({
      name: current.name,
      phone: current.phone || null,
      email: current.email || null,
      companyName: current.companyName || null,
      location: current.location || null,
      statusId,
      deal: current.createDeal
        ? {
            title: current.title,
            value: current.value,
            expectedCloseDate: current.expectedCloseDate,
            probability: current.probability,
            product: current.product,
            ownerId: current.ownerId,
            pipelineId: current.pipelineId,
            stageId: current.stageId,
          }
        : null,
    })
  })

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setStep(0)
        onOpenChange(nextOpen)
      }}
    >
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Convert to customer</ModalTitle>
          <ModalDescription>The lead and its history stay on this page.</ModalDescription>
          <Stepper steps={STEPS} currentStep={step} className="pt-3" />
        </ModalHeader>
        <form onSubmit={submit}>
          <ModalBody className="space-y-4">
            {step === 0 ? <CustomerFields form={form} /> : null}
            {step === 1 ? (
              <div className="space-y-4">
                <label className="flex items-center justify-between gap-3 text-sm">
                  Create a deal now
                  <Switch checked={values.createDeal} onCheckedChange={(checked) => form.setValue('createDeal', checked)} aria-label="Create a deal now" />
                </label>
                {values.createDeal ? (
                  <DealFields
                    form={form as unknown as UseFormReturn<ConvertDealFormValues>}
                    pipelines={pipelines.data ?? []}
                    users={lookups.users}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">You can add a deal later. Only the customer and company will be created.</p>
                )}
              </div>
            ) : null}
            {step === 2 ? <Summary values={values} /> : null}
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}>
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < 2 ? (
              <Button type="button" onClick={() => void next()}>
                Continue
              </Button>
            ) : (
              <Button type="submit" loading={loading}>
                Convert
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

function CustomerFields({ form }: { form: UseFormReturn<ConvertCustomerValues> }) {
  const errors = form.formState.errors
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField id="customer-name" label="Name" required error={errors.name?.message} className="sm:col-span-2">
        {(control) => <Input {...control} {...form.register('name')} />}
      </FormField>
      <FormField id="customer-phone" label="Phone" error={errors.phone?.message}>
        {(control) => <Input {...control} {...form.register('phone')} />}
      </FormField>
      <FormField id="customer-email" label="Email" error={errors.email?.message}>
        {(control) => <Input {...control} {...form.register('email')} />}
      </FormField>
      <FormField id="customer-company" label="Company" error={errors.companyName?.message}>
        {(control) => <Input {...control} {...form.register('companyName')} />}
      </FormField>
      <FormField id="customer-location" label="Location" error={errors.location?.message}>
        {(control) => <Input {...control} {...form.register('location')} />}
      </FormField>
    </div>
  )
}

function Summary({ values }: { values: ConvertCustomerValues }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Customer</dt>
        <dd className="text-right font-medium">{values.name}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Company</dt>
        <dd>{values.companyName || 'None'}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Deal</dt>
        <dd>{values.createDeal ? values.title : 'Not now'}</dd>
      </div>
    </dl>
  )
}
