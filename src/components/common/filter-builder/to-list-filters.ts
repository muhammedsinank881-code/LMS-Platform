import { DATE_PRESETS, type DatePreset, type FilterCondition, type FilterOperator } from '@/types'
import {
  needsValue,
  OPERATORS_BY_TYPE,
  type FilterDraft,
  type FilterFieldConfig,
  type FilterFieldType,
} from './operators'

function isDatePreset(value: unknown): value is DatePreset {
  return typeof value === 'string' && (DATE_PRESETS as readonly string[]).includes(value)
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return String(value)
  return null
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  }
  const single = asString(value)
  return single ? [single] : []
}

function asPair(value: unknown): [string | number, string | number] | null {
  if (!Array.isArray(value) || value.length !== 2) return null
  const a = value[0]
  const b = value[1]
  if (typeof a === 'number' && typeof b === 'number') return [a, b]
  if (typeof a === 'string' && typeof b === 'string' && a && b) return [a, b]
  const na = asNumber(a)
  const nb = asNumber(b)
  if (na !== null && nb !== null) return [na, nb]
  return null
}

function buildCondition<F extends string>(
  type: FilterFieldType,
  field: F,
  operator: FilterOperator,
  value: unknown,
): FilterCondition<F> | null {
  if (!OPERATORS_BY_TYPE[type].includes(operator)) return null
  if (!needsValue(operator)) {
    return { field, operator } as FilterCondition<F>
  }

  if (operator === 'in') {
    const list = asStringList(value)
    return list.length > 0 ? { field, operator: 'in', value: list } : null
  }
  if (operator === 'between') {
    if (type === 'number' || type === 'currency') {
      const left = asNumber(Array.isArray(value) ? value[0] : null)
      const right = asNumber(Array.isArray(value) ? value[1] : null)
      return left !== null && right !== null
        ? { field, operator: 'between', value: [left, right] }
        : null
    }
    const pair = asPair(value)
    return pair ? { field, operator: 'between', value: pair } : null
  }
  if (operator === 'date_preset') {
    return isDatePreset(value) ? { field, operator: 'date_preset', value } : null
  }
  if (operator === 'contains') {
    const text = asString(value)
    return text ? { field, operator: 'contains', value: text } : null
  }
  if (operator === 'gt' || operator === 'lt') {
    if (type === 'date') {
      const date = asString(value)
      return date ? { field, operator, value: date } : null
    }
    const number = asNumber(value)
    return number !== null ? { field, operator, value: number } : null
  }
  if (type === 'boolean') {
    if (value === true || value === 'true') return { field, operator: 'equals', value: true }
    if (value === false || value === 'false') return { field, operator: 'equals', value: false }
    return null
  }
  if (type === 'number' || type === 'currency') {
    const number = asNumber(value)
    if (number === null) return null
    if (operator === 'equals' || operator === 'not_equals') {
      return { field, operator, value: number }
    }
    return null
  }
  const text = asString(value)
  if (!text) return null
  if (operator === 'equals' || operator === 'not_equals') {
    return { field, operator, value: text }
  }
  return null
}

/** Drops incomplete rows and coerces values into ListParams filters. */
export function toListFilters<F extends string>(
  fields: readonly FilterFieldConfig<F>[],
  drafts: readonly FilterDraft<F>[],
): FilterCondition<F>[] {
  const byId = new Map(fields.map((field) => [field.id, field]))
  const next: FilterCondition<F>[] = []
  for (const draft of drafts) {
    const config = byId.get(draft.field)
    if (!config) continue
    const condition = buildCondition(config.type, draft.field, draft.operator, draft.value)
    if (condition) next.push(condition)
  }
  return next
}
