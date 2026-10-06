import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import {
  Button,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Select,
  toast,
} from '@/components/ui'
import { useDirectory } from '@/features/team/hooks/use-team'
import { CAMPAIGN_STATUS_LABELS, OBJECTIVE_LABELS, PLATFORM_LABELS } from '@/lib/campaign-labels'
import { ApiError } from '@/services/api/errors'
import { CAMPAIGN_OBJECTIVES, CAMPAIGN_PLATFORMS, CAMPAIGN_STATUSES, type Campaign } from '@/types'
import { useCreateCampaign, useUpdateCampaign } from '../../hooks/use-campaigns'
import {
  campaignFormSchema,
  toCampaignInput,
  type CampaignFormInput,
  type CampaignFormValues,
} from '../../schemas'

const dayOf = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '')

function defaults(campaign: Campaign | null, ownerId: string): CampaignFormInput {
  return {
    name: campaign?.name ?? '',
    platform: campaign?.platform ?? 'facebook',
    objective: campaign?.objective ?? 'leads',
    status: campaign?.status ?? 'draft',
    budget: campaign?.budget ?? 0,
    startDate: dayOf(campaign?.startDate) || new Date().toISOString().slice(0, 10),
    endDate: dayOf(campaign?.endDate),
    ownerId: campaign?.ownerId ?? ownerId,
    tags: campaign?.tags.join(', ') ?? '',
  }
}

function CampaignForm({
  campaign,
  ownerId,
  onDone,
}: {
  campaign: Campaign | null
  ownerId: string
  onDone: () => void
}) {
  const directory = useDirectory()
  const create = useCreateCampaign()
  const update = useUpdateCampaign()
  const form = useForm<CampaignFormInput, unknown, CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: defaults(campaign, ownerId),
  })
  const { errors } = form.formState
  const pending = create.isPending || update.isPending

  const submit = form.handleSubmit(async (values) => {
    const input = toCampaignInput(values)
    try {
      if (campaign) await update.mutateAsync({ id: campaign.id, patch: input })
      else await create.mutateAsync(input)
      toast.success(campaign ? 'Campaign saved' : 'Campaign created')
      onDone()
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, messages] of Object.entries(error.fieldErrors ?? {})) {
          form.setError(field as keyof CampaignFormInput, { message: messages[0] })
        }
      }
    }
  })

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <DrawerBody className="space-y-4">
        <FormField id="camp-name" label="Name" required error={errors.name?.message}>
          {(c) => <Input id={c.id} invalid={c.invalid} aria-describedby={c['aria-describedby']} {...form.register('name')} />}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="camp-platform" label="Platform" required>
            {(c) => (
              <Select id={c.id} value={form.watch('platform')} onValueChange={(v) => form.setValue('platform', v as CampaignFormInput['platform'])}
                options={CAMPAIGN_PLATFORMS.map((v) => ({ value: v, label: PLATFORM_LABELS[v] }))} />
            )}
          </FormField>
          <FormField id="camp-objective" label="Objective" required>
            {(c) => (
              <Select id={c.id} value={form.watch('objective')} onValueChange={(v) => form.setValue('objective', v as CampaignFormInput['objective'])}
                options={CAMPAIGN_OBJECTIVES.map((v) => ({ value: v, label: OBJECTIVE_LABELS[v] }))} />
            )}
          </FormField>
          <FormField id="camp-status" label="Status" required>
            {(c) => (
              <Select id={c.id} value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as CampaignFormInput['status'])}
                options={CAMPAIGN_STATUSES.map((v) => ({ value: v, label: CAMPAIGN_STATUS_LABELS[v] }))} />
            )}
          </FormField>
          <FormField id="camp-budget" label="Budget (INR)" required error={errors.budget?.message}>
            {(c) => <Input id={c.id} type="number" min={0} step="1" invalid={c.invalid} aria-describedby={c['aria-describedby']} {...form.register('budget')} />}
          </FormField>
          <FormField id="camp-start" label="Start date" required error={errors.startDate?.message}>
            {(c) => <DatePicker id={c.id} invalid={c.invalid} value={form.watch('startDate')} onValueChange={(v) => form.setValue('startDate', v, { shouldValidate: true })} />}
          </FormField>
          <FormField id="camp-end" label="End date" error={errors.endDate?.message}>
            {(c) => <DatePicker id={c.id} invalid={c.invalid} value={form.watch('endDate') ?? ''} onValueChange={(v) => form.setValue('endDate', v, { shouldValidate: true })} />}
          </FormField>
        </div>
        <FormField id="camp-owner" label="Owner" required error={errors.ownerId?.message}>
          {(c) => (
            <Select id={c.id} value={form.watch('ownerId')} onValueChange={(v) => form.setValue('ownerId', v)}
              options={(directory.data ?? []).map((u) => ({ value: u.id, label: u.name }))} />
          )}
        </FormField>
        <FormField id="camp-tags" label="Tags" hint="Separate with commas">
          {(c) => <Input id={c.id} {...form.register('tags')} />}
        </FormField>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>{campaign ? 'Save changes' : 'Create campaign'}</Button>
      </DrawerFooter>
    </form>
  )
}

export function CampaignDrawer({
  open,
  campaign,
  ownerId,
  onOpenChange,
}: {
  open: boolean
  campaign: Campaign | null
  ownerId: string
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <DrawerTitle>{campaign ? 'Edit campaign' : 'New campaign'}</DrawerTitle>
          <DrawerDescription>Platform, budget, dates and who owns it.</DrawerDescription>
        </DrawerHeader>
        {open ? <CampaignForm key={campaign?.id ?? 'new'} campaign={campaign} ownerId={ownerId} onDone={() => onOpenChange(false)} /> : null}
      </DrawerContent>
    </Drawer>
  )
}
