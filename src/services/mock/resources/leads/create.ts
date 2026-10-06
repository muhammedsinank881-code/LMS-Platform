import { findDuplicates, normalizeEmail } from '@/lib/duplicates'
import { pickAssignee } from '@/lib/assignment'
import { isWithinBusinessHours, rulesForClock } from '@/lib/settings/business-hours'
import { normalizePhone } from '@/lib/phone'
import {
  createLeadSchema,
  toLeadId,
  type CreateLeadInput,
  type DuplicateMatch,
  type DuplicateProbe,
  type Lead,
  type UpdateLeadInput,
} from '@/types'
import type { RequestContext } from '../../core/context'
import { notify, recordActivity, recordAudit } from '../../core/records'
import { parseInput, validationError } from '../../core/validate'
import { emit } from '../../automation/event-bus'
import { adjustWorkload, rescore } from './changes'
import { placeNewLead } from './stage'

const text = (value: string | null | undefined): string | null | undefined =>
  value === undefined ? undefined : value === null ? null : value.trim() || null

function omitUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T
}

/** Canonical contact fields and trimmed text, shared by create and update. */
export function normalizeLeadFields(input: CreateLeadInput | UpdateLeadInput): Partial<Lead> {
  const { phone, whatsapp, email, company, location, productInterest, requirement, language } =
    input
  const { campaignId, ...rest } = input
  return omitUndefined({
    ...rest,
    phone: phone === undefined ? undefined : normalizePhone(phone),
    whatsapp: whatsapp === undefined ? undefined : normalizePhone(whatsapp),
    email: email === undefined ? undefined : normalizeEmail(email),
    company: text(company),
    location: text(location),
    productInterest: text(productInterest),
    requirement: text(requirement),
    language: text(language),
    campaignId: campaignId === undefined ? undefined : campaignId || null,
  }) as Partial<Lead>
}

/** Duplicates of a contact in this workspace, minus pairs a user chose to keep separate. */
export function findLeadDuplicates(
  ctx: RequestContext,
  probe: DuplicateProbe & { id?: string },
): DuplicateMatch[] {
  const dismissed = ctx.db.all('duplicateDismissals')
  const probeId = probe.id
  return findDuplicates(probe, ctx.db.all('leads')).filter(
    (match) =>
      !probeId ||
      !dismissed.some(
        (d) => d.leadIds.includes(match.lead.id) && d.leadIds.some((id) => id === probeId),
      ),
  )
}

function assertReferences(ctx: RequestContext, input: CreateLeadInput): void {
  if (!ctx.db.find('leadSources', input.sourceId)) {
    throw validationError('sourceId', 'Select a valid source.')
  }
  if (input.campaignId && !ctx.db.find('campaigns', input.campaignId)) {
    throw validationError('campaignId', 'Select a valid campaign.')
  }
  if (input.statusId && !ctx.db.find('leadStatuses', input.statusId)) {
    throw validationError('statusId', 'Select a valid status.')
  }
  if (input.assignedTo && !ctx.db.find('users', input.assignedTo)) {
    throw validationError('assignedTo', 'Select a valid team member.')
  }
}

/**
 * The create pipeline a real backend runs on every new lead: validate, flag duplicates, score,
 * route through the assignment rules, and write the timeline and audit trail.
 */
