import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { LiveStatus } from '@/components/common/LiveStatus'
import { EmptyState, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { useMediaQuery } from '@/hooks/use-media-query'
import { canMoveToStage, type MoveDialog } from '@/lib/pipeline'
import { useUiStore } from '@/store/ui-store'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { useAssignLead } from '@/features/leads/hooks/use-lead-mutations'
import { useUpdateDeal } from '@/features/deals/hooks/use-deals'
import type { CacheSnapshot } from '@/lib/optimistic'
import type { DirectoryUser } from '@/services/api/team'
import type { FilterCondition, LeadSource, LostReason, PipelineStage, PipelineWithStages } from '@/types'
import { isLeadId } from '@/types'
import { positionAt, type BoardCardModel, type BoardKind } from '../lib/board-model'
import { BoardDialogs } from './BoardDialogs'
import { useBoardMove } from '../hooks/use-board-move'
import { useBoardSummary } from '../hooks/use-stage-column'
import { BoardCardBody } from './BoardCardBody'
import { ColumnHost } from './ColumnHost'
import { StageTabStrip } from './StageTabStrip'
import { useActiveStage } from './use-active-stage'

interface PendingMove {
  card: BoardCardModel
  to: PipelineStage
  position: number
  dialog: MoveDialog
  snapshot: CacheSnapshot
}

export function PipelineBoard({
  board,
  pipeline,
  search,
  filters,
  sources,
  users,
  reasons,
  now,
}: {
  board: BoardKind
  pipeline: PipelineWithStages
  search: string
  filters: FilterCondition<string>[]
  sources: LeadSource[]
  users: DirectoryUser[]
  reasons: LostReason[]
  now: Date
}) {
  const navigate = useNavigate()
  const mobile = useMediaQuery('(max-width: 767px)')
  const { can } = usePermission()
  const canEdit = can(board === 'leads' ? 'leads' : 'deals', 'edit')
  const stages = useMemo(() => [...pipeline.stages].sort((a, b) => a.order - b.order), [pipeline.stages])
  const summary = useBoardSummary(board, pipeline.id, search, filters)
  const move = useBoardMove(board, pipeline.id, search, filters)
  const [active, setActive] = useState<BoardCardModel | null>(null)
  const [dragStatus, setDragStatus] = useState('')
  const [pending, setPending] = useState<PendingMove | null>(null)
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const leads = useLeads(board === 'deals' ? { pageSize: 200 } : { pageSize: 1 })
  const leadsById = useMemo(() => new Map((leads.data?.items ?? []).map((lead) => [lead.id, lead])), [leads.data])
  const columnsRef = useRef(new Map<string, BoardCardModel[]>())
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeStage, setActiveStage] = useActiveStage(scrollerRef, stages[0]?.id ?? '', stages.length > 0)
  const remember = useCallback((stageId: string, next: BoardCardModel[]) => {
    columnsRef.current.set(stageId, next)
  }, [])
  const [adding, setAdding] = useState<string | null>(null)
  const [assignCard, setAssignCard] = useState<BoardCardModel | null>(null)
  const [ownerId, setOwnerId] = useState('')
  const assignLead = useAssignLead()
  const updateDeal = useUpdateDeal()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const begin = (card: BoardCardModel, to: PipelineStage, position: number) => {
    const from = stages.find((stage) => stage.id === card.stageId) ?? null
    const decision = canMoveToStage({ kind: card.kind === 'lead' ? 'lead' : 'deal', pipelineId: card.pipelineId }, from, to)
    if (!decision.allowed) {
      toast.error(decision.reason ?? 'That move is not allowed')
      return
    }
    const snapshot = move.preview(card, to.id, position)
    if (decision.dialog === 'none') {
      move.mutation.mutate({ card, toStageId: to.id, fromStageId: card.stageId, position, snapshot })
      return
    }
    setPending({ card, to, position, dialog: decision.dialog, snapshot })
  }

  const cancel = () => {
    if (pending) move.rollback(pending.snapshot)
    setPending(null)
  }

  const commit = (extra: { lostReasonId?: string; note?: string; lostCompetitor?: string; closedAt?: string; finalValue?: number } = {}) => {
    if (!pending) return
    move.mutation.mutate({
      card: pending.card,
      toStageId: pending.to.id,
      fromStageId: pending.card.stageId,
      position: pending.position,
      snapshot: pending.snapshot,
      ...extra,
    })
    setPending(null)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActive(null)
    const card = event.active.data.current?.card as BoardCardModel | undefined
    const overId = event.over?.data.current?.stageId as string | undefined
    const overCard = event.over?.data.current?.card as BoardCardModel | undefined
    const toId = overCard?.stageId ?? overId
    const to = stages.find((stage) => stage.id === toId)
    if (!card || !to || !canEdit) {
      setDragStatus('Drop cancelled.')
      return
    }
    setDragStatus(`Dropped ${card.name} on ${to.name}.`)
    const column = columnsRef.current.get(to.id) ?? []
    const index = overCard ? column.findIndex((item) => item.id === overCard.id) : column.length
    begin(card, to, positionAt(column, card.id, index < 0 ? column.length : index))
  }

  const ownerName = useCallback(
    (id: string | null) => users.find((user) => user.id === id)?.name ?? 'Unassigned',
    [users],
  )
  const sourceIcon = useCallback((id: string) => sources.find((source) => source.id === id)?.icon ?? '', [sources])

  return (
    <>
      {stages.length === 0 ? (
        <EmptyState title="This pipeline has no stages" description="Stages are configured with the workspace." />
      ) : (
        <DndContext
          sensors={mobile ? [] : sensors}
          collisionDetection={closestCorners}
          onDragStart={(event: DragStartEvent) => {
            const card = (event.active.data.current?.card as BoardCardModel | undefined) ?? null
            setActive(card)
            setDragStatus(card ? `Picked up ${card.name}. Arrow keys move it. Space drops it. On a phone, use Move to stage.` : '')
          }}
          onDragEnd={onDragEnd}
        >
          <LiveStatus message={dragStatus} />
          <StageTabStrip
            stages={stages}
            activeId={activeStage}
            onSelect={(id) => {
              setActiveStage(id)
              scrollerRef.current?.querySelector<HTMLElement>(`[data-stage-id="${CSS.escape(id)}"]`)?.scrollIntoView({ inline: 'start', block: 'nearest' })
            }}
          />
          <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2" role="list">
            {stages.map((stage) => (
              <ColumnHost
                key={stage.id}
                stage={stage}
                stages={stages}
                board={board}
                pipelineId={pipeline.id}
                search={search}
                filters={filters}
                summary={summary.data?.byStage.find((row) => row.stageId === stage.id)}
                canEdit={canEdit}
                mobile={mobile}
                adding={adding === stage.id}
                sources={sources}
                users={users}
                leadsById={leadsById}
                ownerName={ownerName}
                sourceIcon={sourceIcon}
                now={now}
                onCards={remember}
                onToggleAdd={() => setAdding((current) => (current === stage.id ? null : stage.id))}
                onOpen={(card) => navigate(card.href)}
                onFollowUp={(card) => openFollowUp({ leadIds: [card.leadId], lockLead: true, ...(card.dealId ? { dealId: card.dealId } : {}) })}
                onAssign={setAssignCard}
                onMove={(card, stageId) => {
                  const target = stages.find((item) => item.id === stageId)
                  if (!target) return
                  const column = columnsRef.current.get(target.id) ?? []
                  begin(card, target, positionAt(column, card.id, column.length))
                }}
              />
            ))}
          </div>
          <DragOverlay>{active ? <div className="w-72 rounded-md border border-border bg-surface p-3 shadow-popover"><BoardCardBody card={active} ownerName={ownerName(active.ownerId)} sourceIcon={sourceIcon(active.sourceId)} now={now} /></div> : null}</DragOverlay>
        </DndContext>
      )}
      <BoardDialogs
        pending={pending}
        reasons={reasons}
        loading={move.mutation.isPending}
        users={users}
        assignCard={assignCard}
        ownerId={ownerId}
        onOwnerId={setOwnerId}
        onCancel={cancel}
        onCommit={commit}
        onCloseAssign={() => setAssignCard(null)}
        onAssign={() => {
          if (!assignCard || !isLeadId(assignCard.leadId)) return
          if (assignCard.kind === 'lead') assignLead.mutate({ id: assignCard.leadId, userId: ownerId })
          else if (assignCard.deal) updateDeal.mutate({ id: assignCard.deal.id, patch: { ownerId } })
          setAssignCard(null)
        }}
      />
    </>
  )
}
