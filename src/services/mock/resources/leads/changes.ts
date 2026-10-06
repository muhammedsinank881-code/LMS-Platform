import { calculateLeadScore } from '@/lib/scoring'
import { ApiError } from '@/services/api/errors'
import type { ChangeLeadStatusInput } from '@/services/api/leads'
import type { Lead } from '@/types'
import type { RequestContext } from '../../core/context'
import { notify, recordActivity, recordAudit } from '../../core/records'
import { emit } from '../../automation/event-bus'
import { validationError } from '../../core/validate'

/** Keeps a user's open-lead count in step as leads are assigned and moved. */
export function adjustWorkload(ctx: RequestContext, userId: string | null, delta: number): void {
  if (!userId) return
  const user = ctx.db.find('users', userId)
  if (user) ctx.db.save('users', { ...user, workload: Math.max(0, user.workload + delta) })
}

/** Recomputes score, category and breakdown from the workspace's current rules. */
export function rescore(ctx: RequestContext, lead: Lead): Lead {
  const rules = ctx.db.all('scoringRules')
  const settings = ctx.db.all('tenantSettings')[0]
  const result = calculateLeadScore(lead, rules, settings?.scoringThresholds, ctx.now, {
    decay: settings?.scoringDecay,
  })
  return {
    ...lead,
    score: result.score,
    scoreCategory: result.category,
    scoreBreakdown: result.breakdown,
  }
}

/** Saves a rescored lead and writes `score_changed` if the number moved. */
export function saveWithRescore(ctx: RequestContext, lead: Lead, previous: Lead): Lead {
  const scored = rescore(ctx, lead)
  const saved = ctx.db.save('leads', scored)
  if (scored.score !== previous.score) {
    recordActivity(
      ctx,
      saved.id,
      { type: 'score_changed', data: { from: previous.score, to: scored.score } },
      { actorId: null },
    )
    emit(ctx, {
      type: 'score_crossed',
      entity: { kind: 'lead', id: saved.id },
      data: { fromScore: previous.score, toScore: scored.score },
    })
  }
  return saved
}

export function applyStatusChange(
  ctx: RequestContext,
  lead: Lead,
  input: ChangeLeadStatusInput,
): Lead {
  const target = ctx.db.find('leadStatuses', input.statusId)
  if (!target) throw validationError('statusId', 'Select a valid status.')
  if (lead.statusId === target.id) return lead

  let lostReasonId: string | null = null
  if (target.type === 'lost') {
    if (!input.lostReasonId)
      throw validationError('lostReasonId', 'Choose a reason for losing this lead.')
    if (!ctx.db.find('lostReasons', input.lostReasonId)) {
      throw validationError('lostReasonId', 'Select a valid lost reason.')
    }
    lostReasonId = input.lostReasonId
  }

  const from = ctx.db.get('leadStatuses', lead.statusId, 'Status')
  const saved = ctx.db.save('leads', {
    ...lead,
    statusId: target.id,
    lostReasonId,
    updatedAt: ctx.timestamp,
  })
  recordActivity(ctx, saved.id, {
    type: 'status_changed',
    data: { fromStatusId: from.id, toStatusId: target.id, lostReasonId },
  })
  if (input.note?.trim()) {
    recordActivity(ctx, saved.id, { type: 'note', data: { text: input.note.trim() } })
  }
  const lostReason = lostReasonId ? ctx.db.find('lostReasons', lostReasonId) : undefined
  recordAudit(ctx, {
    action: 'status_changed',
    entity: 'lead',
    entityId: saved.id,
    entityLabel: saved.name,
    previousValue: { status: from.name },
    newValue: { status: target.name, ...(lostReason ? { lostReason: lostReason.name } : {}) },
  })
  emit(ctx, {
    type: 'status_changed',
    entity: { kind: 'lead', id: saved.id },
    data: { fromStatusId: from.id, toStatusId: target.id },
  })
  return saved
}

export function applyAssign(ctx: RequestContext, lead: Lead, userId: string, note?: string): Lead {
  const assignee = ctx.db.find('users', userId)
  if (!assignee) throw new ApiError('NOT_FOUND', 'That team member does not exist.')
  if (assignee.status === 'inactive') {
    throw validationError('assignedTo', `${assignee.name} is deactivated and cannot own leads.`)
  }
  if (lead.assignedTo === userId) return lead

  const previousOwner = lead.assignedTo
  const saved = ctx.db.save('leads', {
    ...lead,
    assignedTo: userId,
    assignedAt: ctx.timestamp,
    updatedAt: ctx.timestamp,
  })
  adjustWorkload(ctx, previousOwner, -1)
  adjustWorkload(ctx, userId, 1)
  recordActivity(
    ctx,
    saved.id,
    previousOwner
      ? { type: 'reassigned', data: { fromUserId: previousOwner, toUserId: userId } }
      : { type: 'assigned', data: { toUserId: userId, ruleId: null } },
  )
  if (note?.trim()) recordActivity(ctx, saved.id, { type: 'note', data: { text: note.trim() } })
  recordAudit(ctx, {
    action: 'assigned',
    entity: 'lead',
    entityId: saved.id,
    entityLabel: saved.name,
    previousValue: { assignedTo: ctx.db.find('users', previousOwner ?? '')?.name ?? null },
    newValue: { assignedTo: assignee.name },
  })
  notify(ctx, userId, {
    type: 'lead_assigned',
    title: 'New lead assigned',
    body: `${saved.name} was assigned to you.`,
    link: `/leads/${saved.id}`,
  })
  emit(ctx, { type: 'lead_assigned', entity: { kind: 'lead', id: saved.id }, data: { toUserId: userId } })
  return saved
}
