import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LostReasonDialog } from '@/components/common/LostReasonDialog'
import { toast } from '@/components/ui'
import type { ConvertToCustomerInput } from '@/services/api/leads'
import { isLeadId, type CustomFieldDefinition, type Lead, type LeadMergeChoices, type LostReason } from '@/types'
import { AssignDialog } from '../bulk/AssignDialog'
import { LeadDrawer } from '../form/LeadDrawer'
import {
  useAssignLead,
  useAutoAssignLeads,
  useConvertLeadToCustomer,
  useConvertLeadToDeal,
  useDeleteLead,
} from '../../hooks/use-lead-mutations'
import { useChangeLeadStatus } from '../../hooks/use-change-lead-status'
import { useKeepSeparate, useLinkDuplicate, useMergeLeads } from '../../hooks/use-duplicate-actions'
import type { ConvertDealFormValues } from '../../lib/detail-schemas'
import type { LeadLookups } from '../../types'
import { ConvertCustomerDialog } from './ConvertCustomerDialog'
import { ConvertDealDialog } from './ConvertDealDialog'
import { LeadCompareDialog } from './LeadCompareDialog'
import { ReopenLeadDialog } from './ReopenLeadDialog'

export type DetailPanel =
  | null
  | { type: 'edit' }
  | { type: 'assign' }
  | { type: 'delete' }
  | { type: 'deal' }
  | { type: 'customer'; statusId: string }
  | { type: 'lost'; statusId: string }
  | { type: 'invalid'; statusId: string }
  | { type: 'reopen' }
  | { type: 'compare'; leadId: string }

export function LeadDetailDialogs({
  lead,
  panel,
  lookups,
  customFields,
  lostReasons,
  backTo,
  onPanel,
}: {
  lead: Lead
  panel: DetailPanel
  lookups: LeadLookups
  customFields: CustomFieldDefinition[]
  lostReasons: LostReason[]
  backTo: string
  onPanel: (panel: DetailPanel) => void
}) {
  const navigate = useNavigate()
  const close = () => onPanel(null)
  const change = useChangeLeadStatus()
  const assign = useAssignLead()
  const autoAssign = useAutoAssignLeads()
  const remove = useDeleteLead()
  const convert = useConvertLeadToCustomer()
  const convertDeal = useConvertLeadToDeal()
  const merge = useMergeLeads()
  const separate = useKeepSeparate()
  const link = useLinkDuplicate()

  return (
    <>
      <LeadDrawer
        open={panel?.type === 'edit'}
        mode="edit"
        lead={lead}
        lookups={lookups}
        customFields={customFields}
        onOpenChange={(open) => !open && close()}
      />
      <AssignDialog
        open={panel?.type === 'assign'}
        users={lookups.users}
        count={1}
        loading={assign.isPending || autoAssign.isPending}
        onOpenChange={(open) => !open && close()}
        onAssign={(userId) => assign.mutate({ id: lead.id, userId }, { onSuccess: close })}
        onAutoAssign={() => autoAssign.mutate([lead.id], { onSuccess: close })}
      />
      <ConfirmDialog
        open={panel?.type === 'delete'}
        title="Delete this lead?"
        description={`${lead.name} and its timeline will be removed.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onOpenChange={(open) => !open && close()}
        onConfirm={() =>
          remove.mutate(lead.id, {
            onSuccess: () => navigate({ pathname: '/leads', search: backTo }),
          })
        }
      />
      <ConfirmDialog
        open={panel?.type === 'invalid'}
        title="Mark this lead invalid?"
        description="Use this when the lead is junk or not a real enquiry."
        confirmLabel="Mark invalid"
        loading={change.isPending}
        onOpenChange={(open) => !open && close()}
        onConfirm={() => {
          if (panel?.type !== 'invalid') return
          change.mutate({ id: lead.id, statusId: panel.statusId }, { onSuccess: close })
        }}
      />
      <LostReasonDialog
        open={panel?.type === 'lost'}
        reasons={lostReasons}
        loading={change.isPending}
        onOpenChange={(open) => !open && close()}
        onConfirm={({ lostReasonId, note }) => {
          if (panel?.type !== 'lost') return
          change.mutate({ id: lead.id, statusId: panel.statusId, lostReasonId, note }, { onSuccess: close })
        }}
      />
      <ReopenLeadDialog
        open={panel?.type === 'reopen'}
        statuses={lookups.statuses}
        loading={change.isPending}
        onOpenChange={(open) => !open && close()}
        onConfirm={(statusId) => change.mutate({ id: lead.id, statusId }, { onSuccess: close })}
      />
      <ConvertDealDialog
        open={panel?.type === 'deal'}
        lead={lead}
        lookups={lookups}
        loading={convertDeal.isPending}
        onOpenChange={(open) => !open && close()}
        onConfirm={(values: ConvertDealFormValues) =>
          convertDeal.mutate(
            { id: lead.id, input: values },
            { onSuccess: () => { toast.success('Deal created'); close() } },
          )
        }
      />
      <ConvertCustomerDialog
        open={panel?.type === 'customer'}
        lead={lead}
        statusId={panel?.type === 'customer' ? panel.statusId : ''}
        lookups={lookups}
        loading={convert.isPending}
        onOpenChange={(open) => !open && close()}
        onConfirm={(input: ConvertToCustomerInput) =>
          convert.mutate(
            { id: lead.id, input },
            { onSuccess: () => { toast.success('Converted to customer'); close() } },
          )
        }
      />
      <LeadCompareDialog
        open={panel?.type === 'compare'}
        primary={lead}
        secondaryId={panel?.type === 'compare' ? panel.leadId : null}
        loading={merge.isPending}
        onOpenChange={(open) => !open && close()}
        onMerge={(choices: LeadMergeChoices) => {
          if (panel?.type !== 'compare' || !isLeadId(panel.leadId)) return
          merge.mutate({ primaryId: lead.id, secondaryId: panel.leadId, choices }, { onSuccess: close })
        }}
        onKeepSeparate={() => {
          if (panel?.type !== 'compare' || !isLeadId(panel.leadId)) return
          separate.mutate({ id: lead.id, otherId: panel.leadId }, { onSuccess: close })
        }}
        onLink={() => {
          if (panel?.type !== 'compare' || !isLeadId(panel.leadId)) return
          link.mutate({ id: panel.leadId, targetId: lead.id }, { onSuccess: close })
        }}
      />
    </>
  )
}
