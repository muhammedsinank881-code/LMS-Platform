import { planAction, type Lookups } from '@/lib/automation'
import type { Automation, AutomationRun, AutomationRunStep, StepStatus } from '@/types'
import type { RequestContext } from '../core/context'
import { buildAutomationContext, resolveRelated } from './context-builder'
import { executeAction } from './executors'
import { automationLookups } from './lookups'
import { systemContext } from './system-context'

function step(
  ctx: RequestContext,
  path: string,
  actionType: string,
  status: StepStatus,
  result: string,
  error: string | null = null,
): AutomationRunStep {
  return { path, actionType, status, result, error, startedAt: ctx.timestamp, finishedAt: status === 'waiting' ? null : ctx.timestamp }
}

export interface RunOptions {
  /** Keep going after waits (a dry run shows the whole flow without pausing). */
  dryRun?: boolean
}

export interface RunOutcome {
  /** Total delay a dry run skipped over, in ms. */
  skippedWaitMs: number
  /** Length of the first wait, for "waits until" in a dry run. */
  firstWaitMs: number | null
}

function finish(run: AutomationRun, ctx: RequestContext, status: 'succeeded' | 'failed', error: string | null): void {
  run.status = status
  run.error = error
  run.finishedAt = ctx.timestamp
  run.resumeAt = null
}

/**
 * Executes a run from its cursor: plans the next top-level action against fresh data, runs its
 * steps, and stops at a wait (real runs) or a failure. The run object is updated in place; the
 * caller saves it. This is the part a real backend worker would own.
 */
export function runFrom(
  base: RequestContext,
  automation: Automation,
  run: AutomationRun,
  options: RunOptions = {},
): RunOutcome {
  const sys = systemContext(base, automation, run.chain)
  const lookups: Lookups = automationLookups(base)
  const outcome: RunOutcome = { skippedWaitMs: 0, firstWaitMs: null }
  run.status = 'running'

  for (let index = run.cursor; index < automation.actions.length; index++) {
    const planned = planAction(automation.actions[index], String(index), buildAutomationContext(sys, run.entity), lookups)
    for (const item of planned) {
      if (item.kind === 'branch') {
        run.steps.push(step(sys, item.path, 'branch', 'succeeded', `Condition ${item.matched ? 'matched' : 'did not match'}: running the ${item.chosen} side`))
        continue
      }
      if (item.kind === 'wait') {
        const resumeAt = new Date(sys.now.getTime() + item.ms).toISOString()
        if (options.dryRun) {
          outcome.skippedWaitMs += item.ms
          outcome.firstWaitMs ??= item.ms
          run.steps.push(step(sys, item.path, 'wait', 'succeeded', `Would wait until ${resumeAt}`))
          continue
        }
        run.steps.push(step(sys, item.path, 'wait', 'waiting', `Waiting until ${resumeAt}`))
        run.status = 'waiting'
        run.resumeAt = resumeAt
        run.cursor = index + 1
        return outcome
      }
      const { lead, deal } = resolveRelated(sys, run.entity)
      try {
        const result = executeAction(sys, item.action, { leadId: lead?.id ?? null, dealId: deal?.id ?? null }, automation)
        run.steps.push(step(sys, item.path, item.action.type, 'succeeded', result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        run.steps.push(step(sys, item.path, item.action.type, 'failed', 'Failed', message))
        run.cursor = index
        finish(run, sys, 'failed', message)
        return outcome
      }
    }
    run.cursor = index + 1
  }
  finish(run, sys, 'succeeded', null)
  return outcome
}
