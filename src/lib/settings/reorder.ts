/** Moves an item in a list and returns the new id order. Pure, so tests can drive it. */
export function reorderIds(orderedIds: readonly string[], activeId: string, overId: string): string[] {
  const from = orderedIds.indexOf(activeId)
  const to = orderedIds.indexOf(overId)
  if (from < 0 || to < 0 || from === to) return [...orderedIds]
  const next = [...orderedIds]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/** Applies a saved id order onto items. Unknown ids stay at the end. */
export function orderByIds<T extends { id: string }>(items: readonly T[], orderedIds: readonly string[]): T[] {
  const position = new Map(orderedIds.map((id, index) => [id, index]))
  return [...items].sort(
    (a, b) => (position.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (position.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  )
}
