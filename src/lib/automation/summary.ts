import { isConditionGroup, type AutomationContent, type ConditionGroup } from '@/types'
import { describeAction } from './action-registry'
import { describeCondition } from './conditions'
import { idLookups, type Lookups } from './lookups'
import { describeTrigger } from './trigger-registry'

function describeGroup(group: ConditionGroup, lookups: Lookups, nested = false): string {
  const joiner = group.logic === 'and' ? ' and ' : ' or '
  const parts = group.items.map((item) =>
    isConditionGroup(item) ? describeGroup(item, lookups, true) : describeCondition(item, lookups),
  )
  const text = parts.join(joiner)
  return nested && parts.length > 1 ? `(${text})` : text
}

function joinActions(parts: string[]): string {
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

/** One plain-language sentence for the whole automation. Shown live next to the builder. */
export function summarizeAutomation(
  content: Pick<AutomationContent, 'trigger' | 'conditions' | 'actions'>,
  lookups: Lookups = idLookups,
): string {
  const when = describeTrigger(content.trigger, lookups)
  const condition = describeGroup(content.conditions, lookups)
  const actions = joinActions(content.actions.map((action) => describeAction(action, lookups)))
  const middle = condition ? `, if ${condition}` : ''
  const lead = `When ${when}${middle}`
  return actions ? `${lead}, ${actions}.` : `${lead}, then nothing yet. Add an action.`
}
