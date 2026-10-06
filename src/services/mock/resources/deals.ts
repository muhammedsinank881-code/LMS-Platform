import { computeExpectedRevenue, summarizeBoard } from '@/lib/pipeline'
import type { DealsApiClient } from '@/services/api/deals'
import {
  createDealSchema,
  toDealId,
  updateDealSchema,
  type Activity,
  type Deal,
  type DealFilterField,
  type DealId,
  type LeadId,
  type ManualActivityInput,
} from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, filterRows, paginate, propertyValue, type ListSpec } from '../core/list-engine'
import { diffValues, notify, recordActivity, recordAudit } from '../core/records'
import { parseInput, validationError } from '../core/validate'
import { nextColumnPosition } from './column-position'
import { moveDealStage as moveDealStageRecord, reopenDeal } from './deal-stage'

const DEAL_FIELDS: readonly DealFilterField[] = [
  'leadId',
  'ownerId',
  'pipelineId',
  'stageId',
  'product',
  'value',
  'probability',
  'expectedCloseDate',
  'createdAt',
  'sourceId',
  'priority',
  'score',
  'scoreCategory',
  'tags',
  'position',
  'stageType',
]

function dealSpec(ctx: RequestContext): ListSpec<Deal, DealFilterField> {
  return {
    fields: DEAL_FIELDS,
    value(deal, field) {
      // Lead-derived fields let a pipeline be filtered by where the deal came from.
      if (field === 'stageType') return ctx.db.find('stages', deal.stageId)?.type ?? null
      if (field === 'sourceId' || field === 'priority' || field === 'score' || field === 'scoreCategory' || field === 'tags') {
        return ctx.db.find('leads', deal.leadId)?.[field] ?? null
      }
      return propertyValue(deal, field)
    },
    searchable(deal) {
      const lead = ctx.db.find('leads', deal.leadId)
      return [deal.id, deal.title, deal.product, lead?.name, lead?.company]
    },
    defaultSort: [{ field: 'createdAt', direction: 'desc' }],
    now: ctx.now,
  }
}

const inScope = (ctx: RequestContext, deal: Deal) => ctx.inScope('deals', deal.ownerId)

function visibleDeals(ctx: RequestContext): Deal[] {
  ctx.require('deals', 'view')
  return ctx.db.all('deals').filter((deal) => inScope(ctx, deal))
}

function requireDeal(ctx: RequestContext, id: string, action: 'view' | 'edit' | 'delete'): Deal {
  ctx.require('deals', action)
  const deal = ctx.db.get('deals', id, 'Deal')
  ctx.assertInScope('deals', deal.ownerId)
  return deal
}
export function createDealRecord(ctx: RequestContext, raw: unknown): Deal {
  ctx.require('deals', 'create')
  const input = parseInput(createDealSchema, raw)
  const lead = ctx.db.get('leads', input.leadId, 'Lead')
  ctx.assertInScope('leads', lead.assignedTo, lead.createdBy)

  const stage = ctx.db.find('stages', input.stageId)
  if (!stage || stage.pipelineId !== input.pipelineId) {
    throw validationError('stageId', 'Select a stage from this pipeline.')
  }
  if (stage.type !== 'open') {
    throw validationError('stageId', 'Create the deal in an open stage, then move it.')
  }
  const ownerId = input.ownerId ?? lead.assignedTo ?? ctx.actor.id
  if (!ctx.db.find('users', ownerId)) throw validationError('ownerId', 'Select a valid owner.')

  const probability = input.probability ?? stage.probability
  const deal = ctx.db.insert('deals', {
    id: toDealId(ctx.db.nextNumber('deal')),
    title: input.title,
    leadId: lead.id,
    customerId: lead.convertedToCustomerId ?? null,
    value: input.value,
    expectedCloseDate: input.expectedCloseDate,
    probability,
    product: input.product,
    ownerId,
    pipelineId: input.pipelineId,
    stageId: stage.id,
    position: nextColumnPosition(ctx.db.all('deals'), stage.id),
    stageEnteredAt: ctx.timestamp,
    expectedRevenue: computeExpectedRevenue(input.value, probability),
    lostReasonId: null,
    lostCompetitor: null,
    lostNote: null,
    customFields: input.customFields ?? {},
    closedAt: null,
    createdAt: ctx.timestamp,
    updatedAt: ctx.timestamp,
  })
  recordAudit(ctx, {
    action: 'created',
    entity: 'deal',
    entityId: deal.id,
    entityLabel: deal.title,
    newValue: { value: deal.value, stage: stage.name },
  })
  notify(ctx, ownerId, {
    type: 'lead_assigned',
    title: 'New deal assigned',
    body: deal.title,
    link: `/deals/${deal.id}`,
  })
  return deal
}

function moveDealStage(ctx: RequestContext, id: DealId, input: Parameters<DealsApiClient['moveStage']>[1]): Deal {
  return moveDealStageRecord(ctx, id, input, (context, dealId) => requireDeal(context, dealId, 'edit'))
}

