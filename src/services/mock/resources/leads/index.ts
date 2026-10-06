import { pickAssignee } from '@/lib/assignment'
import { ApiError } from '@/services/api/errors'
import type { LeadsApiClient } from '@/services/api/leads'
import {
  createLeadSchema,
  updateLeadSchema,
  type Activity,
  type ImportLeadsResult,
  type Lead,
  type LeadId,
} from '@/types'
import { normalizePhone } from '@/lib/phone'
import { request, type RequestContext } from '../../core/context'
import { applyListParams, filterRows, paginate } from '../../core/list-engine'
import { diffValues, notify, recordActivity, recordAudit } from '../../core/records'
import { parseInput, validationError } from '../../core/validate'
import { createDealRecord } from '../deals'
import { leadListSpec, requireLead, visibleLeads } from './access'
import { adjustWorkload, applyAssign, applyStatusChange, saveWithRescore } from './changes'
import { convertToCustomer } from './convert'
import { createLeadRecord, findLeadDuplicates, normalizeLeadFields } from './create'
import { deleteNote, listPinnedNotes, setNotePinned, updateNote } from './notes'
import { emit } from '../../automation/event-bus'
import { newId } from '../../core/util'
import { saveQualification } from './qualification'
import { getRelations } from './relations'
import { leadStageSummary, moveLeadStage } from './stage'
import {
  checkDuplicates,
  keepSeparate,
  linkDuplicate,
  listDuplicateGroups,
  mergeLeadRecords,
} from './duplicates'

const AUDITED_FIELDS = [
  'name',
  'phone',
  'email',
  'company',
  'location',
  'budget',
  'priority',
  'productInterest',
  'sourceId',
  'campaignId',
  'tags',
] as const

function updateLead(ctx: RequestContext, id: LeadId, patch: unknown): Lead {
  const lead = requireLead(ctx, id, 'edit')
  const input = parseInput(updateLeadSchema, patch)
  if (input.statusId !== undefined && input.statusId !== lead.statusId) {
    throw validationError('statusId', 'Change the status with changeStatus.')
  }
  if (input.assignedTo !== undefined && input.assignedTo !== lead.assignedTo) {
    throw validationError('assignedTo', 'Change the owner with assign.')
  }
  if (input.sourceId && !ctx.db.find('leadSources', input.sourceId)) {
    throw validationError('sourceId', 'Select a valid source.')
  }
  if (input.campaignId && !ctx.db.find('campaigns', input.campaignId)) {
    throw validationError('campaignId', 'Select a valid campaign.')
  }

  const fields = normalizeLeadFields(input)
  delete fields.statusId
  delete fields.assignedTo
  delete fields.pipelineId
  delete fields.stageId
  let next: Lead = { ...lead, ...fields, updatedAt: ctx.timestamp }
  if (!next.duplicateOf) {
    const duplicate = findLeadDuplicates(ctx, next).find((m) => m.confidence === 'high')
    next = { ...next, duplicateOf: duplicate?.lead.id ?? null }
  }
  const saved = saveWithRescore(ctx, next, lead)
  const diff = diffValues(lead, saved, AUDITED_FIELDS)
  const changedFields = AUDITED_FIELDS.filter(
    (field) => JSON.stringify(lead[field]) !== JSON.stringify(saved[field]),
  )
  if (diff) {
    recordAudit(ctx, {
      action: 'updated',
      entity: 'lead',
      entityId: id,
      entityLabel: saved.name,
      ...diff,
    })
  }
  if (changedFields.length > 0) {
    emit(ctx, { type: 'lead_updated', entity: { kind: 'lead', id }, data: { changedFields: [...changedFields] } })
  }
  return saved
}

function deleteLeads(ctx: RequestContext, ids: LeadId[]): void {
  const leads = ids.map((id) => requireLead(ctx, id, 'delete'))
  for (const lead of leads) {
    ctx.db.remove('leads', lead.id)
    for (const row of ctx.db.all('activities')) {
      if (row.leadId === lead.id) ctx.db.remove('activities', row.id)
    }
    for (const row of ctx.db.all('followUps')) {
      if (row.leadId === lead.id) ctx.db.remove('followUps', row.id)
    }
    for (const row of ctx.db.all('tasks')) {
      if (row.leadId === lead.id) ctx.db.save('tasks', { ...row, leadId: null })
    }
    adjustWorkload(ctx, lead.assignedTo, -1)
    recordAudit(ctx, {
      action: 'deleted',
      entity: 'lead',
      entityId: lead.id,
      entityLabel: lead.name,
      previousValue: { name: lead.name, phone: lead.phone },
    })
  }
}

