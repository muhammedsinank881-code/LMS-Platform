import type { Automation, Deal, Lead, LeafAction, LeafActionType } from '@/types'
import type { RequestContext } from '../../core/context'

/** What an action operates on. Ids, not rows, so each executor reads fresh data after earlier writes. */
export interface ExecTarget {
  leadId: string | null
  dealId: string | null
}

export type Executor<T extends LeafAction> = (
  ctx: RequestContext,
  action: T,
  target: ExecTarget,
  automation: Pick<Automation, 'id' | 'name' | 'createdBy'>,
) => string

export type ExecutorMap = { [K in LeafActionType]: Executor<Extract<LeafAction, { type: K }>> }
export type ExecutorGroup<K extends LeafActionType> = Pick<ExecutorMap, K>

export function leadOf(ctx: RequestContext, target: ExecTarget): Lead {
  if (!target.leadId) throw new Error('This action needs a lead, but the trigger has none.')
  const lead = ctx.db.find('leads', target.leadId)
  if (!lead) throw new Error('The lead no longer exists.')
  return lead
}

export function dealOf(ctx: RequestContext, target: ExecTarget): Deal {
  if (!target.dealId) throw new Error('This action needs a deal, but none is linked.')
  const deal = ctx.db.find('deals', target.dealId)
  if (!deal) throw new Error('The deal no longer exists.')
  return deal
}

/** Replaces {{lead.name}}, {{lead.company}}, {{deal.title}} and {{owner.name}} in message text. */
export function interpolate(ctx: RequestContext, text: string, target: ExecTarget): string {
  const lead = target.leadId ? ctx.db.find('leads', target.leadId) : undefined
  const deal = target.dealId ? ctx.db.find('deals', target.dealId) : undefined
  const owner = lead?.assignedTo ? ctx.db.find('users', lead.assignedTo) : undefined
  const values: Record<string, string> = {
    'lead.name': lead?.name ?? '',
    'lead.company': lead?.company ?? '',
    'lead.phone': lead?.phone ?? '',
    'deal.title': deal?.title ?? '',
    'owner.name': owner?.name ?? '',
  }
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => values[key] ?? match)
}

/** Who an action's own work is assigned to when the lead has no owner: the automation's creator. */
export function fallbackUserId(
  ctx: RequestContext,
  lead: Lead | null,
  automation: Pick<Automation, 'createdBy'>,
): string {
  const candidates = [lead?.assignedTo, automation.createdBy]
  const found = candidates.find((id): id is string => Boolean(id) && Boolean(ctx.db.find('users', id as string)))
  if (found) return found
  const admin = ctx.db.all('users').find((u) => u.status === 'active' && (u.role === 'admin' || u.role === 'super_admin'))
  if (!admin) throw new Error('No user available to own the new record.')
  return admin.id
}
