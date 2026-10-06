import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Plus } from 'lucide-react'
import { CurrencyText } from '@/components/common/CurrencyText'
import { RoleGate } from '@/components/common/RoleGate'
import { Button, EmptyState, Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { DirectoryUser } from '@/services/api/team'
import type { LeadSource, PipelineStage, StageSummary } from '@/types'
import { stageHeaderClass, type BoardCardModel, type BoardKind } from '../lib/board-model'
import { QuickAddForm } from './QuickAddForm'
import { SortableCard } from './SortableCard'

const VIRTUAL_AFTER = 50

export function StageColumn({
  stage,
  stages,
  board,
  pipelineId,
  cards,
  summary,
  loading,
  error,
  hasMore,
  loadingMore,
  canEdit,
  mobile,
  adding,
  sources,
  users,
  ownerName,
  sourceIcon,
  now,
  onRetry,
  onLoadMore,
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
  cards: BoardCardModel[]
  summary?: StageSummary
  loading: boolean
  error: boolean
  hasMore: boolean
  loadingMore: boolean
  canEdit: boolean
  mobile: boolean
  adding: boolean
  sources: LeadSource[]
  users: DirectoryUser[]
  ownerName: (id: string | null) => string
  sourceIcon: (id: string) => string
  now: Date
  onRetry: () => void
  onLoadMore: () => void
  onToggleAdd: () => void
  onOpen: (card: BoardCardModel) => void
  onFollowUp: (card: BoardCardModel) => void
  onAssign: (card: BoardCardModel) => void
  onMove: (card: BoardCardModel, stageId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${stage.id}`, data: { stageId: stage.id } })
  const scroller = useRef<HTMLDivElement>(null)
  const virtual = cards.length > VIRTUAL_AFTER
  const virtualizer = useVirtualizer({
    count: virtual ? cards.length : 0,
    getScrollElement: () => scroller.current,
    estimateSize: () => 128,
    overscan: 6,
  })
  const visible = virtual ? virtualizer.getVirtualItems() : []

  return (
    <section
      data-stage-id={stage.id}
      className={cn('flex w-72 shrink-0 snap-start flex-col rounded-lg border', stageHeaderClass(stage))}
      aria-label={stage.name}
    >
      <header className="space-y-1 border-b border-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-sm font-semibold">{stage.name}</h2>
          <span className="text-xs text-muted-foreground">{summary?.count ?? cards.length}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          <CurrencyText amount={summary?.total ?? 0} compact /> · weighted{' '}
          <CurrencyText amount={summary?.weighted ?? 0} compact />
        </p>
      </header>
      <div ref={scroller} className="max-h-[70dvh] min-h-40 flex-1 space-y-2 overflow-y-auto p-2">
        {loading ? <Skeleton className="h-24 w-full" /> : null}
        {error ? (
          <EmptyState size="sm" tone="destructive" title="Couldn't load this stage" action={<Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>} />
        ) : null}
        {!loading && !error ? (
          <SortableContext id={stage.id} items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} className={cn('space-y-2', isOver && 'rounded-md ring-2 ring-primary/40')} style={virtual ? { height: virtualizer.getTotalSize(), position: 'relative' } : undefined}>
              {cards.length === 0 ? <p className="px-2 py-6 text-center text-sm text-muted-foreground">Drop leads here</p> : null}
              {(virtual ? visible : cards.map((_, index) => ({ index, start: 0 }))).map((row) => {
                const card = cards[row.index]
                if (!card) return null
                return (
                  <div key={card.id} style={virtual ? { position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` } : undefined}>
                    <SortableCard
                      card={card}
                      stages={stages}
                      ownerName={ownerName(card.ownerId)}
                      sourceIcon={sourceIcon(card.sourceId)}
                      now={now}
                      canEdit={canEdit}
                      mobile={mobile}
                      onOpen={() => onOpen(card)}
                      onFollowUp={() => onFollowUp(card)}
                      onAssign={() => onAssign(card)}
                      onMove={(stageId) => onMove(card, stageId)}
                    />
                  </div>
                )
              })}
            </div>
          </SortableContext>
        ) : null}
        {hasMore ? (
          <Button type="button" variant="ghost" size="sm" className="w-full" loading={loadingMore} onClick={onLoadMore}>
            Load more
          </Button>
        ) : null}
        {adding ? (
          <QuickAddForm board={board} stage={stage} pipelineId={pipelineId} sources={sources} users={users} onDone={onToggleAdd} />
        ) : (
          <RoleGate resource={board === 'leads' ? 'leads' : 'deals'} action="create">
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={onToggleAdd}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </RoleGate>
        )}
      </div>
    </section>
  )
}
