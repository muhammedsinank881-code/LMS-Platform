import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  Textarea,
  toast,
} from '@/components/ui'
import type { SpendEntry } from '@/types'
import { useAdHierarchy } from '../../hooks/use-ad-sets'
import { useCreateSpend, useUpdateSpend } from '../../hooks/use-spend'
import { spendFormSchema, type SpendFormInput, type SpendFormValues } from '../../schemas'

const NONE = 'none'

function Form({ campaignId, entry, onDone }: { campaignId: string; entry: SpendEntry | null; onDone: () => void }) {
  const hierarchy = useAdHierarchy(campaignId)
  const create = useCreateSpend()
  const update = useUpdateSpend()
  const form = useForm<SpendFormInput, unknown, SpendFormValues>({
    resolver: zodResolver(spendFormSchema),
    defaultValues: {
      date: entry?.date ?? new Date().toISOString().slice(0, 10),
      amount: entry?.amount ?? 0,
      adSetId: entry?.adSetId ?? '',
      adId: entry?.adId ?? '',
      notes: entry?.notes ?? '',
    },
  })
  const { errors } = form.formState
  const adSetId = form.watch('adSetId') ?? ''
  const ads = (hierarchy.data?.ads ?? []).filter((ad) => !adSetId || ad.adSetId === adSetId)

  const submit = form.handleSubmit(async (values) => {
    const body = {
      campaignId,
      date: values.date,
      amount: values.amount,
      currency: entry?.currency ?? 'INR',
      adSetId: values.adSetId || null,
      adId: values.adId || null,
      notes: values.notes ?? '',
    }
    if (entry) await update.mutateAsync({ id: entry.id, patch: body })
    else await create.mutateAsync(body)
    toast.success(entry ? 'Spend entry saved' : 'Spend entry added')
    onDone()
  })

  return (
    <form onSubmit={submit} noValidate>
      <ModalBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="spend-date" label="Date" required error={errors.date?.message}>
            {(c) => <DatePicker id={c.id} invalid={c.invalid} value={form.watch('date')} onValueChange={(v) => form.setValue('date', v, { shouldValidate: true })} />}
          </FormField>
          <FormField id="spend-amount" label="Amount (INR)" required error={errors.amount?.message}>
            {(c) => <Input id={c.id} type="number" min={0} step="0.01" invalid={c.invalid} aria-describedby={c['aria-describedby']} {...form.register('amount')} />}
          </FormField>
          <FormField id="spend-adset" label="Ad set">
            {(c) => (
              <Select id={c.id} value={adSetId || NONE} onValueChange={(v) => { form.setValue('adSetId', v === NONE ? '' : v); form.setValue('adId', '') }}
                options={[{ value: NONE, label: 'Whole campaign' }, ...(hierarchy.data?.adSets ?? []).map((s) => ({ value: s.id, label: s.name }))]} />
            )}
          </FormField>
          <FormField id="spend-ad" label="Ad">
            {(c) => (
              <Select id={c.id} value={form.watch('adId') || NONE} onValueChange={(v) => form.setValue('adId', v === NONE ? '' : v)}
                options={[{ value: NONE, label: 'Whole ad set' }, ...ads.map((a) => ({ value: a.id, label: a.name }))]} />
            )}
          </FormField>
        </div>
        <FormField id="spend-notes" label="Notes">
          {(c) => <Textarea id={c.id} rows={2} {...form.register('notes')} />}
        </FormField>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={create.isPending || update.isPending}>{entry ? 'Save' : 'Add entry'}</Button>
      </ModalFooter>
    </form>
  )
}

export function SpendEntryDialog({
  open,
  campaignId,
  entry,
  onOpenChange,
}: {
  open: boolean
  campaignId: string
  entry: SpendEntry | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>{entry ? 'Edit spend entry' : 'Add spend entry'}</ModalTitle>
          <ModalDescription>Spend for one day, for the whole campaign or a single ad.</ModalDescription>
        </ModalHeader>
        {open ? <Form key={entry?.id ?? 'new'} campaignId={campaignId} entry={entry} onDone={() => onOpenChange(false)} /> : null}
      </ModalContent>
    </Modal>
  )
}
