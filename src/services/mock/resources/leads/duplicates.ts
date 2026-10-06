import { groupDuplicates } from '@/lib/duplicates'
import { mergeLeads } from '@/lib/merge-leads'
import { ApiError } from '@/services/api/errors'
import type {
  DuplicateGroup,
  DuplicateMatch,
  DuplicateProbe,
  Lead,
  LeadId,
  LeadMergeChoices,
} from '@/types'
import type { RequestContext } from '../../core/context'
import { notify, recordActivity, recordAudit } from '../../core/records'
import { validationError } from '../../core/validate'
import { requireLead, visibleLeads } from './access'
import { adjustWorkload, saveWithRescore } from './changes'
import { findLeadDuplicates } from './create'

const samePair = (ids: readonly string[], a: string, b: string) =>
  ids.includes(a) && ids.includes(b)

export function checkDuplicates(
  ctx: RequestContext,
  probe: DuplicateProbe,
  excludeId?: LeadId,
): DuplicateMatch[] {
  ctx.require('leads', 'view')
  return findLeadDuplicates(ctx, { ...probe, id: excludeId })
}

export function listDuplicateGroups(ctx: RequestContext): DuplicateGroup[] {
  const dismissed = ctx.db.all('duplicateDismissals')
  return groupDuplicates(visibleLeads(ctx)).filter(
    (group) =>
      !(
        group.leads.length === 2 &&
        dismissed.some((d) => samePair(d.leadIds, group.leads[0].id, group.leads[1].id))
      ),
  )
}

function clearFlag(ctx: RequestContext, lead: Lead, otherId: string): Lead {
  return lead.duplicateOf === otherId
    ? ctx.db.save('leads', { ...lead, duplicateOf: null, updatedAt: ctx.timestamp })
    : lead
}

/** "Keep Separate": remembers the decision and clears the duplicate flag in both directions. */
export function keepSeparate(ctx: RequestContext, id: LeadId, otherId: LeadId): Lead {
  const lead = requireLead(ctx, id, 'edit')
  const other = requireLead(ctx, otherId, 'edit')
  if (!ctx.db.all('duplicateDismissals').some((d) => samePair(d.leadIds, id, otherId))) {
    ctx.db.insert('duplicateDismissals', { id: `dismiss-${id}-${otherId}`, leadIds: [id, otherId] })
  }
  clearFlag(ctx, other, id)
  return clearFlag(ctx, lead, otherId)
}

/** "Link Records": flags `id` as a duplicate of `targetId` and keeps both. */
export function linkDuplicate(ctx: RequestContext, id: LeadId, targetId: LeadId): Lead {
  if (id === targetId) throw validationError('targetId', 'A lead cannot be linked to itself.')
  const lead = requireLead(ctx, id, 'edit')
  const target = requireLead(ctx, targetId, 'edit')
  for (const d of ctx.db.all('duplicateDismissals')) {
    if (samePair(d.leadIds, id, targetId)) ctx.db.remove('duplicateDismissals', d.id)
  }
  const saved = ctx.db.save('leads', { ...lead, duplicateOf: target.id, updatedAt: ctx.timestamp })
  recordAudit(ctx, {
    action: 'updated',
    entity: 'lead',
    entityId: saved.id,
    entityLabel: saved.name,
    previousValue: { duplicateOf: lead.duplicateOf ?? null },
    newValue: { duplicateOf: target.id },
  })
  return saved
}

/** Re-points everything that referenced the merged-away lead at the surviving one. */
function moveHistory(ctx: RequestContext, from: LeadId, to: LeadId): void {
  for (const row of ctx.db.all('activities')) {
    if (row.leadId === from) ctx.db.save('activities', { ...row, leadId: to })
  }
  for (const row of ctx.db.all('followUps')) {
    if (row.leadId === from) ctx.db.save('followUps', { ...row, leadId: to })
  }
  for (const row of ctx.db.all('tasks')) {
    if (row.leadId === from) ctx.db.save('tasks', { ...row, leadId: to })
  }
  for (const row of ctx.db.all('deals')) {
    if (row.leadId === from) ctx.db.save('deals', { ...row, leadId: to })
  }
  for (const row of ctx.db.all('conversations')) {
    if (row.leadId === from) ctx.db.save('conversations', { ...row, leadId: to })
  }
}

/**
 * Merges `secondary` into `primary`. The primary keeps its id and gains the secondary's history;
 * the secondary is archived and points back at the primary.
 */
export function mergeLeadRecords(
  ctx: RequestContext,
  primaryId: LeadId,
  secondaryId: LeadId,
  choices: LeadMergeChoices = {},
): Lead {
  if (primaryId === secondaryId) throw validationError('secondaryId', 'Pick two different leads.')
  const primary = requireLead(ctx, primaryId, 'edit')
  const secondary = requireLead(ctx, secondaryId, 'edit')
  if (primary.archivedAt || secondary.archivedAt) {
    throw new ApiError('CONFLICT', 'One of these leads has already been merged.')
  }

  const merged = mergeLeads(primary, secondary, choices)
  moveHistory(ctx, secondary.id, primary.id)
  const nextFollowUp = ctx.db
    .all('followUps')
    .filter((f) => f.leadId === primary.id && f.status === 'pending')
    .map((f) => f.dueAt)
    .sort()[0]

  adjustWorkload(ctx, secondary.assignedTo, -1)
  if (merged.assignedTo !== primary.assignedTo) {
    adjustWorkload(ctx, primary.assignedTo, -1)
    adjustWorkload(ctx, merged.assignedTo, 1)
  }

  const saved = saveWithRescore(
    ctx,
    {
      ...merged,
      duplicateOf: null,
      nextFollowUpAt: nextFollowUp ?? null,
      updatedAt: ctx.timestamp,
    },
    primary,
  )
  ctx.db.save('leads', {
    ...secondary,
    archivedAt: ctx.timestamp,
    duplicateOf: primary.id,
    updatedAt: ctx.timestamp,
  })
  recordActivity(ctx, saved.id, { type: 'merged', data: { secondaryLeadId: secondary.id } })
  recordAudit(ctx, {
    action: 'merged',
    entity: 'lead',
    entityId: saved.id,
    entityLabel: saved.name,
    previousValue: { merged: secondary.id },
    newValue: { into: saved.id },
  })
  notify(
    ctx,
    ctx.actor.id,
    {
      type: 'merge_completed',
      title: 'Leads merged',
      body: `${secondary.name} was merged into ${saved.name}.`,
      link: `/leads/${saved.id}`,
    },
    { includeActor: true },
  )
  return saved
}
