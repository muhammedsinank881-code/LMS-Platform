import type { FilterCondition } from '../common'

export type ConditionLogic = 'and' | 'or'

/** A condition on any field the trigger's entity (or a related one) exposes. */
export type AutomationCondition = FilterCondition<string>

/** AND/OR group. Items may be conditions or nested groups (two levels in the builder). */
export interface ConditionGroup {
  logic: ConditionLogic
  items: Array<AutomationCondition | ConditionGroup>
}

export const isConditionGroup = (
  item: AutomationCondition | ConditionGroup,
): item is ConditionGroup => 'logic' in item

export const emptyGroup = (logic: ConditionLogic = 'and'): ConditionGroup => ({ logic, items: [] })