export function createLeadRecord(ctx: RequestContext, raw: unknown, options: { via?: string } = {}): Lead {
  const input = parseInput(createLeadSchema, raw)
  assertReferences(ctx, input)

  const statuses = [...ctx.db.all('leadStatuses')].sort((a, b) => a.order - b.order)
  const preferred = ctx.db.find('tenantSettings', ctx.tenantId)?.workspace.defaultStatusId
  const firstStatus = statuses.find((status) => status.id === preferred) ?? statuses[0]
  const fields = normalizeLeadFields(input)
  const draft: Lead = {
    leadType: fields.company ? 'b2b' : 'b2c',
    priority: 'medium',
    tags: [],
    qualificationStatus: 'needs_info',
    qualificationAnswers: {},
    customFields: {},
    ...fields,
    id: toLeadId(ctx.db.nextNumber('lead')),
    tenantId: ctx.tenantId,
    name: input.name,
    phone: fields.phone ?? null,
    whatsapp: fields.whatsapp ?? null,
    email: fields.email ?? null,
    company: fields.company ?? null,
    location: fields.location ?? null,
    sourceId: input.sourceId,
    campaignId: fields.campaignId ?? null,
    productInterest: fields.productInterest ?? null,
    budget: input.budget ?? null,
    requirement: fields.requirement ?? null,
    language: fields.language ?? null,
    statusId: input.statusId ?? firstStatus.id,
    pipelineId: input.pipelineId ?? '',
    stageId: input.stageId ?? '',
    position: 0,
    stageEnteredAt: ctx.timestamp,
    assignedTo: null,
    assignedAt: null,
    score: 0,
    scoreCategory: 'cold',
    scoreBreakdown: [],
    lostReasonId: null,
    duplicateOf: null,
    convertedToCustomerId: null,
    createdBy: ctx.system ? null : ctx.actor.id,
    createdAt: ctx.timestamp,
    updatedAt: ctx.timestamp,
    lastContactedAt: null,
    nextFollowUpAt: null,
    firstResponseTimeMins: null,
    archivedAt: null,
  }

  const duplicate = findLeadDuplicates(ctx, draft).find((match) => match.confidence === 'high')
  const scored = rescore(ctx, { ...draft, duplicateOf: duplicate?.lead.id ?? null })

  let ruleId: string | null = null
  let assignee = input.assignedTo ?? null
  if (!assignee) {
    const users = ctx.db.all('users').filter((u) => u.status === 'active')
    const workspace = ctx.db.find('tenantSettings', ctx.tenantId)?.workspace
    const open = workspace ? isWithinBusinessHours(ctx.now, workspace.businessHours, workspace.timezone) : true
    const picked = pickAssignee(
      scored,
      rulesForClock(ctx.db.all('assignmentRules'), open),
      users,
      ctx.db.all('leads'),
      ctx.now,
      workspace?.assignmentFallback,
    )
    assignee = picked.userId
    ruleId = picked.ruleId
  }
  // A rep who adds a lead and gets no routing keeps it, rather than losing sight of it.
  if (!assignee && (ctx.actor.role === 'salesperson' || ctx.actor.role === 'team_leader')) {
    assignee = ctx.actor.id
  }

  const saved = ctx.db.insert('leads', placeNewLead(ctx, {
    ...scored,
    assignedTo: assignee,
    assignedAt: assignee ? ctx.timestamp : null,
  }, input.pipelineId, input.stageId))
  adjustWorkload(ctx, assignee, 1)

  recordActivity(ctx, saved.id, {
    type: 'lead_created',
    data: { sourceId: saved.sourceId, ...(options.via && { via: options.via }) },
  })
  if (assignee) {
    recordActivity(
      ctx,
      saved.id,
      { type: 'assigned', data: { toUserId: assignee, ruleId } },
      { actorId: ruleId || ctx.system ? null : ctx.actor.id },
    )
    notify(ctx, assignee, {
      type: 'lead_assigned',
      title: 'New lead assigned',
      body: `${saved.name} was assigned to you.`,
      link: `/leads/${saved.id}`,
    })
  }
  recordActivity(
    ctx,
    saved.id,
    { type: 'score_changed', data: { from: 0, to: saved.score } },
    { actorId: null },
  )
  recordAudit(ctx, {
    action: 'created',
    entity: 'lead',
    entityId: saved.id,
    entityLabel: saved.name,
    newValue: { name: saved.name, source: saved.sourceId, score: saved.score },
  })
  const entity = { kind: 'lead' as const, id: saved.id }
  emit(ctx, { type: 'lead_created', entity, data: { sourceId: saved.sourceId } })
  if (assignee) emit(ctx, { type: 'lead_assigned', entity, data: { toUserId: assignee } })
  if (saved.score > 0) emit(ctx, { type: 'score_crossed', entity, data: { fromScore: 0, toScore: saved.score } })
  return saved
}
