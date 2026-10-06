const DAY_MS = 86_400_000

/** Fractional days from `from` to `to`, never negative. Null when either is not a valid date. */
export function daysBetween(from: string, to: string): number | null {
  const a = Date.parse(from)
  const b = Date.parse(to)
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.max(0, (b - a) / DAY_MS)
}

export interface StageVisit {
  stageId: string
  enteredAt: string
  /** When the item left the stage. Null while it is still there. */
  exitedAt?: string | null
}

const round1 = (value: number) => Math.round(value * 10) / 10

export function averageOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : round1(values.reduce((a, b) => a + b, 0) / values.length)
}

/** Average days spent per stage. Items still in a stage count up to `now`. Unvisited stages are null. */
export function avgDaysInStage(
  visits: readonly StageVisit[],
  stageIds: readonly string[],
  now: Date,
): Record<string, number | null> {
  const result: Record<string, number | null> = {}
  for (const id of stageIds) {
    const days = visits
      .filter((visit) => visit.stageId === id)
      .map((visit) => daysBetween(visit.enteredAt, visit.exitedAt ?? now.toISOString()))
      .filter((value): value is number => value !== null)
    result[id] = averageOf(days)
  }
  return result
}

/** Days from creation to close. Null for open items. */
export function timeToClose(createdAt: string, closedAt: string | null): number | null {
  return closedAt === null ? null : daysBetween(createdAt, closedAt)
}

export const CLOSE_EDGES = [7, 14, 30, 60, 90] as const

/** Buckets days into 0-7, 8-14 ... and a final open-ended bin. Edges are inclusive upper bounds. */
export function histogramBins(
  values: readonly number[],
  edges: readonly number[] = CLOSE_EDGES,
): Array<{ label: string; count: number }> {
  const bins = [...edges, Infinity].map((edge, index) => {
    const low = index === 0 ? 0 : (edges[index - 1] ?? 0) + 1
    return { label: edge === Infinity ? `${low}d+` : `${low}-${edge}d`, edge, count: 0 }
  })
  for (const value of values) {
    const bin = bins.find((item) => value <= item.edge)
    if (bin) bin.count += 1
  }
  return bins.map(({ label, count }) => ({ label, count }))
}

export interface StuckCandidate {
  stageEnteredAt: string
}

/** Items that have sat in their stage longer than `thresholdDays`, longest first. */
export function findStuck<T extends StuckCandidate>(
  items: readonly T[],
  thresholdDays: number,
  now: Date,
): Array<T & { daysInStage: number }> {
  return items
    .map((item) => ({
      ...item,
      daysInStage: Math.floor(daysBetween(item.stageEnteredAt, now.toISOString()) ?? 0),
    }))
    .filter((item) => item.daysInStage > thresholdDays)
    .sort((a, b) => b.daysInStage - a.daysInStage)
}
