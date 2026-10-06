import { useEffect, useMemo } from 'react'
import type { DirectoryUser } from '@/services/api/team'
import type { FilterCondition, Lead, LeadSource, PipelineStage, StageSummary } from '@/types'
import type { Deal } from '@/types'
import { dealCard, leadCard, type BoardCardModel, type BoardKind } from '../lib/board-model'
import { useStageColumn } from '../hooks/use-stage-column'
import { StageColumn } from './StageColumn'

export function ColumnHost({
  stage,
  stages,
  board,
  pipelineId,
  search,
  filters,
  summary,
  canEdit,
  mobile,
  adding,
  sources,
  users,
  leadsById,
  ownerName,
  sourceIcon,
  now,
  onCards,
  onToggleAdd,
  onOpen,
  onFollowUp,
  onAssign,
  onMove,
}: {
  stage: PipelineStage
  stages: PipelineStage[]
  board: BoardKind
  pipelineId: string
  search: string
  filters: FilterCondition<string>[]
  summary?: StageSummary
  canEdit: boolean
  mobile: boolean
  adding: boolean
  sources: LeadSource[]
  users: DirectoryUser[]
  leadsById: Map<string, Lead>
  ownerName: (id: string | null) => string
  sourceIcon: (id: string) => string
  now: Date
  onCards: (stageId: string, cards: BoardCardModel[]) => void
  onToggleAdd: () => void
  onOpen: (card: BoardCardModel) => void
  onFollowUp: (card: BoardCardModel) => void
  onAssign: (card: BoardCardModel) => void
  onMove: (card: BoardCardModel, stageId: string) => void
}) {
  const query = useStageColumn(board, pipelineId, stage.id, search, filters)
  const cards = useMemo(() => {
    const pages = query.data?.pages ?? []
    if (board === 'leads') {
      return pages.flatMap((page) => (page.items as Lead[]).map(leadCard))
    }
    return pages.flatMap((page) => (page.items as Deal[]).map((deal) => dealCard(deal, leadsById.get(deal.leadId))))
  }, [board, leadsById, query.data])

  useEffect(() => {
    onCards(stage.id, cards)
  }, [cards, onCards, stage.id])

  return (
    <StageColumn
      stage={stage}
      stages={stages}
      board={board}
      pipelineId={pipelineId}
      cards={cards}
      summary={summary}
      loading={query.isLoading}
      error={query.isError}
      hasMore={Boolean(query.hasNextPage)}
      loadingMore={query.isFetchingNextPage}
      canEdit={canEdit}
      mobile={mobile}
      adding={adding}
      sources={sources}
      users={users}
      ownerName={ownerName}
      sourceIcon={sourceIcon}
      now={now}
      onRetry={() => void query.refetch()}
      onLoadMore={() => void query.fetchNextPage()}
      onToggleAdd={onToggleAdd}
      onOpen={onOpen}
      onFollowUp={onFollowUp}
      onAssign={onAssign}
      onMove={onMove}
    />
  )
}
