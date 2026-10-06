import { emptyGroup, type AutomationAction, type AutomationContent } from '@/types'
import { defaultTrigger } from '@/lib/automation'

/** An action with a stable id, so reordering and editing keep the right card in place. */
export interface ActionItem {
  id: string
  action: AutomationAction
}

export interface BuilderDraft {
  name: string
  description: string
  trigger: AutomationContent['trigger']
  conditions: AutomationContent['conditions']
  actions: ActionItem[]
}

let counter = 0
export const newItemId = () => `item-${(counter += 1)}`

export const blankDraft = (): BuilderDraft => ({
  name: '',
  description: '',
  trigger: defaultTrigger('lead_created'),
  conditions: emptyGroup(),
  actions: [],
})

export function fromContent(content: AutomationContent): BuilderDraft {
  return {
    name: content.name,
    description: content.description,
    trigger: content.trigger,
    conditions: content.conditions,
    actions: content.actions.map((action) => ({ id: newItemId(), action })),
  }
}

export function toContent(draft: BuilderDraft): AutomationContent {
  return {
    name: draft.name,
    description: draft.description,
    trigger: draft.trigger,
    conditions: draft.conditions,
    actions: draft.actions.map((item) => item.action),
  }
}

/** Moves an item one place up or down. Returns the same array when it cannot move. */
export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