function importLeads(
  ctx: RequestContext,
  rows: unknown[],
  skipDuplicates: boolean,
): ImportLeadsResult {
  ctx.require('leads', 'import')
  const result: ImportLeadsResult = {
    total: rows.length,
    created: 0,
    duplicates: 0,
    invalid: 0,
    errors: [],
  }
  rows.forEach((row, index) => {
    const parsed = createLeadSchema.safeParse(row)
    if (!parsed.success) {
      result.invalid += 1
      result.errors.push({
        row: index + 1,
        message: parsed.error.issues[0]?.message ?? 'Invalid row',
      })
      return
    }
    const { phone, whatsapp, email, company } = parsed.data
    const probe = {
      phone: normalizePhone(phone),
      whatsapp: normalizePhone(whatsapp),
      email,
      company,
    }
    if (skipDuplicates && findLeadDuplicates(ctx, probe).some((m) => m.confidence === 'high')) {
      result.duplicates += 1
      return
    }
    try {
      const lead = createLeadRecord(ctx, row)
      result.created += 1
      if (lead.duplicateOf) result.duplicates += 1
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'VALIDATION') throw error
      result.invalid += 1
      result.errors.push({ row: index + 1, message: error.message })
    }
  })
  recordAudit(ctx, {
    action: 'imported',
    entity: 'lead',
    entityId: 'bulk',
    entityLabel: 'Leads import',
    newValue: { rows: result.total, created: result.created },
  })
  emit(ctx, { type: 'import_completed', entity: { kind: 'import', id: newId('import') }, data: {} })
  notify(
    ctx,
    ctx.actor.id,
    {
      type: 'import_finished',
      title: 'Import finished',
      body: `${result.created} leads imported.`,
      link: '/leads',
    },
    { includeActor: true },
  )
  return result
}

function listActivities(
  ctx: RequestContext,
  id: LeadId,
  params: { types?: Activity['type'][]; page?: number; pageSize?: number } = {},
) {
  requireLead(ctx, id, 'view')
  const types = params.types?.length ? new Set<string>(params.types) : null
  // Newest first; events written in the same instant keep their reverse insertion order.
  const rows = ctx.db
    .all('activities')
    .filter((a) => a.leadId === id && (!types || types.has(a.type)))
    .reverse()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return paginate(rows, params.page, params.pageSize ?? 50)
}

const CONTACT_TYPES = new Set<Activity['type']>([
  'note',
  'call',
  'whatsapp_sent',
  'email_sent',
  'meeting',
  'demo',
])