function listDealActivities(
  ctx: RequestContext,
  id: DealId,
  params: { types?: Activity['type'][]; page?: number; pageSize?: number } = {},
) {
  const deal = requireDeal(ctx, id, 'view')
  const types = params.types?.length ? new Set<string>(params.types) : null
  const rows = ctx.db
    .all('activities')
    .filter((activity) => activity.dealId === deal.id && (!types || types.has(activity.type)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return paginate(rows, params.page, params.pageSize ?? 50)
}

export const mockDealsApi: DealsApiClient = {
  list: (params) =>
    request((ctx) => applyListParams(visibleDeals(ctx), params, dealSpec(ctx), 'deals')),
  get: (id) => request((ctx) => requireDeal(ctx, id, 'view')),
  create: (input) => request((ctx) => createDealRecord(ctx, input)),
  createFromLead: (leadId: LeadId, input) =>
    request((ctx) => createDealRecord(ctx, { ...input, leadId })),
  update: (id, patch) =>
    request((ctx) => {
      const deal = requireDeal(ctx, id, 'edit')
      const input = parseInput(updateDealSchema, patch)
      if (input.pipelineId && input.pipelineId !== deal.pipelineId) {
        throw validationError('pipelineId', 'A deal cannot move to another pipeline.')
      }
      if (input.ownerId && !ctx.db.find('users', input.ownerId)) {
        throw validationError('ownerId', 'Select a valid owner.')
      }
      const changes = { ...input }
      delete changes.pipelineId
      const value = changes.value ?? deal.value
      const probability = changes.probability ?? deal.probability
      const saved = ctx.db.save('deals', {
        ...deal,
        ...changes,
        expectedRevenue: computeExpectedRevenue(value, probability),
        updatedAt: ctx.timestamp,
      })
      const diff = diffValues(deal, saved, [
        'title',
        'value',
        'probability',
        'ownerId',
        'expectedCloseDate',
      ])
      if (diff) {
        recordAudit(ctx, {
          action: 'updated',
          entity: 'deal',
          entityId: id,
          entityLabel: saved.title,
          ...diff,
        })
      }
      return saved
    }),
  delete: (id) =>
    request((ctx) => {
      const deal = requireDeal(ctx, id, 'delete')
      ctx.db.remove('deals', id)
      recordAudit(ctx, {
        action: 'deleted',
        entity: 'deal',
        entityId: id,
        entityLabel: deal.title,
        previousValue: { value: deal.value },
      })
    }),
  moveStage: (id, input) => request((ctx) => moveDealStage(ctx, id, input)),
  reopen: (id, input) =>
    request((ctx) => reopenDeal(ctx, id, input, (context, dealId) => requireDeal(context, dealId, 'edit'))),
  bulkMoveStage: (input) =>
    request((ctx) => {
      const { ids, ...move } = input
      return ids.map((id) => moveDealStage(ctx, id, move))
    }),
  bulkAssign: (ids, ownerId) =>
    request((ctx) => {
      ctx.require('deals', 'assign')
      if (!ctx.db.find('users', ownerId)) throw validationError('ownerId', 'Select a valid owner.')
      return ids.map((id) => {
        const deal = requireDeal(ctx, id, 'edit')
        const saved = ctx.db.save('deals', { ...deal, ownerId, updatedAt: ctx.timestamp })
        recordAudit(ctx, {
          action: 'assigned',
          entity: 'deal',
          entityId: id,
          entityLabel: saved.title,
          previousValue: { ownerId: deal.ownerId },
          newValue: { ownerId },
        })
        return saved
      })
    }),
  bulkDelete: (ids) =>
    request((ctx) => {
      ids.forEach((id) => {
        const deal = requireDeal(ctx, id, 'delete')
        ctx.db.remove('deals', id)
        recordAudit(ctx, {
          action: 'deleted',
          entity: 'deal',
          entityId: id,
          entityLabel: deal.title,
          previousValue: { value: deal.value },
        })
      })
    }),
  exportRows: (params) =>
    request((ctx) => {
      ctx.require('deals', 'export')
      return filterRows(visibleDeals(ctx), params, dealSpec(ctx), 'deals')
    }),
  listActivities: (id, params) => request((ctx) => listDealActivities(ctx, id, params ?? {})),
  addActivity: (id, input: ManualActivityInput) =>
    request((ctx) => {
      const deal = requireDeal(ctx, id, 'edit')
      if (input.type === 'note' && !input.data.text.trim()) throw validationError('text', 'Write something first.')
      return recordActivity(ctx, deal.leadId, input, { dealId: deal.id })
    }),
  getSummary: (params) =>
    request((ctx) => {
      const deals = filterRows(visibleDeals(ctx), params, dealSpec(ctx), 'deals')
      const stages = [...ctx.db.all('stages')].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      return summarizeBoard(
        deals.map((deal) => ({ stageId: deal.stageId, value: deal.value, probability: deal.probability })),
        stages,
      )
    }),
}
