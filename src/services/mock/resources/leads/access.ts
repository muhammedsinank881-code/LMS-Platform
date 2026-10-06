import { getLeadFieldValue } from '@/lib/lead-fields'
import { LEAD_FILTER_FIELDS, type Action, type Lead, type LeadFilterField } from '@/types'
import type { RequestContext } from '../../core/context'
import type { ListSpec } from '../../core/list-engine'

/** Whether the caller's data scope covers a lead: they own it, created it, or lead its team. */
export const leadInScope = (ctx: RequestContext, lead: Lead): boolean =>
  ctx.inScope('leads', lead.assignedTo, lead.createdBy)

/** Leads the caller may see. Merged-away (archived) leads are hidden everywhere. */
export function visibleLeads(ctx: RequestContext): Lead[] {
  ctx.require('leads', 'view')
  return ctx.db.all('leads').filter((lead) => !lead.archivedAt && leadInScope(ctx, lead))
}

/** Loads a lead for an action: NOT_FOUND across workspaces, FORBIDDEN outside the data scope. */
export function requireLead(ctx: RequestContext, id: string, action: Action): Lead {
  ctx.require('leads', action)
  const lead = ctx.db.get('leads', id, 'Lead')
  ctx.assertInScope('leads', lead.assignedTo, lead.createdBy)
  return lead
}

export function leadListSpec(ctx: RequestContext): ListSpec<Lead, string> {
  const custom = ctx.db
    .all('customFields')
    .filter((field) => field.entity === 'lead' && field.archived !== true)
    .map((field) => `cf:${field.key}`)
  return {
    fields: [...LEAD_FILTER_FIELDS, ...custom],
    value: (lead, field) =>
      field.startsWith('cf:')
        ? (lead.customFields?.[field.slice(3)] ?? null)
        : getLeadFieldValue(lead, field as LeadFilterField, { now: ctx.now, teamOf: ctx.teamOf }),
    searchable: (lead) => [
      lead.id,
      lead.name,
      lead.phone,
      lead.whatsapp,
      lead.email,
      lead.company,
      lead.location,
      lead.productInterest,
    ],
    defaultSort: [{ field: 'createdAt', direction: 'desc' }],
    now: ctx.now,
  }
}
