import type { LeafAction } from '@/types'
import type { RequestContext } from '../../core/context'
import { leadExecutors } from './lead'
import { messageExecutors } from './messages'
import { notifyExecutors } from './notify'
import { recordExecutors } from './records'
import { taskExecutors } from './tasks'
import type { ExecTarget, Executor, ExecutorMap } from './types'

/** One handler per action type. Adding an action type is a one-place change here. */
const EXECUTORS: ExecutorMap = {
  ...leadExecutors,
  ...taskExecutors,
  ...messageExecutors,
  ...notifyExecutors,
  ...recordExecutors,
}

type AutomationRef = Parameters<Executor<LeafAction>>[3]

/**
 * Performs one action by calling the same store mutations as the manual UI paths, so activity,
 * audit and notification writes are identical. Returns what happened, or throws.
 */
export function executeAction(
  ctx: RequestContext,
  action: LeafAction,
  target: ExecTarget,
  automation: AutomationRef,
): string {
  const run = EXECUTORS[action.type] as Executor<LeafAction>
  return run(ctx, action, target, automation)
}

export type { ExecTarget } from './types'
