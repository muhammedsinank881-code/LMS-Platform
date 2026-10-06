import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { rollbackOptimistic, type CacheSnapshot } from '@/lib/optimistic'
import { api } from '@/services'
import { isDealId, isLeadId, type MoveDealStageInput } from '@/types'
import type { MoveLeadStageInput } from '@/services/api/leads'
import { moveColumnCard } from '../lib/column-cache'
import type { BoardCardModel, BoardKind } from '../lib/board-model'
import { columnParams } from './use-stage-column'
import type { FilterCondition } from '@/types'

export interface BoardMove {
  card: BoardCardModel
  toStageId: string
  position: number
  fromStageId: string
  lostReasonId?: string
  note?: string
  lostCompetitor?: string
  closedAt?: string
  finalValue?: number
}

export function useBoardMove(board: BoardKind, pipelineId: string, search: string, filters: FilterCondition<string>[]) {
  const client = useQueryClient()
  const { keys } = useWorkspace()
  const invalidate = useInvalidate()

  const keyFor = (stageId: string) =>
    keys.pipelineBoard.column(board, pipelineId, stageId, columnParams(board, pipelineId, stageId, search, filters))

  const preview = (card: BoardCardModel, toStageId: string, position: number): CacheSnapshot => {
    const entity = card.lead ?? card.deal
    if (!entity) return []
    return moveColumnCard(
      client,
      keyFor(card.stageId),
      keyFor(toStageId),
      { ...entity, stageId: toStageId, position },
      position,
    )
  }

  const mutation = useMutation({
    mutationFn: async (input: BoardMove & { snapshot: CacheSnapshot }) => {
      if (input.card.kind === 'lead') {
        const body: MoveLeadStageInput = {
          stageId: input.toStageId,
          position: input.position,
          lostReasonId: input.lostReasonId,
          note: input.note,
        }
        if (!isLeadId(input.card.leadId)) return Promise.reject(new Error('Invalid lead'))
        return api.leads.moveStage(input.card.leadId, body)
      }
      const body: MoveDealStageInput = {
        stageId: input.toStageId,
        position: input.position,
        lostReasonId: input.lostReasonId,
        lostNote: input.note,
        lostCompetitor: input.lostCompetitor,
        closedAt: input.closedAt,
        finalValue: input.finalValue,
      }
      const dealId = input.card.dealId ?? input.card.id
      if (!isDealId(dealId)) return Promise.reject(new Error('Invalid deal'))
      return api.deals.moveStage(dealId, body)
    },
    onError: (_error, variables) => rollbackOptimistic(client, variables.snapshot),
    onSettled: () => invalidate('pipelineBoard', 'leads', 'deals', 'customers', 'auditLogs'),
    meta: { errorTitle: 'Could not move card' },
  })

  return { preview, mutation, rollback: (snapshot: CacheSnapshot) => rollbackOptimistic(client, snapshot) }
}
