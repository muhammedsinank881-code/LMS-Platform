import { ApiError } from '@/services/api/errors'
import type { PipelinesApiClient } from '@/services/api/pipelines'
import type { Pipeline, PipelineStage, PipelineWithStages } from '@/types'
import { keepsWonAndLost } from '@/lib/settings/terminal'
import { requireText } from '../core/config-crud'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { requireColor } from './config'

const stagesOf = (ctx: RequestContext, pipelineId: string): PipelineStage[] =>
  ctx.db
    .all('stages')
    .filter((s) => s.pipelineId === pipelineId)
    .sort((a, b) => a.order - b.order)

const withStages = (ctx: RequestContext, pipeline: Pipeline): PipelineWithStages => ({
  ...pipeline,
  stages: stagesOf(ctx, pipeline.id).map((stage) => ({
    ...stage,
    usageCount:
      ctx.db.all('deals').filter((deal) => deal.stageId === stage.id).length +
      ctx.db.all('leads').filter((lead) => lead.stageId === stage.id && !lead.archivedAt).length,
  })),
})

/** Renumbers a pipeline's stages 1..n so orders never collide or leave gaps. */
function compact(ctx: RequestContext, pipelineId: string): void {
  stagesOf(ctx, pipelineId).forEach((stage, index) => {
    if (stage.order !== index + 1) ctx.db.save('stages', { ...stage, order: index + 1 })
  })
}

function checkProbability(value: number | undefined): void {
  if (value !== undefined && !(value >= 0 && value <= 100)) {
    throw validationError('probability', 'Probability must be between 0 and 100.')
  }
}

function audit(ctx: RequestContext, id: string, label: string): void {
  recordAudit(ctx, {
    action: 'settings_changed',
    entity: 'setting',
    entityId: id,
    entityLabel: label,
  })
}

