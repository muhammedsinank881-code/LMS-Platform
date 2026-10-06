import { evaluateConditions } from '@/lib/automation'
import { ApiError } from '@/services/api/errors'
import type { Automation, AutomationContent, AutomationRun, DryRunResult, EntityRef } from '@/types'
import { createRequestContext, type RequestContext } from '../core/context'
import { getMockState } from '../core/state'
import { getMockSession } from '../session'
import { clone } from '../core/util'
import { buildAutomationContext, resolveRelated } from './context-builder'
import { automationLookups } from './lookups'
import { runFrom } from './runner'

/**
 * Plays an automation against a sample record on a throwaway copy of the database and returns
 * what would happen. The copy is discarded, no events are emitted, and nothing real is written.
 */
export function dryRun(ctx: RequestContext, content: AutomationContent, entity: EntityRef): DryRunResult {
  const real = resolveRelated(ctx, entity)
  if (!real.lead && !real.deal) throw new ApiError('NOT_FOUND', 'Pick a lead or deal to test with.')

  const state = getMockState()
  const sandbox = createRequestContext(clone({ tables: state.tables, counters: state.counters }), getMockSession(), ctx.now)
  sandbox.dryRun = true

  const lookups = automationLookups(sandbox)
  const conditions = evaluateConditions(content.conditions, buildAutomationContext(sandbox, entity), lookups)
  const warnings: string[] = []
  if (!conditions.matched) {
    warnings.push('The conditions did not match this record, so the actions would not run.')
    return { matched: false, conditionTrace: conditions.trace, steps: [], waitsUntil: null, warnings }
  }

  const automation: Automation = {
    ...content,
    id: 'dry-run',
    tenantId: ctx.tenantId,
    status: 'published',
    enabled: true,
    version: 0,
    runCount: 0,
    lastRunAt: null,
    errorCount: 0,
    consecutiveFailures: 0,
    createdBy: ctx.actor.id,
    createdAt: ctx.timestamp,
    updatedAt: ctx.timestamp,
  }
  const run: AutomationRun = {
    id: 'dry-run',
    tenantId: ctx.tenantId,
    automationId: automation.id,
    automationName: content.name,
    automationVersion: 0,
    entity,
    eventId: 'dry-run',
    idempotencyKey: 'dry-run',
    chain: { chainId: 'dry-run', depth: 0, causedBy: [] },
    triggerType: content.trigger.type,
    triggerPayload: {},
    status: 'running',
    steps: [],
    conditionTrace: conditions.trace,
    cursor: 0,
    resumeAt: null,
    error: null,
    startedAt: ctx.timestamp,
    finishedAt: null,
  }
  const outcome = runFrom(sandbox, automation, run, { dryRun: true })
  if (run.error) warnings.push(run.error)
  return {
    matched: true,
    conditionTrace: conditions.trace,
    steps: run.steps,
    waitsUntil: outcome.firstWaitMs === null ? null : new Date(ctx.now.getTime() + outcome.firstWaitMs).toISOString(),
    warnings,
  }
}
