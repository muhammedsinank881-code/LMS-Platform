import { MIN_POSITION_GAP } from '@/lib/pipeline'

interface Positioned {
  id: string
  stageId: string
  position: number
}

/** Append position for a new card in a column. */
export function nextColumnPosition(rows: readonly Positioned[], stageId: string): number {
  return rows.filter((row) => row.stageId === stageId).reduce((max, row) => Math.max(max, row.position), 0) + 1
}

/**
 * Positions to persist after dropping `movedId` at `requested`.
 * Returns only the moved id unless the gap is too small, in which case the whole column is renumbered.
 */
export function positionsAfterMove(
  rows: readonly Positioned[],
  stageId: string,
  movedId: string,
  requested: number,
): Array<{ id: string; position: number }> {
  const placed = rows
    .filter((row) => row.stageId === stageId && row.id !== movedId)
    .map((row) => ({ id: row.id, position: row.position }))
  placed.push({ id: movedId, position: requested })
  placed.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
  const tight = placed.some((item, index) => index > 0 && item.position - placed[index - 1].position < MIN_POSITION_GAP)
  if (!tight) return [{ id: movedId, position: requested }]
  return placed.map((item, index) => ({ id: item.id, position: index + 1 }))
}
