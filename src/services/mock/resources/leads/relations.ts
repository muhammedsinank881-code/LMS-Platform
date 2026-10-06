import type { LeadRelations } from '@/services/api/leads'
import type { Lead, LeadId, LeadSummary } from '@/types'
import type { RequestContext } from '../../core/context'
import { requireLead } from './access'

function toSummary(lead: Lead): LeadSummary {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    company: lead.company,
    statusId: lead.statusId,
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
  }
}

/** Duplicates linked to this lead, plus leads that were merged into it. */
export function getRelations(ctx: RequestContext, id: LeadId): LeadRelations {
  const lead = requireLead(ctx, id, 'view')
  const others = ctx.db.all('leads').filter((item) => item.id !== lead.id)
  const linked = others.filter(
    (item) => !item.archivedAt && (item.duplicateOf === lead.id || lead.duplicateOf === item.id),
  )
  const mergedFrom = others.filter((item) => item.archivedAt && item.duplicateOf === lead.id)
  return { linked: linked.map(toSummary), mergedFrom: mergedFrom.map(toSummary) }
}
