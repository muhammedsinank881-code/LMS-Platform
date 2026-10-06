import type { AudienceCount, BroadcastAudience, Lead } from '@/types'
import type { RequestContext } from '../core/context'
import { filterRows } from '../core/list-engine'
import { validationError } from '../core/validate'
import { leadListSpec, visibleLeads } from './leads/access'

const whatsappNumber = (lead: Lead) => lead.whatsapp ?? lead.phone

/** Every lead in the audience that the caller can see, opted out or not. */
export function audienceLeads(ctx: RequestContext, audience: BroadcastAudience): Lead[] {
  const visible = visibleLeads(ctx)
  if (audience.kind === 'tag') {
    if (!audience.tag.trim()) throw validationError('audience', 'Pick a tag.')
    return visible.filter((lead) => lead.tags.includes(audience.tag))
  }
  const view = ctx.db.find('savedViews', audience.viewId)
  if (!view || view.entity !== 'leads') throw validationError('audience', 'Pick a saved leads view.')
  return filterRows(visible, { filters: view.conditions, sort: view.sort }, leadListSpec(ctx), 'leads')
}

export function splitAudience(leads: readonly Lead[]): { eligible: Lead[]; count: AudienceCount } {
  const optedOut = leads.filter((lead) => lead.whatsappOptOut)
  const withoutNumber = leads.filter((lead) => !lead.whatsappOptOut && !whatsappNumber(lead))
  const eligible = leads.filter((lead) => !lead.whatsappOptOut && whatsappNumber(lead))
  return {
    eligible,
    count: {
      total: leads.length,
      optedOut: optedOut.length,
      missingNumber: withoutNumber.length,
      eligible: eligible.length,
    },
  }
}

export function audienceLabel(ctx: RequestContext, audience: BroadcastAudience): string {
  if (audience.kind === 'tag') return `Tag: ${audience.tag}`
  return `View: ${ctx.db.find('savedViews', audience.viewId)?.name ?? 'Saved view'}`
}

export { whatsappNumber }