export const mockPipelinesApi: PipelinesApiClient = {
  // Anyone in the workspace can read the pipeline: boards and pickers need it.
  listAll: () =>
    request((ctx) =>
      ctx.db
        .all('pipelines')
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
        .map((p) => withStages(ctx, p)),
    ),
  get: (id) => request((ctx) => withStages(ctx, ctx.db.get('pipelines', id, 'Pipeline'))),
  create: (input) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const isDefault = input.isDefault || ctx.db.all('pipelines').length === 0
      if (isDefault) {
        for (const p of ctx.db.all('pipelines'))
          ctx.db.save('pipelines', { ...p, isDefault: false })
      }
      const pipeline = ctx.db.insert('pipelines', {
        id: newId('pipeline'),
        name: requireText(input.name, 'name', 'Name'),
        isDefault,
        createdAt: ctx.timestamp,
      })
      audit(ctx, pipeline.id, `Pipeline: ${pipeline.name}`)
      return withStages(ctx, pipeline)
    }),
  update: (id, patch) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const pipeline = ctx.db.get('pipelines', id, 'Pipeline')
      if (patch.isDefault) {
        for (const p of ctx.db.all('pipelines')) {
          if (p.id !== id) ctx.db.save('pipelines', { ...p, isDefault: false })
        }
      } else if (patch.isDefault === false && pipeline.isDefault) {
        throw new ApiError('CONFLICT', 'Make another pipeline the default first.')
      }
      const saved = ctx.db.save('pipelines', {
        ...pipeline,
        ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
        ...(patch.isDefault !== undefined && { isDefault: patch.isDefault }),
      })
      audit(ctx, id, `Pipeline: ${saved.name}`)
      return withStages(ctx, saved)
    }),
  delete: (id, options) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const pipeline = ctx.db.get('pipelines', id, 'Pipeline')
      if (pipeline.isDefault) throw new ApiError('CONFLICT', 'The default pipeline cannot be deleted.')
      const deals = ctx.db.all('deals').filter((deal) => deal.pipelineId === id)
      if (deals.length > 0) {
        const stage = options?.replacementId ? ctx.db.find('stages', options.replacementId) : undefined
        if (!stage || stage.pipelineId === id) {
          throw new ApiError('CONFLICT', `${deals.length} deals are still in "${pipeline.name}". Choose a stage in another pipeline.`)
        }
        for (const deal of deals) {
          ctx.db.save('deals', { ...deal, pipelineId: stage.pipelineId, stageId: stage.id })
        }
      }
      for (const stage of stagesOf(ctx, id)) ctx.db.remove('stages', stage.id)
      ctx.db.remove('pipelines', id)
      audit(ctx, id, `Pipeline: ${pipeline.name}`)
    }),

  createStage: (input) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      ctx.db.get('pipelines', input.pipelineId, 'Pipeline')
      checkProbability(input.probability)
      const count = stagesOf(ctx, input.pipelineId).length
      const stage = ctx.db.insert('stages', {
        id: newId('stage'),
        pipelineId: input.pipelineId,
        name: requireText(input.name, 'name', 'Name'),
        color: requireColor(input.color),
        // Fractional position slots the stage in; `compact` then renumbers.
        order: Math.min(input.order ?? count + 1, count + 1) - 0.5,
        probability: input.probability,
        type: input.type,
      })
      compact(ctx, input.pipelineId)
      audit(ctx, stage.id, `Pipeline stage: ${stage.name}`)
      return ctx.db.get('stages', stage.id)
    }),
  updateStage: (id, patch) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const stage = ctx.db.get('stages', id, 'Stage')
      checkProbability(patch.probability)
      if (patch.type && !keepsWonAndLost(stagesOf(ctx, stage.pipelineId), undefined, { id, type: patch.type })) {
        throw new ApiError('CONFLICT', 'Keep at least one won stage and one lost stage.')
      }
      const saved = ctx.db.save('stages', {
        ...stage,
        ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
        ...(patch.color !== undefined && { color: requireColor(patch.color) }),
        ...(patch.probability !== undefined && { probability: patch.probability }),
        ...(patch.type !== undefined && { type: patch.type }),
        // Moving later lands just after the target slot, moving earlier just before it.
        ...(patch.order !== undefined && {
          order: patch.order + (patch.order > stage.order ? 0.5 : -0.5),
        }),
      })
      compact(ctx, stage.pipelineId)
      audit(ctx, id, `Pipeline stage: ${saved.name}`)
      return ctx.db.get('stages', id)
    }),
  deleteStage: (id, options) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const stage = ctx.db.get('stages', id, 'Stage')
      const siblings = stagesOf(ctx, stage.pipelineId)
      if (!keepsWonAndLost(siblings, stage.id)) {
        throw new ApiError('CONFLICT', 'Keep at least one won stage and one lost stage.')
      }
      const deals = ctx.db.all('deals').filter((deal) => deal.stageId === id)
      if (deals.length > 0) {
        const next = options?.replacementId ? ctx.db.find('stages', options.replacementId) : undefined
        if (!next || next.id === id) {
          throw new ApiError('CONFLICT', `${deals.length} deals are still in "${stage.name}". Choose a replacement stage.`)
        }
        for (const deal of deals) {
          ctx.db.save('deals', { ...deal, stageId: next.id, pipelineId: next.pipelineId })
        }
      }
      ctx.db.remove('stages', id)
      compact(ctx, stage.pipelineId)
      audit(ctx, id, `Pipeline stage: ${stage.name}`)
    }),
  reorderStages: (pipelineId, orderedIds) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const pipeline = ctx.db.get('pipelines', pipelineId, 'Pipeline')
      const stages = stagesOf(ctx, pipelineId)
      const same =
        orderedIds.length === stages.length &&
        new Set(orderedIds).size === stages.length &&
        stages.every((s) => orderedIds.includes(s.id))
      if (!same) throw validationError('orderedIds', 'List every stage exactly once.')
      orderedIds.forEach((stageId, index) =>
        ctx.db.save('stages', { ...ctx.db.get('stages', stageId), order: index + 1 }),
      )
      audit(ctx, pipelineId, `Pipeline: ${pipeline.name}`)
      return withStages(ctx, pipeline)
    }),
}
