import { useLocation, useParams } from 'react-router-dom'
import { RoleGate } from '@/components/common/RoleGate'
import { EmptyState } from '@/components/ui'
import { ShieldOff } from 'lucide-react'
import { hasErrorCode } from '@/services/api/errors'
import { isLeadId } from '@/types'
import { useLead } from '../hooks/use-leads'
import { readLeadListSearch } from '../lib/list-return'
import { LeadDetailView } from '../components/detail/LeadDetailView'
import { LeadDetailSkeleton, LeadForbidden, LeadLoadError, LeadNotFound } from '../components/detail/LeadDetailStates'

export function LeadDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const backTo = readLeadListSearch(location.state)
  const leadId = isLeadId(id) ? id : null
  const lead = useLead(leadId)

  return (
    <RoleGate
      resource="leads"
      fallback={
        <EmptyState
          icon={ShieldOff}
          title="You don't have access to this page"
          description="Ask a workspace admin if you need access to leads."
        />
      }
    >
      {!leadId ? <LeadNotFound backTo={backTo} /> : null}
      {leadId && lead.isLoading ? <LeadDetailSkeleton /> : null}
      {leadId && lead.isError && hasErrorCode(lead.error, 'forbidden') ? <LeadForbidden /> : null}
      {leadId && lead.isError && hasErrorCode(lead.error, 'not_found') ? <LeadNotFound backTo={backTo} /> : null}
      {leadId && lead.isError && !hasErrorCode(lead.error, 'forbidden') && !hasErrorCode(lead.error, 'not_found') ? (
        <LeadLoadError onRetry={() => void lead.refetch()} />
      ) : null}
      {lead.data ? <LeadDetailView lead={lead.data} /> : null}
    </RoleGate>
  )
}
