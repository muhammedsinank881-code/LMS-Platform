import { pickAssignee } from '@/lib/assignment'
import { isWithinBusinessHours, rulesForClock } from '@/lib/settings/business-hours'
import type { AssignmentRule, Lead } from '@/types'
import type { RequestContext } from '../../core/context'
import { recordActivity, recordAudit } from '../../core/records'
import { applyAssign, applyStatusChange, saveWithRescore } from '../../resources/leads/changes'
import { emit } from '../event-bus'
import { interpolate, leadOf, type ExecutorGroup } from './types'

const SETTABLE = ['priority', 'productInterest', 'budget', 'language', 'location', 'leadType', 'requirement'] as const

function roundRobinRule(teamId: string | null): AssignmentRule {
  return {
    id: 'automation-round-robin',
    tenantId: '',
    name: 'Automation round robin',
    priority: 1,
    isActive: true,
    conditions: [],
    pool: { teamId, userIds: [], matchLanguage: false, matchLocation: false },
    distribution: 'round_robin',
  }
}

function pick(ctx: RequestContext, lead: Lead, rules: AssignmentRule[]): string {
  const workspace = ctx.db.find('tenantSettings', ctx.tenantId)?.workspace
  const open = workspace ? isWithinBusinessHours(ctx.now, workspace.businessHours, workspace.timezone) : true
  const result = pickAssignee(
    lead,
    rulesForClock(rules, open),
    ctx.db.all('users'),
    ctx.db.all('leads'),
    ctx.now,
    workspace?.assignmentFallback,
  )
  if (!result.userId) throw new Error(result.reason)
  return result.userId
}

/** Saves changed lead fields, rescoring and writing the same audit/event trail as a manual edit. */
function applyLeadEdit(ctx: RequestContext, lead: Lead, patch: Partial<Lead>, changed: string[]): Lead {
  const next: Lead = { ...lead, ...patch, updatedAt: ctx.timestamp }
  const saved = saveWithRescore(ctx, next, lead)
  recordAudit(ctx, {
    action: 'updated',
    entity: 'lead',
    entityId: saved.id,
    entityLabel: saved.name,
    previousValue: Object.fromEntries(changed.map((k) => [k, String((lead as unknown as Record<string, unknown>)[k] ?? '')])),
    newValue: Object.fromEntries(changed.map((k) => [k, String((saved as unknown as Record<string, unknown>)[k] ?? '')])),
  })
  emit(ctx, { type: 'lead_updated', entity: { kind: 'lead', id: saved.id }, data: { changedFields: changed } })
  return saved
}

export const leadExecutors: ExecutorGroup<
  'assign' | 'change_status' | 'add_tags' | 'remove_tags' | 'set_field' | 'add_note'
> = {
  assign(ctx, action, target) {
    const lead = leadOf(ctx, target)
    let userId: string
    if (action.strategy === 'specific_user') {
      if (!action.userId) throw new Error('No user chosen.')
      userId = action.userId
    } else if (action.strategy === 'round_robin') {
      userId = pick(ctx, lead, [roundRobinRule(action.teamId)])
    } else {
      userId = pick(ctx, lead, ctx.db.all('assignmentRules'))
    }
    const owner = ctx.db.get('users', userId, 'User')
    if (lead.assignedTo === userId) return `Already assigned to ${owner.name}`
    applyAssign(ctx, lead, userId)
    return `Assigned to ${owner.name}`
  },
  change_status(ctx, action, target) {
    const lead = leadOf(ctx, target)
    const status = ctx.db.get('leadStatuses', action.statusId, 'Status')
    if (lead.statusId === status.id) return `Already ${status.name}`
    applyStatusChange(ctx, lead, { statusId: status.id })
    return `Status set to ${status.name}`
  },
  add_tags(ctx, action, target) {
    const lead = leadOf(ctx, target)
    const added = action.tags.filter((tag) => !lead.tags.includes(tag))
    if (added.length === 0) return 'Tags already present'
    applyLeadEdit(ctx, lead, { tags: [...lead.tags, ...added] }, ['tags'])
    return `Added ${added.join(', ')}`
  },
  remove_tags(ctx, action, target) {
    const lead = leadOf(ctx, target)
    const removed = lead.tags.filter((tag) => action.tags.includes(tag))
    if (removed.length === 0) return 'None of the tags were on the lead'
    applyLeadEdit(ctx, lead, { tags: lead.tags.filter((tag) => !action.tags.includes(tag)) }, ['tags'])
    return `Removed ${removed.join(', ')}`
  },
  set_field(ctx, action, target) {
    const lead = leadOf(ctx, target)
    if (action.field.startsWith('custom.')) {
      const key = action.field.slice(7)
      const defined = ctx.db.all('customFields').some((f) => f.entity === 'lead' && f.key === key)
      if (!defined) throw new Error(`Custom field "${key}" does not exist.`)
      const value = typeof action.value === 'boolean' ? action.value : String(action.value)
      applyLeadEdit(ctx, lead, { customFields: { ...lead.customFields, [key]: value } }, ['customFields'])
      return `Set ${key} to ${String(action.value)}`
    }
    const field = SETTABLE.find((f) => f === action.field)
    if (!field) throw new Error(`"${action.field}" cannot be set by an automation.`)
    const value = field === 'budget' ? Number(action.value) : action.value
    if (field === 'budget' && !Number.isFinite(value)) throw new Error('Budget must be a number.')
    applyLeadEdit(ctx, lead, { [field]: value }, [field])
    return `Set ${field} to ${String(action.value)}`
  },
  add_note(ctx, action, target) {
    const lead = leadOf(ctx, target)
    const text = interpolate(ctx, action.text, target)
    recordActivity(ctx, lead.id, { type: 'note', data: { text } })
    return `Added a note: "${text}"`
  },
}
