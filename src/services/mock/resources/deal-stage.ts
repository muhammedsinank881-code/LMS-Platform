import { computeExpectedRevenue } from '@/lib/pipeline'
import type { MoveDealStageInput, ReopenDealInput } from '@/types'
import type { CustomerId, Deal, DealId } from '@/types'
import type { RequestContext } from '../core/context'
import { recordActivity, recordAudit, notify } from '../core/records'
import { validationError } from '../core/validate'
import { emit } from '../automation/event-bus'
import { nextColumnPosition, positionsAfterMove } from './column-position'
import { createCustomerFromLead } from './leads/convert'
import { applyStatusChange } from './leads/changes'

function requireStage(ctx: RequestContext, stageId: string, pipelineId: string) {
  const stage = ctx.db.find('stages', stageId)
  if (!stage || stage.pipelineId !== pipelineId) {
    throw validationError('stageId', 'Select a stage from the same pipeline.')
  }
  return stage
}

function applyPositions(ctx: RequestContext, stageId: string, movedId: string, requested: number): number {
  const updates = positionsAfterMove(ctx.db.all('deals'), stageId, movedId, requested)
  let position = requested
  for (const update of updates) {
    if (update.id === movedId) {
      position = update.position
      continue
    }
    const row = ctx.db.get('deals', update.id, 'Deal')
    ctx.db.save('deals', { ...row, position: update.position })
  }
  return position
}

function closeLeadAsWon(ctx: RequestContext, leadId: string): CustomerId | null {
  const lead = ctx.db.find('leads', leadId)
  if (!lead) return null
  let customerId = lead.convertedToCustomerId ?? null
  if (!customerId) {
    customerId = createCustomerFromLead(ctx, lead.id).customer.id
  }
  const current = ctx.db.find('leadStatuses', ctx.db.get('leads', lead.id, 'Lead').statusId)
  if (current?.type !== 'won') {
    const won = ctx.db.all('leadStatuses').find((status) => status.type === 'won')
    if (won) applyStatusChange(ctx, ctx.db.get('leads', lead.id, 'Lead'), { statusId: won.id })
  }
  return customerId
}

/** Moves a deal between stages. Same-stage calls only update `position`. */
export function moveDealStage(ctx: RequestContext, id: DealId, input: MoveDealStageInput, requireDeal: (ctx: RequestContext, id: string) => Deal): Deal {
  const deal = requireDeal(ctx, id)
  const stage = requireStage(ctx, input.stageId, deal.pipelineId)
  const from = ctx.db.get('stages', deal.stageId, 'Stage')
  const requested = input.position ?? (stage.id === deal.stageId ? deal.position : nextColumnPosition(ctx.db.all('deals'), stage.id))
  const position = applyPositions(ctx, stage.id, deal.id, requested)

  if (stage.id === deal.stageId) {
    return ctx.db.save('deals', { ...deal, position, updatedAt: ctx.timestamp })
  }
  if (stage.type === 'lost') {
    if (!input.lostReasonId) throw validationError('lostReasonId', 'Choose a reason for losing this deal.')
    if (!ctx.db.find('lostReasons', input.lostReasonId)) {
      throw validationError('lostReasonId', 'Select a valid lost reason.')
    }
  }

  const closed = stage.type === 'won' || stage.type === 'lost'
  const value = stage.type === 'won' && input.finalValue !== undefined ? input.finalValue : deal.value
  const probability = stage.probability
  const customerId = stage.type === 'won' ? (closeLeadAsWon(ctx, deal.leadId) ?? deal.customerId) : deal.customerId
  const saved = ctx.db.save('deals', {
    ...deal,
    stageId: stage.id,
    position,
    stageEnteredAt: ctx.timestamp,
    value,
    probability,
    expectedRevenue: computeExpectedRevenue(value, probability),
    lostReasonId: stage.type === 'lost' ? (input.lostReasonId ?? null) : null,
    lostCompetitor: stage.type === 'lost' ? (input.lostCompetitor?.trim() || null) : null,
    lostNote: stage.type === 'lost' ? (input.lostNote?.trim() || null) : null,
    closedAt: closed ? (input.closedAt ?? ctx.timestamp) : null,
    customerId,
    updatedAt: ctx.timestamp,
  })
  recordActivity(
    ctx,
    saved.leadId,
    {
      type: 'stage_changed',
      data: { fromStageId: from.id, toStageId: stage.id, lostReasonId: saved.lostReasonId ?? null },
    },
    { dealId: saved.id },
  )
  if (stage.type === 'lost' && input.lostNote?.trim()) {
    recordActivity(ctx, saved.leadId, { type: 'note', data: { text: input.lostNote.trim() } }, { dealId: saved.id })
  }
  recordAudit(ctx, {
    action: 'stage_moved',
    entity: 'deal',
    entityId: saved.id,
    entityLabel: saved.title,
    previousValue: { stage: from.name },
    newValue: {
      stage: stage.name,
      ...(stage.type === 'won' ? { value: saved.value, closedAt: saved.closedAt } : {}),
      ...(input.lostCompetitor ? { competitor: input.lostCompetitor } : {}),
    },
  })
  const entity = { kind: 'deal' as const, id: saved.id }
  emit(ctx, {
    type: 'deal_stage_changed',
    entity,
    data: { fromStageId: from.id, toStageId: stage.id, pipelineId: saved.pipelineId },
  })
  if (stage.type === 'won') emit(ctx, { type: 'deal_won', entity })
  if (stage.type === 'lost') emit(ctx, { type: 'deal_lost', entity })
  if (stage.type === 'won' || stage.type === 'lost') {
    notify(
      ctx,
      saved.ownerId,
      {
        type: stage.type === 'won' ? 'deal_won' : 'deal_lost',
        title: stage.type === 'won' ? 'Deal won' : 'Deal lost',
        body: saved.title,
        link: `/deals/${saved.id}`,
      },
      { includeActor: true },
    )
  }
  return saved
}

export function reopenDeal(ctx: RequestContext, id: DealId, input: ReopenDealInput, requireDeal: (ctx: RequestContext, id: string) => Deal): Deal {
  const deal = requireDeal(ctx, id)
  const current = ctx.db.get('stages', deal.stageId, 'Stage')
  if (current.type === 'open') throw validationError('stageId', 'This deal is already open.')
  const stage = requireStage(ctx, input.stageId, deal.pipelineId)
  if (stage.type !== 'open') throw validationError('stageId', 'Reopen into an open stage.')
  const position = nextColumnPosition(ctx.db.all('deals'), stage.id)
  const saved = ctx.db.save('deals', {
    ...deal,
    stageId: stage.id,
    position,
    stageEnteredAt: ctx.timestamp,
    probability: stage.probability,
    expectedRevenue: computeExpectedRevenue(deal.value, stage.probability),
    lostReasonId: null,
    lostCompetitor: null,
    lostNote: null,
    closedAt: null,
    updatedAt: ctx.timestamp,
  })
  recordActivity(
    ctx,
    saved.leadId,
    { type: 'stage_changed', data: { fromStageId: current.id, toStageId: stage.id, lostReasonId: null } },
    { dealId: saved.id },
  )
  recordAudit(ctx, {
    action: 'stage_moved',
    entity: 'deal',
    entityId: saved.id,
    entityLabel: saved.title,
    previousValue: { stage: current.name },
    newValue: { stage: stage.name, reopened: true },
  })
  return saved
}