export const mockLeadsApi: LeadsApiClient = {
  list: (params) =>
    request((ctx) => applyListParams(visibleLeads(ctx), params, leadListSpec(ctx), 'leads')),
  get: (id) => request((ctx) => requireLead(ctx, id, 'view')),
  create: (input) =>
    request((ctx) => {
      ctx.require('leads', 'create')
      return createLeadRecord(ctx, input)
    }),
  update: (id, patch) => request((ctx) => updateLead(ctx, id, patch)),
  delete: (id) => request((ctx) => deleteLeads(ctx, [id])),
  bulkDelete: (ids) => request((ctx) => deleteLeads(ctx, ids)),

  assign: (id, userId, note) =>
    request((ctx) => applyAssign(ctx, requireLead(ctx, id, 'assign'), userId, note)),
  bulkAssign: (ids, userId) =>
    request((ctx) => {
      const leads = ids.map((id) => requireLead(ctx, id, 'assign'))
      return leads.map((lead) => applyAssign(ctx, lead, userId))
    }),
  changeStatus: (id, input) =>
    request((ctx) => applyStatusChange(ctx, requireLead(ctx, id, 'edit'), input)),
  moveStage: (id, input) => request((ctx) => moveLeadStage(ctx, id, input)),
  getStageSummary: (params) => request((ctx) => leadStageSummary(ctx, params, visibleLeads)),
  bulkChangeStatus: (ids, input) =>
    request((ctx) => {
      const leads = ids.map((id) => requireLead(ctx, id, 'edit'))
      return leads.map((lead) => applyStatusChange(ctx, lead, input))
    }),
  addTags: (ids, tags) =>
    request((ctx) => {
      const leads = ids.map((id) => requireLead(ctx, id, 'edit'))
      const cleaned = tags.map((t) => t.trim()).filter(Boolean)
      return leads.map((lead) =>
        ctx.db.save('leads', {
          ...lead,
          tags: [...new Set([...lead.tags, ...cleaned])],
          updatedAt: ctx.timestamp,
        }),
      )
    }),
  removeTags: (ids, tags) =>
    request((ctx) => {
      const leads = ids.map((id) => requireLead(ctx, id, 'edit'))
      const remove = new Set(tags.map((t) => t.trim()).filter(Boolean))
      return leads.map((lead) =>
        ctx.db.save('leads', {
          ...lead,
          tags: lead.tags.filter((tag) => !remove.has(tag)),
          updatedAt: ctx.timestamp,
        }),
      )
    }),
  autoAssign: (ids) =>
    request((ctx) =>
      ids.map((id) => {
        const lead = requireLead(ctx, id, 'assign')
        const users = ctx.db.all('users').filter((user) => user.status === 'active')
        const picked = pickAssignee(
          lead,
          ctx.db.all('assignmentRules'),
          users,
          ctx.db.all('leads'),
          ctx.now,
        )
        return picked.userId ? applyAssign(ctx, lead, picked.userId) : lead
      }),
    ),

  checkDuplicates: (probe, excludeId) => request((ctx) => checkDuplicates(ctx, probe, excludeId)),
  listDuplicateGroups: () => request((ctx) => listDuplicateGroups(ctx)),
  merge: (primaryId, secondaryId, choices) =>
    request((ctx) => mergeLeadRecords(ctx, primaryId, secondaryId, choices)),
  keepSeparate: (id, otherId) => request((ctx) => keepSeparate(ctx, id, otherId)),
  linkDuplicate: (id, targetId) => request((ctx) => linkDuplicate(ctx, id, targetId)),

  import: (rows, options) =>
    request((ctx) => importLeads(ctx, rows, options?.skipDuplicates ?? false)),
  exportRows: (params) =>
    request((ctx) => {
      ctx.require('leads', 'export')
      const rows = filterRows(visibleLeads(ctx), params, leadListSpec(ctx), 'leads')
      recordAudit(ctx, {
        action: 'exported',
        entity: 'lead',
        entityId: 'bulk',
        entityLabel: 'Leads export',
        newValue: { rows: rows.length },
      })
      return rows
    }),

  convertToCustomer: (id, input) => request((ctx) => convertToCustomer(ctx, id, input)),
  convertToDeal: (id, input) => request((ctx) => createDealRecord(ctx, { ...input, leadId: id })),
  recalculateScore: (id) =>
    request((ctx) => {
      const lead = requireLead(ctx, id, 'edit')
      return saveWithRescore(ctx, lead, lead)
    }),
  saveQualification: (id, input) => request((ctx) => saveQualification(ctx, id, input)),

  listActivities: (id, params) => request((ctx) => listActivities(ctx, id, params)),
  listPinnedNotes: (id) => request((ctx) => listPinnedNotes(ctx, id)),
  updateNote: (id, activityId, input) => request((ctx) => updateNote(ctx, id, activityId, input)),
  deleteNote: (id, activityId) => request((ctx) => deleteNote(ctx, id, activityId)),
  setNotePinned: (id, activityId, pinned) =>
    request((ctx) => setNotePinned(ctx, id, activityId, pinned)),
  getRelations: (id) => request((ctx) => getRelations(ctx, id)),
  addActivity: (id, input) =>
    request((ctx) => {
      const lead = requireLead(ctx, id, 'edit')
      if (input.type === 'note' && !input.data.text.trim()) {
        throw validationError('text', 'Write something first.')
      }
      const activity = recordActivity(ctx, id, input)
      if (CONTACT_TYPES.has(input.type)) {
        ctx.db.save('leads', {
          ...lead,
          lastContactedAt: ctx.timestamp,
          firstResponseTimeMins:
            lead.firstResponseTimeMins ??
            Math.max(1, Math.round((ctx.now.getTime() - Date.parse(lead.createdAt)) / 60_000)),
          updatedAt: ctx.timestamp,
        })
      }
      return activity
    }),
}
