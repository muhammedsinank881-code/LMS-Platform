/** Deep copy for plain JSON-like data, so callers can never mutate the in-memory database. */
export function clone<T>(value: T): T {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value)) as T
}

let sequence = 0

/** Unique id for records created at runtime, e.g. `follow-3k9x1-2a`. Seeds use stable ids. */
export function newId(kind: string): string {
  sequence += 1
  return `${kind}-${Date.now().toString(36)}-${sequence.toString(36)}`
}

export function sumBy<T>(items: readonly T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + pick(item), 0)
}

export function uniqueBy<T, K>(items: readonly T[], key: (item: T) => K): T[] {
  const seen = new Set<K>()
  return items.filter((item) => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
