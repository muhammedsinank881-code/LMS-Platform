/** A status or stage list must keep at least one won and one lost entry. */
export function keepsWonAndLost<T extends { id: string; type: string }>(
  items: readonly T[],
  removingId?: string,
  nextType?: { id: string; type: string },
): boolean {
  const next = items
    .filter((item) => item.id !== removingId)
    .map((item) => (nextType && item.id === nextType.id ? { ...item, type: nextType.type } : item))
  return next.some((item) => item.type === 'won') && next.some((item) => item.type === 'lost')
}
