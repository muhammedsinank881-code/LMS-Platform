import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/common/FormField'
import { Button, Input, Select } from '@/components/ui'
import { LeadPicker } from '@/features/followups/components/LeadPicker'
import { useCreateLead } from '@/features/leads/hooks/use-lead-mutations'
import { useCreateDeal } from '@/features/deals/hooks/use-deals'
import type { DirectoryUser } from '@/services/api/team'
import { isLeadId, type LeadSource, type PipelineStage } from '@/types'
import type { BoardKind } from '../lib/board-model'

const quickSchema = z.object({
  name: z.string().trim().min(2, 'Add a name'),
  phone: z.string().trim().min(8, 'Add a phone number'),
  value: z.number().min(0),
  ownerId: z.string().min(1, 'Choose an owner'),
  leadId: z.string().optional(),
})

type QuickValues = z.infer<typeof quickSchema>

export function QuickAddForm({
  board,
  stage,
  pipelineId,
  sources,
  users,
  onDone,
}: {
  board: BoardKind
  stage: PipelineStage
  pipelineId: string
  sources: LeadSource[]
  users: DirectoryUser[]
  onDone: () => void
}) {
  const createLead = useCreateLead()
  const createDeal = useCreateDeal()
  const [leadLabel, setLeadLabel] = useState('')
  const form = useForm<QuickValues>({
    resolver: zodResolver(quickSchema),
    defaultValues: { name: '', phone: '', value: 0, ownerId: users[0]?.id ?? '', leadId: '' },
  })
  const pending = createLead.isPending || createDeal.isPending
  const manual = sources.find((source) => source.key === 'manual') ?? sources[0]

  const submit = form.handleSubmit(async (values) => {
    if (board === 'leads') {
      if (!manual) return
      await createLead.mutateAsync({
        name: values.name,
        phone: values.phone,
        budget: values.value,
        assignedTo: values.ownerId,
        sourceId: manual.id,
        pipelineId,
        stageId: stage.id,
      })
    } else if (values.leadId && isLeadId(values.leadId)) {
      const close = new Date()
      close.setDate(close.getDate() + 30)
      await createDeal.mutateAsync({
        title: leadLabel || 'New deal',
        leadId: values.leadId,
        value: values.value,
        expectedCloseDate: close.toISOString(),
        product: 'Services',
        ownerId: values.ownerId,
        pipelineId,
        stageId: stage.id,
        probability: stage.probability,
      })
    }
    onDone()
  })

  return (
    <form className="space-y-2 rounded-md border border-border bg-surface p-2" onSubmit={(event) => void submit(event)}>
      {board === 'deals' ? (
        <FormField id={`qa-lead-${stage.id}`} label="Lead" required>
          {(control) => (
            <LeadPicker
              id={control.id}
              value={form.watch('leadId') ?? ''}
              onChange={(leadId, label) => {
                form.setValue('leadId', leadId, { shouldValidate: true })
                setLeadLabel(label)
              }}
            />
          )}
        </FormField>
      ) : (
        <>
          <FormField id={`qa-name-${stage.id}`} label="Name" required error={form.formState.errors.name?.message}>
            {(control) => <Input {...control} {...form.register('name')} />}
          </FormField>
          <FormField id={`qa-phone-${stage.id}`} label="Phone" required error={form.formState.errors.phone?.message}>
            {(control) => <Input {...control} {...form.register('phone')} />}
          </FormField>
        </>
      )}
      <FormField id={`qa-value-${stage.id}`} label="Value" required>
        {(control) => <Input {...control} type="number" min={0} {...form.register('value', { valueAsNumber: true })} />}
      </FormField>
      <FormField id={`qa-owner-${stage.id}`} label="Owner" required>
        {(control) => (
          <Select
            {...control}
            value={form.watch('ownerId')}
            onValueChange={(value) => form.setValue('ownerId', value)}
            options={users.filter((user) => user.status === 'active').map((user) => ({ value: user.id, label: user.name }))}
          />
        )}
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button type="submit" size="sm" loading={pending}>Add</Button>
      </div>
    </form>
  )
}
