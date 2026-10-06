import { summarizeBoard } from '@/lib/pipeline'
import type { MoveLeadStageInput } from '@/services/api/leads'
import type { Lead, LeadId, LeadListParams } from '@/types'
import type { RequestContext } from '../../core/context'
import { filterRows } from '../../core/list-engine'
import { recordActivity, recordAudit } from '../../core/records'
import { validationError } from '../../core/validate'
import { nextColumnPosition, positionsAfterMove } from '../column-position'
import { leadListSpec, requireLead } from './access'
import { applyStatusChange } from './changes'

function defaultPlacement(ctx: RequestContext, pipelineId?: string, stageId?: string) {
  const pipelines = ctx.db.all('pipelines')
  const pipeline = pipelines.find((item) => item.id === pipelineId) ?? pipelines.find((item) => item.isDefault) ?? pipelines[0]
  if (!pipeline) throw validationError('pipelineId', 'No pipeline is configured.')
  const stages = ctx.db.all('stages').filter((stage) => stage.pipelineId === pipeline.id)
  const requested = stages.find((stage) => stage.id === stageId)
  const stage =
    requested ??
    stages.filter((item) => item.type === 'open').sort((a, b) => a.order - b.order)[0] ??
    stages[0]
  if (!stage) throw validationError('stageId', 'This pipeline has no stages.')
  return stage
}

/** Puts a new lead on the default (or requested) pipeline stage. */
export function placeNewLead(ctx: RequestContext, lead: Lead, pipelineId?: string, stageId?: string): Lead {
  const stage = defaultPlacement(ctx, pipelineId, stageId)
  return {
    ...lead,
    pipelineId: stage.pipelineId,
    stageId: stage.id,
    position: nextColumnPosition(ctx.db.all('leads'), stage.id),
    stageEnteredAt: ctx.timestamp,
  }
}

function applyLeadPositions(ctx: RequestContext, stageId: string, movedId: string, requested: number): number {
  const updates = positionsAfterMove(ctx.db.all('leads'), stageId, movedId, requested)
  let position = requested
  for (const update of updates) {
    if (update.id === movedId) {
      position = update.position
      continue
    }
    const row = ctx.db.get('leads', update.id, 'Lead')
    ctx.db.save('leads', { ...row, position: update.position })
  }
  return position
}

function statusForStage(ctx: RequestContext, type: 'won' | 'lost' | 'invalid') {
  return ctx.db.all('leadStatuses').find((status) => status.type === type)
}

export function moveLeadStage(ctx: RequestContext, id: LeadId, input: MoveLeadStageInput): Lead {
  let lead = requireLead(ctx, id, 'edit')
  const stage = ctx.db.find('stages', input.stageId)
  if (!stage || stage.pipelineId !== lead.pipelineId) {
    throw validationError('stageId', 'Select a stage from the same pipeline.')
  }
  const from = ctx.db.get('stages', lead.stageId, 'Stage')
  const requested =
    input.position ?? (stage.id === lead.stageId ? lead.position : nextColumnPosition(ctx.db.all('leads'), stage.id))
  const position = applyLeadPositions(ctx, stage.id, lead.id, requested)
  if (stage.id === lead.stageId) {
    return ctx.db.save('leads', { ...lead, position, updatedAt: ctx.timestamp })
  }

  if (stage.type === 'lost' || stage.type === 'invalid') {
    const status = statusForStage(ctx, stage.type)
    if (!status) throw validationError('stageId', 'No matching lead status is configured.')
    lead = applyStatusChange(ctx, lead, { statusId: status.id, lostReasonId: input.lostReasonId, note: input.note })
  } else if (stage.type === 'won') {
    const current = ctx.db.find('leadStatuses', lead.statusId)
    const status = statusForStage(ctx, 'won')
    if (status && current?.type !== 'won') lead = applyStatusChange(ctx, lead, { statusId: status.id })
  }

  const saved = ctx.db.save('leads', {
    ...lead,
    stageId: stage.id,
    position,
    stageEnteredAt: ctx.timestamp,
    updatedAt: ctx.timestamp,
  })
  recordActivity(ctx, saved.id, {
    type: 'stage_changed',
    data: { fromStageId: from.id, toStageId: stage.id, lostReasonId: saved.lostReasonId ?? null },
  })
  recordAudit(ctx, {
    action: 'stage_moved',
    entity: 'lead',
    entityId: saved.id,
    entityLabel: saved.name,
    previousValue: { stage: from.name },
    newValue: { stage: stage.name },
  })
  return saved
}

export function leadStageSummary(ctx: RequestContext, params: LeadListParams | undefined, visible: (ctx: RequestContext) => Lead[]) {
  const leads = filterRows(visible(ctx), params, leadListSpec(ctx), 'leads')
  const stages = [...ctx.db.all('stages')].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  return summarizeBoard(
    leads.map((lead) => ({
      stageId: lead.stageId,
      value: lead.budget ?? 0,
      probability: stages.find((stage) => stage.id === lead.stageId)?.probability ?? 0,
    })),
    stages,
  )
}
