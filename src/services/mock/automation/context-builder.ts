import type { AutomationContext } from '@/lib/automation'
import { isWithinBusinessHours } from '@/lib/settings/business-hours'
import type { Deal, EntityRef, Lead } from '@/types'
import type { RequestContext } from '../core/context'

/** The lead and deal an entity refers to: a deal knows its lead, a lead its latest open deal. */
export function resolveRelated(
  ctx: RequestContext,
  entity: EntityRef,
): { lead: Lead | null; deal: Deal | null } {
  if (entity.kind === 'deal') {
    const deal = ctx.db.find('deals', entity.id) ?? null
    return { deal, lead: deal ? (ctx.db.find('leads', deal.leadId) ?? null) : null }
  }
  if (entity.kind === 'followup') {
    const followUp = ctx.db.find('followUps', entity.id)
    const lead = followUp ? (ctx.db.find('leads', followUp.leadId) ?? null) : null
    return { lead, deal: followUp?.dealId ? (ctx.db.find('deals', followUp.dealId) ?? null) : null }
  }
  if (entity.kind === 'lead') {
    const lead = ctx.db.find('leads', entity.id) ?? null
    const deal =
      ctx.db
        .all('deals')
        .filter((d) => d.leadId === lead?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    return { lead, deal }
  }
  return { lead: null, deal: null }
}

/** Builds what conditions can read, fresh from the database. Call again after writes. */
export function buildAutomationContext(ctx: RequestContext, entity: EntityRef): AutomationContext {
  const { lead, deal } = resolveRelated(ctx, entity)
  const ownerId = lead?.assignedTo ?? deal?.ownerId ?? null
  const owner = ownerId ? ctx.db.find('users', ownerId) : undefined
  const source = lead ? ctx.db.find('leadSources', lead.sourceId) : undefined
  const campaign = lead?.campaignId ? ctx.db.find('campaigns', lead.campaignId) : undefined
  const workspace = ctx.db.find('tenantSettings', ctx.tenantId)?.workspace
  return {
    now: ctx.now,
    lead,
    deal,
    owner: owner
      ? { id: owner.id, role: owner.role, teamId: owner.teamId, location: owner.location || null }
      : null,
    source: source ? { id: source.id, key: source.key, name: source.name } : null,
    campaign: campaign ? { id: campaign.id, platform: campaign.platform, name: campaign.name } : null,
    teamOf: ctx.teamOf,
    withinBusinessHours: workspace
      ? isWithinBusinessHours(ctx.now, workspace.businessHours, workspace.timezone)
      : true,
  }
}
