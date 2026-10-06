import { compareFieldValues, matchesAll, type FieldValue } from '@/lib/filters'
import { ApiError } from '@/services/api/errors'
import type { ListParams, Paginated, SortParam } from '@/types'

export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 200

/** How the engine reads an entity: which fields exist, their values, and what search covers. */
export interface ListSpec<T, F extends string> {
  /** Fields that may be filtered and sorted on. Anything else is a VALIDATION error. */
  fields: readonly F[]
  value(row: T, field: F): FieldValue
  /** Text the free-text search looks through. Phone numbers also match by digits only. */
  searchable?(row: T): ReadonlyArray<string | null | undefined>
  defaultSort?: SortParam<F>[]
  now: Date
}

function assertKnownFields<F extends string>(
  params: ListParams<F>,
  allowed: readonly F[],
  label: string,
): void {
  const known = new Set<string>(allowed)
  const unknown = [
    ...(params.filters ?? []).map((f) => f.field),
    ...(params.sort ?? []).map((s) => s.field),
  ].filter((field) => !known.has(field))
  if (unknown.length > 0) {
    const message = `Cannot filter or sort ${label} by: ${[...new Set(unknown)].join(', ')}.`
    throw new ApiError('VALIDATION', message, { filters: [message] })
  }
}

function matchesSearch(texts: ReadonlyArray<string | null | undefined>, query: string): boolean {
  const haystack = texts.filter(Boolean).join(' ').toLowerCase()
  const digits = haystack.replace(/\D/g, '')
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => {
      if (haystack.includes(term)) return true
      // "98765 43210" or "+91-98765" should find a stored +919876543210.
      return /^[\d()+-]{3,}$/.test(term) && digits.includes(term.replace(/\D/g, ''))
    })
}

/** Filter, search and sort without paginating (used for exports and aggregates). */
export function filterRows<T, F extends string>(
  rows: readonly T[],
  params: ListParams<F> | undefined,
  spec: ListSpec<T, F>,
  label = 'records',
): T[] {
  const { filters = [], search, sort } = params ?? {}
  if (params) assertKnownFields(params, spec.fields, label)

  let result = rows.filter((row) =>
    matchesAll(filters, (field) => spec.value(row, field), spec.now),
  )
  const query = search?.trim()
  const searchable = spec.searchable
  if (query && searchable) result = result.filter((row) => matchesSearch(searchable(row), query))

  const order = sort && sort.length > 0 ? sort : (spec.defaultSort ?? [])
  if (order.length === 0) return result
  // Array.prototype.sort is stable, so rows that tie keep their incoming order.
  return [...result].sort((a, b) => {
    for (const { field, direction } of order) {
      const diff = compareFieldValues(spec.value(a, field), spec.value(b, field))
      if (diff !== 0) return direction === 'desc' ? -diff : diff
    }
    return 0
  })
}

export function paginate<T>(rows: readonly T[], page?: number, pageSize?: number): Paginated<T> {
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)))
  const current = Math.max(1, Math.floor(page ?? 1))
  const start = (current - 1) * size
  return {
    items: rows.slice(start, start + size),
    total: rows.length,
    page: current,
    pageSize: size,
    pageCount: Math.ceil(rows.length / size),
  }
}

/** The full list pipeline: filter, search, sort, then one page. Pages past the end are empty. */
export function applyListParams<T, F extends string>(
  rows: readonly T[],
  params: ListParams<F> | undefined,
  spec: ListSpec<T, F>,
  label?: string,
): Paginated<T> {
  return paginate(filterRows(rows, params, spec, label), params?.page, params?.pageSize)
}

/** Reads fields straight off a record, for entities whose filter fields are stored properties. */
export function propertyValue<T extends object, F extends string>(row: T, field: F): FieldValue {
  const value = (row as Record<string, unknown>)[field]
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  return Array.isArray(value) ? value.map(String) : String(value)
}
