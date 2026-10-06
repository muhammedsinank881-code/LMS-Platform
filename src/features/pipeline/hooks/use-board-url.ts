import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useListUrlState } from '@/hooks/use-list-url-state'
import type { BoardKind } from '../lib/board-model'

export type BoardFilter = 'ownerId' | 'sourceId' | 'priority' | 'scoreCategory' | 'tags' | 'value'

export function useBoardUrl() {
  const [params, setParams] = useSearchParams()
  const list = useListUrlState<BoardFilter>({ pageSize: 20, sort: [{ field: 'ownerId', direction: 'asc' }] })
  const board: BoardKind = params.get('board') === 'deals' ? 'deals' : 'leads'
  const pipelineId = params.get('pipeline')

  const setBoard = useCallback(
    (next: BoardKind) => {
      const copy = new URLSearchParams(params)
      if (next === 'leads') copy.delete('board')
      else copy.set('board', next)
      setParams(copy, { replace: true })
    },
    [params, setParams],
  )

  const setPipelineId = useCallback(
    (id: string) => {
      const copy = new URLSearchParams(params)
      copy.set('pipeline', id)
      setParams(copy, { replace: true })
    },
    [params, setParams],
  )

  return { ...list, board, pipelineId, setBoard, setPipelineId }
}
