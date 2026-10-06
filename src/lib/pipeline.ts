import type { DealsSummary, PipelineStage, StageSummary, StageType } from '@/types'

const DAY_MS = 86_400_000
/** Below this gap the column is renumbered so the next reorder stays precise. */
export const MIN_POSITION_GAP = 1e-6

export interface StageTotalItem {
  stageId: string
  value: number
  /** When omitted, the stage's probability is used. */
  probability?: number
}

type StageProb = Pick<PipelineStage, 'id' | 'probability'>

/** value × probability / 100, rounded to the nearest currency unit. */
export function computeExpectedRevenue(value: number, probability: number): number {
  return Math.round((value * probability) / 100)
}

/** Count, total value, and weighted value for every stage. Closed stages are included. */
export function computeStageTotals(
  items: readonly StageTotalItem[],
  stages: readonly StageProb[],
): StageSummary[] {
  return stages.map((stage) => {
    const inStage = items.filter((item) => item.stageId === stage.id)
    return {
      stageId: stage.id,
      count: inStage.length,
      total: inStage.reduce((sum, item) => sum + item.value, 0),
      weighted: inStage.reduce((sum, item) => {
        const probability = item.probability ?? stage.probability
        return sum + (item.value * probability) / 100
      }, 0),
    }
  })
}

/** Open-stage totals plus a row for every stage. Weighted value uses each item's probability. */
export function summarizeBoard(
  items: readonly StageTotalItem[],
  stages: readonly (StageProb & { type?: StageType })[],
): DealsSummary {
  const byStage = computeStageTotals(items, stages)
  const openIds = new Set(stages.filter((stage) => stage.type === 'open').map((stage) => stage.id))
  const open = byStage.filter((row) => openIds.has(row.stageId))
  return {
    total: open.reduce((sum, row) => sum + row.total, 0),
    weighted: open.reduce((sum, row) => sum + row.weighted, 0),
    count: open.reduce((sum, row) => sum + row.count, 0),
    byStage,
  }
}

export function getDaysInStage(item: { stageEnteredAt: string }, now: Date): number {
  const entered = Date.parse(item.stageEnteredAt)
  if (Number.isNaN(entered)) return 0
  return Math.max(0, Math.floor((now.getTime() - entered) / DAY_MS))
}

export interface StageMoveEvent {
  at: string
  actorId: string | null
  fromStageId: string
  toStageId: string
}

export interface StageHistorySpan {
  stageId: string
  enteredAt: string
  exitedAt: string | null
  /** Who moved the record into this stage. Null for the stage it was created in. */
  actorId: string | null
  days: number
}

function daysBetween(start: string, end: string): number {
  return Math.max(0, Math.floor((Date.parse(end) - Date.parse(start)) / DAY_MS))
}

/** Time spent in each stage, from creation through the latest move. */
export function buildStageHistory(
  createdAt: string,
  currentStageId: string,
  events: readonly StageMoveEvent[],
  now: Date,
): StageHistorySpan[] {
  const ordered = [...events].sort((a, b) => a.at.localeCompare(b.at))
  if (ordered.length === 0) {
    return [
      {
        stageId: currentStageId,
        enteredAt: createdAt,
        exitedAt: null,
        actorId: null,
        days: daysBetween(createdAt, now.toISOString()),
      },
    ]
  }

  const spans: StageHistorySpan[] = [
    {
      stageId: ordered[0].fromStageId,
      enteredAt: createdAt,
      exitedAt: ordered[0].at,
      actorId: null,
      days: daysBetween(createdAt, ordered[0].at),
    },
  ]
  ordered.forEach((event, index) => {
    const next = ordered[index + 1]
    const exitedAt = next?.at ?? null
    spans.push({
      stageId: event.toStageId,
      enteredAt: event.at,
      exitedAt,
      actorId: event.actorId,
      days: daysBetween(event.at, exitedAt ?? now.toISOString()),
    })
  })
  return spans
}

export type MoveDialog = 'none' | 'lost-reason' | 'convert' | 'close-won' | 'confirm'

export interface MoveDecision {
  allowed: boolean
  dialog: MoveDialog
  reason?: string
}

type StageMoveRef = Pick<PipelineStage, 'id' | 'pipelineId' | 'type'>

/**
 * Whether a card may enter `to`. Terminal stages ask for a dialog first.
 * Moving a closed card back to an open stage asks for confirmation (reopen).
 */
export function canMoveToStage(
  item: { kind: 'lead' | 'deal'; pipelineId: string },
  from: StageMoveRef | null,
  to: StageMoveRef,
): MoveDecision {
  if (item.pipelineId !== to.pipelineId || (from && from.pipelineId !== to.pipelineId)) {
    return { allowed: false, dialog: 'none', reason: 'A card can only move within its pipeline.' }
  }
  if (from && from.id === to.id) return { allowed: true, dialog: 'none' }
  if (to.type === 'lost') return { allowed: true, dialog: 'lost-reason' }
  if (to.type === 'won') return { allowed: true, dialog: item.kind === 'lead' ? 'convert' : 'close-won' }
  if (to.type === 'invalid') return { allowed: true, dialog: 'confirm' }
  if (from && from.type !== 'open' && to.type === 'open') return { allowed: true, dialog: 'confirm' }
  return { allowed: true, dialog: 'none' }
}

export interface Positioned {
  id: string
  position: number
}

export interface ReorderResult {
  id: string
  position: number
  needsCompact: boolean
}

/**
 * New position for the item moved from index `from` to index `to`.
 * Neighbors keep their positions. `needsCompact` is true when the gap is too small to halve again.
 */
export function reorderWithinColumn(
  items: readonly Positioned[],
  from: number,
  to: number,
): ReorderResult {
  const moving = items[from]
  if (!moving) {
    return { id: '', position: 1, needsCompact: false }
  }
  if (from === to || items.length < 2) {
    return { id: moving.id, position: moving.position, needsCompact: false }
  }
  const ordered = items.slice()
  const [removed] = ordered.splice(from, 1)
  const insertAt = from < to ? to - 1 : to
  ordered.splice(insertAt, 0, removed)
  const prev = ordered[insertAt - 1]
  const next = ordered[insertAt + 1]
  let position: number
  if (!prev && next) position = next.position / 2
  else if (prev && !next) position = prev.position + 1
  else if (prev && next) position = (prev.position + next.position) / 2
  else position = moving.position
  const gap = prev && next ? Math.abs(next.position - prev.position) : 1
  return { id: moving.id, position, needsCompact: gap < MIN_POSITION_GAP * 2 }
}
