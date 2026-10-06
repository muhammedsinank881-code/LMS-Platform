import { matchesCondition, OPERATOR_LABELS, type FieldValue } from '@/lib/filters'
import {
  isConditionGroup,
  type AutomationCondition,
  type ConditionGroup,
  type ConditionTrace,
} from '@/types'
import { fieldLabel, findFieldDef, resolveAutomationField, type AutomationContext } from './fields'
import { idLookups, type Lookups } from './lookups'

const NUMBER = new Intl.NumberFormat('en-IN')

function displayOne(field: string, value: unknown, lookups: Lookups): string {
  if (value === null || value === undefined || value === '') return 'empty'
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  if (typeof value === 'number') return NUMBER.format(value)
  const text = String(value)
  switch (findFieldDef(field)?.options) {
    case 'sources':
      return lookups.source(text)
    case 'statuses':
      return lookups.status(text)
    case 'users':
      return lookups.user(text)
    case 'teams':
      return lookups.team(text)
    case 'campaigns':
      return lookups.campaign(text)
    case 'pipelines':
      return lookups.pipeline(text)
    case 'stages':
      return lookups.stage(text)
    default:
      return text.replace(/_/g, ' ')
  }
}

export function displayValue(field: string, value: unknown, lookups: Lookups = idLookups): string {
  if (Array.isArray(value)) {
    return value.length === 0 ? 'empty' : value.map((v) => displayOne(field, v, lookups)).join(', ')
  }
  return displayOne(field, value, lookups)
}

/** "Budget is greater than 1,00,000". */
export function describeCondition(
  condition: AutomationCondition,
  lookups: Lookups = idLookups,
): string {
  const label = fieldLabel(condition.field)
  const operator = OPERATOR_LABELS[condition.operator]
  if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
    return `${label} ${operator}`
  }
  if (condition.operator === 'between') {
    const [a, b] = condition.value
    return `${label} is between ${displayValue(condition.field, a, lookups)} and ${displayValue(condition.field, b, lookups)}`
  }
  const value = 'value' in condition ? condition.value : undefined
  return `${label} ${operator} ${displayValue(condition.field, value, lookups)}`
}

export interface ConditionResult {
  matched: boolean
  trace: ConditionTrace[]
}

function evalLeaf(
  condition: AutomationCondition,
  ctx: AutomationContext,
  lookups: Lookups,
): ConditionTrace {
  const actual: FieldValue = resolveAutomationField(condition.field, ctx)
  const matched = actual !== undefined && matchesCondition(actual, condition, ctx.now)
  const actualText =
    actual === undefined ? 'not available here' : `is ${displayValue(condition.field, actual, lookups)}`
  return {
    label: describeCondition(condition, lookups),
    matched,
    reason: `${fieldLabel(condition.field)} ${actualText}`,
  }
}

/**
 * Evaluates an AND/OR group. An empty group matches. Missing fields never match (so a deal
 * condition on a lead-only event is false, not an error). The trace lists every leaf checked.
 */
export function evaluateConditions(
  group: ConditionGroup,
  ctx: AutomationContext,
  lookups: Lookups = idLookups,
): ConditionResult {
  if (group.items.length === 0) return { matched: true, trace: [] }
  const trace: ConditionTrace[] = []
  const outcomes = group.items.map((item) => {
    if (isConditionGroup(item)) {
      const nested = evaluateConditions(item, ctx, lookups)
      trace.push(...nested.trace)
      return nested.matched
    }
    const leaf = evalLeaf(item, ctx, lookups)
    trace.push(leaf)
    return leaf.matched
  })
  const matched = group.logic === 'and' ? outcomes.every(Boolean) : outcomes.some(Boolean)
  return { matched, trace }
}
