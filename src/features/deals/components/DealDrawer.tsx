import { Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, Button } from '@/components/ui'
import { useAuthStore } from '@/store/auth-store'
import { useLeadLookups } from '@/features/leads/hooks/use-lead-lookups'
import { useCustomFields } from '@/features/settings/hooks/use-settings'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { useCreateDeal, useUpdateDeal } from '../hooks/use-deals'
import type { CreateDealInput, Deal, UpdateDealInput } from '@/types'
import { DealForm } from './DealForm'

export function DealDrawer({
  open,
  deal,
  onOpenChange,
}: {
  open: boolean
  deal?: Deal | null
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateDeal()
  const update = useUpdateDeal()
  const pipelines = usePipelines()
  const { lookups } = useLeadLookups()
  const customFields = useCustomFields()
  const currency = useAuthStore((state) => state.tenant?.currency ?? 'INR')
  const pending = create.isPending || update.isPending

  const submit = async (values: CreateDealInput) => {
    if (deal) {
      const patch: UpdateDealInput = {
        title: values.title,
        value: values.value,
        expectedCloseDate: values.expectedCloseDate,
        probability: values.probability,
        product: values.product,
        ownerId: values.ownerId,
        pipelineId: values.pipelineId,
        customFields: values.customFields,
      }
      await update.mutateAsync({ id: deal.id, patch })
    } else {
      await create.mutateAsync(values)
    }
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>{deal ? 'Edit deal' : 'New deal'}</DrawerTitle>
          <DrawerDescription>Value, stage, and expected revenue.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          {open ? (
            <DealForm
              formId="deal-form"
              users={lookups.users}
              pipelines={pipelines.data ?? []}
              currency={currency}
              customFields={customFields.data ?? []}
              defaultValues={deal ? { ...deal, leadId: deal.leadId } : undefined}
              onSubmit={(values) => void submit(values)}
            />
          ) : null}
        </DrawerBody>
        <DrawerFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="deal-form" loading={pending}>{deal ? 'Save' : 'Create'}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
