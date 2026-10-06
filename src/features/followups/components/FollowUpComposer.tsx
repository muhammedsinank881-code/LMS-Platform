import { useMediaQuery } from '@/hooks/use-media-query'
import { isLeadId, type LeadId } from '@/types'
import { useLead } from '@/features/leads/hooks/use-leads'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'
import { toast } from '@/components/ui'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  Skeleton,
} from '@/components/ui'
import { useCreateFollowUp } from '../hooks/use-followup-mutations'
import { FollowUpForm } from './FollowUpForm'

export function FollowUpComposer() {
  const draft = useUiStore((state) => state.followUpDraft)
  const close = useUiStore((state) => state.closeFollowUp)
  const mobile = useMediaQuery('(max-width: 767px)')
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const onlyLeadId = draft?.leadIds.length === 1 ? draft.leadIds[0] : undefined
  const singleId = onlyLeadId && isLeadId(onlyLeadId) ? onlyLeadId : null
  const lead = useLead(singleId)
  const create = useCreateFollowUp()
  const open = draft !== null
  const assignee = draft?.assigneeId ?? lead.data?.assignedTo ?? userId
  const title = 'Schedule follow-up'
  const description = 'Pick a lead, a time, and who should do it.'

  const body =
    draft && singleId && lead.isLoading ? (
      <div className="space-y-3 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    ) : draft ? (
      <FollowUpForm
        key={`${draft.leadIds.join('|')}:${draft.dueAt ?? ''}:${assignee}`}
        leadIds={draft.leadIds}
        lockLead={draft.lockLead}
        leadLabel={lead.data?.name}
        defaultAssigneeId={assignee}
        defaultDueAt={draft.dueAt}
        defaultType={draft.type}
        submitting={create.isPending}
        onCancel={close}
        onSubmit={async (input, ids) => {
          const targets = ids.filter(isLeadId)
          await Promise.all(
            targets.map((id) =>
              create.mutateAsync({ ...input, leadId: id as LeadId, ...(draft.dealId ? { dealId: draft.dealId } : {}) }),
            ),
          )
          toast.success(targets.length > 1 ? `Scheduled ${targets.length} follow-ups` : 'Follow-up scheduled')
          close()
        }}
      />
    ) : null

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && close()}>
        <DrawerContent side="right" size="lg" className="h-dvh max-h-dvh sm:max-w-none">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Modal open={open} onOpenChange={(next) => !next && close()}>
      <ModalContent size="lg" className="max-h-[90vh]">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        {body}
      </ModalContent>
    </Modal>
  )
}
