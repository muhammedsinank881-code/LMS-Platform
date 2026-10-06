import type { AutomationTrigger, AutomationTriggerType, LeafAction, LeafActionType } from '@/types'
import type { AutomationOptions } from '../../hooks/use-automation-refs'

type TriggerOf<T extends AutomationTriggerType> = Extract<AutomationTrigger, { type: T }>
type ActionOf<T extends LeafActionType> = Extract<LeafAction, { type: T }>

export interface TriggerFormProps<T extends AutomationTriggerType> {
  trigger: TriggerOf<T>
  onChange: (trigger: TriggerOf<T>) => void
  options: AutomationOptions
  /** Validation messages for this trigger. */
  errors: string[]
}

export interface ActionFormProps<T extends LeafActionType> {
  action: ActionOf<T>
  onChange: (action: ActionOf<T>) => void
  options: AutomationOptions
  /** Validation messages for this action. */
  errors: string[]
}
