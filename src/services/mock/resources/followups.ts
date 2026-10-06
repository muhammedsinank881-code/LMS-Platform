import { addMinutes } from 'date-fns'
import { bucketFollowUps, bucketOf } from '@/lib/followup-buckets'
import { ApiError } from '@/services/api/errors'
import type { FollowUpsApiClient } from '@/services/api/followups'
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  type FollowUp,
  type FollowUpFilterField,
  isDealId,
  type LeadId,
} from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, filterRows, propertyValue, type ListSpec } from '../core/list-engine'
import { notify, recordActivity, recordAudit } from '../core/records'
import { newId } from '../core/util'
import { emit } from '../automation/event-bus'
import { parseInput, validationError } from '../core/validate'

const FIELDS: readonly FollowUpFilterField[] = [
  'leadId',
  'dealId',
  'assigneeId',
  'type',
  'priority',
  'status',
  'dueAt',
  'bucket',
  'sourceId',
]

/** `overdue` is never stored: a pending follow-up past its due time reads as overdue. */
const withStatus = (ctx: RequestContext, f: FollowUp): FollowUp =>
  f.status === 'pending' && Date.parse(f.dueAt) < ctx.now.getTime()
    ? { ...f, status: 'overdue' }
    : f

function spec(ctx: RequestContext): ListSpec<FollowUp, FollowUpFilterField> {
  return {
    fields: FIELDS,
    value(f, field) {
      if (field === 'status') return withStatus(ctx, f).status
      if (field === 'bucket') return f.status === 'done' ? 'none' : bucketOf(f.dueAt, ctx.now)
      if (field === 'sourceId') return ctx.db.find('leads', f.leadId)?.sourceId ?? null
      return propertyValue(f, field)
    },
    searchable(f) {
      const lead = ctx.db.find('leads', f.leadId)
      return [f.notes, f.type, lead?.name, lead?.company, lead?.phone]
    },
    defaultSort: [{ field: 'dueAt', direction: 'asc' }],
    now: ctx.now,
  }
}

const owners = (f: FollowUp) => [f.assigneeId, f.createdBy]

function visible(ctx: RequestContext): FollowUp[] {
  ctx.require('followups', 'view')
  return ctx.db
    .all('followUps')
    .filter((f) => ctx.inScope('followups', ...owners(f)))
    .map((f) => withStatus(ctx, f))
}

function requireFollowUp(
  ctx: RequestContext,
  id: string,
  action: 'view' | 'edit' | 'delete',
): FollowUp {
  ctx.require('followups', action)
  const followUp = ctx.db.get('followUps', id, 'Follow-up')
  ctx.assertInScope('followups', ...owners(followUp))
  return followUp
}

function requirePending(followUp: FollowUp): void {
  if (followUp.status === 'done') {
    throw new ApiError('CONFLICT', 'This follow-up is already completed.')
  }
}

/** A lead's next follow-up is its earliest pending one. */
export function syncNextFollowUp(ctx: RequestContext, leadId: LeadId): void {
  const lead = ctx.db.find('leads', leadId)
  if (!lead) return
  const next =
    ctx.db
      .all('followUps')
      .filter((f) => f.leadId === leadId && f.status === 'pending')
      .map((f) => f.dueAt)
      .sort()[0] ?? null
  if (next !== lead.nextFollowUpAt) ctx.db.save('leads', { ...lead, nextFollowUpAt: next })
}

function assertDate(value: string, field: string): void {
  if (Number.isNaN(Date.parse(value))) throw validationError(field, 'Pick a valid date and time.')
}

export function createFollowUpRecord(ctx: RequestContext, raw: unknown): FollowUp {
  ctx.require('followups', 'create')
  const input = parseInput(createFollowUpSchema, raw)
  const lead = ctx.db.get('leads', input.leadId, 'Lead')
  ctx.assertInScope('leads', lead.assignedTo, lead.createdBy)
  const assigneeId = input.assigneeId ?? ctx.actor.id
  if (assigneeId !== ctx.actor.id) ctx.require('followups', 'assign')
  if (!ctx.db.find('users', assigneeId))
    throw validationError('assigneeId', 'Select a valid assignee.')

  const followUp = ctx.db.insert('followUps', {
    id: newId('followup'),
    leadId: lead.id,
    dealId:
      input.dealId && isDealId(input.dealId) && ctx.db.find('deals', input.dealId)?.leadId === lead.id
        ? input.dealId
        : (ctx.db.all('deals').find((deal) => deal.leadId === lead.id)?.id ?? null),
    type: input.type,
    dueAt: new Date(input.dueAt).toISOString(),
    assigneeId,
    priority: input.priority,
    status: 'pending',
    notes: input.notes?.trim() ?? '',
    reminderOffsetMinutes: input.reminderOffsetMinutes ?? 15,
    completedAt: null,
    completionNote: null,
    createdBy: ctx.actor.id,
    createdAt: ctx.timestamp,
  })
  syncNextFollowUp(ctx, lead.id)
  recordActivity(ctx, lead.id, {
    type: 'followup_scheduled',
    data: { followUpId: followUp.id, kind: followUp.type, dueAt: followUp.dueAt },
  })
  notify(ctx, assigneeId, {
    type: 'followup_due',
    title: 'Follow-up scheduled',
    body: `${followUp.type} with ${lead.name}`,
    link: '/follow-ups',
  })
  recordAudit(ctx, {
    action: 'created',
    entity: 'follow_up',
    entityId: followUp.id,
    entityLabel: `${followUp.type} with ${lead.name}`,
    newValue: { dueAt: followUp.dueAt },
  })
  return followUp
}

