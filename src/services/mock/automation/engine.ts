import { chainBlock, evaluateConditions, idempotencyKey, isRateLimited, matchTrigger } from '@/lib/automation'
import { ApiError } from '@/services/api/errors'
import type { Automation, AutomationRun, DomainEvent } from '@/types'
import type { RequestContext } from '../core/context'
import { newId } from '../core/util'
import { markFinished, markStarted } from './bookkeeping'
import { buildAutomationContext } from './context-builder'
import { automationLookups } from './lookups'
import { runFrom } from './runner'

const isLive = (a: Automation) => a.enabled && a.status === 'published'

function baseRun(automation: Automation, event: DomainEvent, key: string, ctx: RequestContext): AutomationRun {
  return {
    id: newId('run'),
    tenantId: ctx.tenantId,
    automationId: automation.id,
    automationName: automation.name,
    automationVersion: automation.version,
    entity: event.entity,
    eventId: event.id,
    idempotencyKey: key,
    chain: event.chain,
    triggerType: automation.trigger.type,
    triggerPayload: event.data,
    status: 'running',
    steps: [],
    conditionTrace: [],
    cursor: 0,
    resumeAt: null,
    error: null,
    startedAt: ctx.timestamp,
    finishedAt: null,
  }
}

function skipped(ctx: RequestContext, automation: Automation, event: DomainEvent, key: string, reason: string): AutomationRun {
  const run = baseRun(automation, event, key, ctx)
  run.status = 'skipped'
  run.error = reason
  run.finishedAt = ctx.timestamp
  return ctx.db.insert('automationRuns', run)
}

/**
 * Starts a run for one automation and event: duplicates are ignored, loops and runaway chains
 * are stopped, a busy entity is rate limited, and conditions decide whether anything happens.
 */
export function startRun(ctx: RequestContext, automation: Automation, event: DomainEvent): AutomationRun | null {
  const key = idempotencyKey(automation.id, event.entity.id, event.id)
  const runs = ctx.db.all('automationRuns')
  if (runs.some((r) => r.idempotencyKey === key)) return null

  const block = chainBlock(event, automation.id)
  if (block) return skipped(ctx, automation, event, key, block)

  const recent = runs.filter((r) => r.automationId === automation.id && r.entity.id === event.entity.id && r.status !== 'skipped')
  if (isRateLimited(recent, ctx.now)) {
    return skipped(ctx, automation, event, key, 'Skipped: too many runs for this record in the last hour.')
  }

  const conditions = evaluateConditions(automation.conditions, buildAutomationContext(ctx, event.entity), automationLookups(ctx))
  if (!conditions.matched) return null

  const run = baseRun(automation, event, key, ctx)
  run.conditionTrace = conditions.trace
  ctx.db.insert('automationRuns', run)
  markStarted(ctx, automation)
  runFrom(ctx, automation, run)
  const saved = ctx.db.save('automationRuns', run)
  markFinished(ctx, automation, saved)
  return saved
}

/** Event bus subscriber: runs every enabled, published automation of the tenant that matches. */
export function handleEvent(ctx: RequestContext, event: DomainEvent): void {
  for (const automation of ctx.db.all('automations')) {
    if (isLive(automation) && matchTrigger(event, automation)) startRun(ctx, automation, event)
  }
}

function finishWaitingStep(run: AutomationRun, ctx: RequestContext): void {
  const waiting = run.steps.find((s) => s.status === 'waiting')
  if (waiting) Object.assign(waiting, { status: 'succeeded', result: 'Wait finished', finishedAt: ctx.timestamp })
}

/** Continues a waiting run after its delay. A disabled or deleted automation cancels it. */
export function resumeRun(ctx: RequestContext, run: AutomationRun): AutomationRun {
  const automation = ctx.db.find('automations', run.automationId)
  if (!automation || !isLive(automation)) {
    run.status = 'cancelled'
    run.error = 'The automation was turned off or deleted while this run was waiting.'
    run.finishedAt = ctx.timestamp
    run.resumeAt = null
    return ctx.db.save('automationRuns', run)
  }
  finishWaitingStep(run, ctx)
  runFrom(ctx, automation, run)
  const saved = ctx.db.save('automationRuns', run)
  markFinished(ctx, automation, saved)
  return saved
}

/** Retries a failed run from the top-level action that failed. */
export function retryRun(ctx: RequestContext, runId: string): AutomationRun {
  const run = ctx.db.get('automationRuns', runId, 'Run')
  if (run.status !== 'failed') throw new ApiError('CONFLICT', 'Only a failed run can be retried.')
  const automation = ctx.db.get('automations', run.automationId, 'Automation')
  const failed = run.steps.find((s) => s.status === 'failed')
  const index = failed ? Number(failed.path.split('.')[0]) : run.cursor
  run.steps = run.steps.filter((s) => Number(s.path.split('.')[0]) < index)
  run.cursor = index
  run.finishedAt = null
  runFrom(ctx, automation, run)
  const saved = ctx.db.save('automationRuns', run)
  markFinished(ctx, automation, saved)
  return saved
}

export function cancelRun(ctx: RequestContext, runId: string): AutomationRun {
  const run = ctx.db.get('automationRuns', runId, 'Run')
  if (run.status !== 'waiting') throw new ApiError('CONFLICT', 'Only a waiting run can be cancelled.')
  const waiting = run.steps.find((s) => s.status === 'waiting')
  if (waiting) Object.assign(waiting, { status: 'skipped', result: 'Cancelled while waiting', finishedAt: ctx.timestamp })
  run.status = 'cancelled'
  run.resumeAt = null
  run.finishedAt = ctx.timestamp
  return ctx.db.save('automationRuns', run)
}
