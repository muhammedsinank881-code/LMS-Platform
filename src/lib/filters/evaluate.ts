import type { FilterCondition, FilterScalar } from '@/types'
import { dateWindowForPreset } from './date-presets'

/** What a field can hold. Dates are ISO strings. */
export type FieldValue = string | number | boolean | null | undefined | readonly string[]

const NUMERIC = /^-?\d+(\.\d+)?$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/

/**
 * Numbers stay numbers; numeric strings become numbers; ISO date strings become epoch ms.
 * Other strings are not comparable (the legacy Date parser accepts too much junk).
 */
function toComparable(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || value === '') return null
  if (NUMERIC.test(value)) return Number(value)
  if (!ISO_DATE.test(value)) return null
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? null : ms
}

function scalarEquals(actual: unknown, expected: FilterScalar): boolean {
  if (typeof expected === 'boolean') return Boolean(actual) === expected
  if (actual === null || actual === undefined) return false
  if (typeof expected === 'number') return Number(actual) === expected
  return String(actual).toLowerCase() === expected.toLowerCase()
}

function isEmpty(value: FieldValue): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function equals(value: FieldValue, expected: FilterScalar): boolean {
  return Array.isArray(value)
    ? value.some((item) => scalarEquals(item, expected))
    : scalarEquals(value, expected)
}

function contains(value: FieldValue, needle: string): boolean {
  if (value === null || value === undefined) return false
  const query = needle.toLowerCase()
  if (Array.isArray(value)) return value.some((item) => String(item).toLowerCase().includes(query))
  return String(value).toLowerCase().includes(query)
}

/** Evaluates one condition against a field value. Pure; `now` only matters for date presets. */
export function matchesCondition<F extends string>(
  value: FieldValue,
  condition: FilterCondition<F>,
  now: Date,
): boolean {
  switch (condition.operator) {
    case 'equals':
      return equals(value, condition.value)
    case 'not_equals':
      return !equals(value, condition.value)
    case 'contains':
      return contains(value, condition.value)
    case 'in':
      return condition.value.some((option) => equals(value, option))
    case 'gt':
    case 'lt': {
      const actual = toComparable(value)
      const limit = toComparable(condition.value)
      if (actual === null || limit === null) return false
      return condition.operator === 'gt' ? actual > limit : actual < limit
    }
    case 'between': {
      const actual = toComparable(value)
      const a = toComparable(condition.value[0])
      const b = toComparable(condition.value[1])
      if (actual === null || a === null || b === null) return false
      return actual >= Math.min(a, b) && actual <= Math.max(a, b)
    }
    case 'is_empty':
      return isEmpty(value)
    case 'is_not_empty':
      return !isEmpty(value)
    case 'date_preset': {
      const actual = toComparable(value)
      if (actual === null) return false
      const { start, end } = dateWindowForPreset(condition.value, now)
      return actual >= start.getTime() && actual <= end.getTime()
    }
  }
}

/** AND-combines conditions. An empty list matches everything. */
export function matchesAll<F extends string>(
  conditions: readonly FilterCondition<F>[],
  getValue: (field: F) => FieldValue,
  now: Date,
): boolean {
  return conditions.every((condition) =>
    matchesCondition(getValue(condition.field), condition, now),
  )
}

/** OR-combines conditions. An empty list matches nothing. */
export function matchesAny<F extends string>(
  conditions: readonly FilterCondition<F>[],
  getValue: (field: F) => FieldValue,
  now: Date,
): boolean {
  return conditions.some((condition) => matchesCondition(getValue(condition.field), condition, now))
}

/** Ascending comparison with empty values last, for the list engine's sort. */
export function compareFieldValues(a: FieldValue, b: FieldValue): number {
  const aEmpty = isEmpty(a)
  const bEmpty = isEmpty(b)
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1
  if (Array.isArray(a) || Array.isArray(b)) return String(a).localeCompare(String(b))
  if (typeof a === 'boolean' || typeof b === 'boolean') return Number(a) - Number(b)
  if (typeof a === 'number' && typeof b === 'number') return a - b
  const aTime = typeof a === 'string' ? Date.parse(a) : Number.NaN
  const bTime = typeof b === 'string' ? Date.parse(b) : Number.NaN
  // Only treat strings as dates when both look like ISO timestamps.
  if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && /^\d{4}-\d{2}-\d{2}/.test(String(a))) {
    return aTime - bTime
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}
