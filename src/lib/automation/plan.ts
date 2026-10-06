import type {
  AutomationAction,
  AutomationContent,
  ConditionTrace,
  LeafAction,
  WaitAction,
} from '@/types'
import { evaluateConditions } from './conditions'
import type { AutomationContext } from './fields'
import { idLookups, type Lookups } from './lookups'

const UNIT_MS = { minutes: 60_000, hours: 3_600_000, days: 86_400_000 } as const

export const waitMs = (action: WaitAction): number => action.amount * UNIT_MS[action.unit]

export type PlannedItem =
  | { kind: 'leaf'; path: string; action: LeafAction }
  | { kind: 'wait'; path: string; action: WaitAction; ms: number }
  | {
      kind: 'branch'
      path: string
      matched: boolean
      chosen: 'then' | 'else'
      trace: ConditionTrace[]
    }

/** Expands one top-level action into the steps it stands for. Branches pick a side now. */
export function planAction(
  action: AutomationAction,
  path: string,
  ctx: AutomationContext,
  lookups: Lookups = idLookups,
): PlannedItem[] {
  if (action.type === 'wait') return [{ kind: 'wait', path, action, ms: waitMs(action) }]
  if (action.type !== 'branch') return [{ kind: 'leaf', path, action }]
  const result = evaluateConditions(action.conditions, ctx, lookups)
  const chosen = result.matched ? 'then' : 'else'
  return [
    { kind: 'branch', path, matched: result.matched, chosen, trace: result.trace },
    ...action[chosen].map((leaf, index): PlannedItem => ({
      kind: 'leaf',
      path: `${path}.${chosen}.${index}`,
      action: leaf,
    })),
  ]
}

export interface PlanOptions {
  /** First top-level action to plan. Resumed runs start after their wait. */
  from?: number
  /** Keep planning past waits (dry runs show the whole flow). Real runs stop at the first wait. */
  throughWaits?: boolean
  lookups?: Lookups
}

export interface Plan {
  items: PlannedItem[]
  /** Index of the wait the plan stopped at, if any. */
  stoppedAtWait: number | null
}

/** The ordered plan for an automation in a context. Pure: nothing is executed or written. */
export function planActions(
  automation: Pick<AutomationContent, 'actions'>,
  ctx: AutomationContext,
  options: PlanOptions = {},
): Plan {
  const items: PlannedItem[] = []
  for (let index = options.from ?? 0; index < automation.actions.length; index++) {
    const planned = planAction(automation.actions[index], String(index), ctx, options.lookups)
    items.push(...planned)
    if (planned[0]?.kind === 'wait' && !options.throughWaits) return { items, stoppedAtWait: index }
  }
  return { items, stoppedAtWait: null }
}
