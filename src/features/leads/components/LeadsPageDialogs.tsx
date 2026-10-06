import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/components/ui'
import type { ChangeLeadStatusInput } from '@/services/api/leads'
import type { CustomFieldDefinition, LeadId, LostReason } from '@/types'
import { useLead } from '../hooks/use-leads'
import {
  useAddLeadTags,
  useAutoAssignLeads,
  useBulkAssignLeads,
  useBulkChangeLeadStatus,
  useBulkDeleteLeads,
  useRemoveLeadTags,
} from '../hooks/use-lead-mutations'
import type { LeadLookups } from '../types'
import { AssignDialog } from './bulk/AssignDialog'
import { ChangeStatusDialog } from './bulk/ChangeStatusDialog'
import { TagsDialog } from './bulk/TagsDialog'
import { LeadDrawer } from './form/LeadDrawer'

export interface LeadsPageDialogsProps {
  lookups: LeadLookups
  customFields: CustomFieldDefinition[]
  lostReasons: LostReason[]
  drawer: { mode: 'create' } | { mode: 'edit'; id: LeadId } | null
  onDrawerOpenChange: (open: boolean) => void
  assignIds: LeadId[] | null
  statusIds: LeadId[] | null
  tagState: { ids: LeadId[]; mode: 'add' | 'remove' } | null
  deleteIds: LeadId[] | null
  onCloseAssign: () => void
  onCloseStatus: () => void
  onCloseTags: () => void
  onCloseDelete: () => void
  onClearedSelection: () => void
}

function resultToast(action: string, count: number) {
  toast.success(`${action}: ${count} updated`)
}

export function LeadsPageDialogs(props: LeadsPageDialogsProps) {
  const editing = useLead(props.drawer?.mode === 'edit' ? props.drawer.id : null)
  const assign = useBulkAssignLeads()
  const autoAssign = useAutoAssignLeads()
  const changeStatus = useBulkChangeLeadStatus()
  const addTags = useAddLeadTags()
  const removeTags = useRemoveLeadTags()
  const bulkDelete = useBulkDeleteLeads()

  const finish = (action: string, count: number, close: () => void) => {
    resultToast(action, count)
    close()
    props.onClearedSelection()
  }

  return (
    <>
      <LeadDrawer
        open={props.drawer !== null}
        mode={props.drawer?.mode ?? 'create'}
        lead={editing.data}
        lookups={props.lookups}
        customFields={props.customFields}
        onOpenChange={props.onDrawerOpenChange}
      />
      <AssignDialog
        open={props.assignIds !== null}
        onOpenChange={(open) => !open && props.onCloseAssign()}
        users={props.lookups.users}
        count={props.assignIds?.length ?? 0}
        loading={assign.isPending || autoAssign.isPending}
        onAssign={async (userId) => {
          const ids = props.assignIds ?? []
          await assign.mutateAsync({ ids, userId })
          finish('Assigned', ids.length, props.onCloseAssign)
        }}
        onAutoAssign={async () => {
          const ids = props.assignIds ?? []
          await autoAssign.mutateAsync(ids)
          finish('Auto-assigned', ids.length, props.onCloseAssign)
        }}
      />
      <ChangeStatusDialog
        open={props.statusIds !== null}
        onOpenChange={(open) => !open && props.onCloseStatus()}
        statuses={props.lookups.statuses}
        lostReasons={props.lostReasons}
        count={props.statusIds?.length ?? 0}
        loading={changeStatus.isPending}
        onSubmit={async (input: ChangeLeadStatusInput) => {
          const ids = props.statusIds ?? []
          await changeStatus.mutateAsync({ ids, ...input })
          finish('Status updated', ids.length, props.onCloseStatus)
        }}
      />
      <TagsDialog
        open={props.tagState !== null}
        onOpenChange={(open) => !open && props.onCloseTags()}
        mode={props.tagState?.mode ?? 'add'}
        tags={props.lookups.tags}
        count={props.tagState?.ids.length ?? 0}
        loading={addTags.isPending || removeTags.isPending}
        onSubmit={async (tags) => {
          const ids = props.tagState?.ids ?? []
          const removing = props.tagState?.mode === 'remove'
          if (removing) await removeTags.mutateAsync({ ids, tags })
          else await addTags.mutateAsync({ ids, tags })
          finish(removing ? 'Tags removed' : 'Tags added', ids.length, props.onCloseTags)
        }}
      />
      <ConfirmDialog
        open={props.deleteIds !== null}
        onOpenChange={(open) => !open && props.onCloseDelete()}
        title="Delete leads?"
        description={`This will permanently delete ${props.deleteIds?.length ?? 0} ${(props.deleteIds?.length ?? 0) === 1 ? 'lead' : 'leads'}.`}
        confirmLabel="Delete"
        destructive
        loading={bulkDelete.isPending}
        onConfirm={async () => {
          const ids = props.deleteIds ?? []
          await bulkDelete.mutateAsync(ids)
          finish('Deleted', ids.length, props.onCloseDelete)
        }}
      />
    </>
  )
}