const OUTCOME_LABEL = {
  completed: 'Completed',
  no_answer: 'No answer',
  rescheduled: 'Rescheduled',
} as const

function complete(ctx: RequestContext, id: string, input?: { outcome?: FollowUp['completionOutcome']; note?: string }): FollowUp {
  const followUp = requireFollowUp(ctx, id, 'edit')
  if (followUp.status === 'done') return followUp
  const outcome = input?.outcome ?? 'completed'
  const noteText = input?.note?.trim() || ''
  const completionNote = [OUTCOME_LABEL[outcome], noteText].filter(Boolean).join(' — ')
  const saved = ctx.db.save('followUps', {
    ...followUp,
    status: 'done',
    completedAt: ctx.timestamp,
    completionNote: completionNote || null,
    completionOutcome: outcome,
  })
  syncNextFollowUp(ctx, saved.leadId)
  recordActivity(ctx, saved.leadId, {
    type: 'followup_completed',
    data: { followUpId: saved.id, kind: saved.type, note: saved.completionNote ?? '' },
  })
  const lead = ctx.db.find('leads', saved.leadId)
  if (lead) {
    ctx.db.save('leads', { ...lead, lastContactedAt: ctx.timestamp, updatedAt: ctx.timestamp })
  }
  recordAudit(ctx, {
    action: 'updated',
    entity: 'follow_up',
    entityId: saved.id,
    entityLabel: `${saved.type} with ${lead?.name ?? saved.leadId}`,
    previousValue: { status: 'pending' },
    newValue: { status: 'done' },
  })
  emit(ctx, {
    type: 'followup_completed',
    entity: { kind: 'followup', id: saved.id },
    data: { followUpType: saved.type },
  })
  return saved
}

function moveDue(ctx: RequestContext, id: string, dueAt: string, reason?: string): FollowUp {
  const followUp = requireFollowUp(ctx, id, 'edit')
  requirePending(followUp)
  assertDate(dueAt, 'dueAt')
  const saved = ctx.db.save('followUps', { ...followUp, dueAt: new Date(dueAt).toISOString() })
  syncNextFollowUp(ctx, saved.leadId)
  recordActivity(ctx, saved.leadId, {
    type: 'followup_scheduled',
    data: { followUpId: saved.id, kind: saved.type, dueAt: saved.dueAt },
  })
  const why = reason?.trim()
  if (why) {
    recordActivity(ctx, saved.leadId, { type: 'note', data: { text: `Rescheduled: ${why}` } })
  }
  return saved
}

export const mockFollowUpsApi: FollowUpsApiClient = {
  list: (params) =>
    request((ctx) => applyListParams(visible(ctx), params, spec(ctx), 'follow-ups')),
  get: (id) => request((ctx) => withStatus(ctx, requireFollowUp(ctx, id, 'view'))),
  create: (input) => request((ctx) => createFollowUpRecord(ctx, input)),
  update: (id, patch) =>
    request((ctx) => {
      const followUp = requireFollowUp(ctx, id, 'edit')
      requirePending(followUp)
      const input = parseInput(updateFollowUpSchema, patch)
      if (input.assigneeId && input.assigneeId !== followUp.assigneeId) {
        ctx.require('followups', 'assign')
        if (!ctx.db.find('users', input.assigneeId)) {
          throw validationError('assigneeId', 'Select a valid assignee.')
        }
      }
      const saved = ctx.db.save('followUps', {
        ...followUp,
        ...(input.type && { type: input.type }),
        ...(input.priority && { priority: input.priority }),
        ...(input.assigneeId && { assigneeId: input.assigneeId }),
        ...(input.notes !== undefined && { notes: input.notes?.trim() ?? '' }),
        ...(input.dueAt && { dueAt: new Date(input.dueAt).toISOString() }),
        ...(input.reminderOffsetMinutes !== undefined && {
          reminderOffsetMinutes: input.reminderOffsetMinutes ?? null,
        }),
      })
      syncNextFollowUp(ctx, saved.leadId)
      return withStatus(ctx, saved)
    }),
  delete: (id) =>
    request((ctx) => {
      const followUp = requireFollowUp(ctx, id, 'delete')
      ctx.db.remove('followUps', id)
      syncNextFollowUp(ctx, followUp.leadId)
    }),
  complete: (id, input) => request((ctx) => complete(ctx, id, input)),
  reschedule: (id, input) => request((ctx) => moveDue(ctx, id, input.dueAt, input.reason)),
  snooze: (id, minutes) =>
    request((ctx) => {
      if (!(minutes > 0)) throw validationError('minutes', 'Snooze for at least one minute.')
      const followUp = requireFollowUp(ctx, id, 'edit')
      const base = Math.max(Date.parse(followUp.dueAt), ctx.now.getTime())
      return moveDue(ctx, id, addMinutes(base, minutes).toISOString())
    }),
  getBuckets: (params) =>
    request((ctx) =>
      bucketFollowUps(filterRows(visible(ctx), params, spec(ctx), 'follow-ups'), ctx.now),
    ),
}
