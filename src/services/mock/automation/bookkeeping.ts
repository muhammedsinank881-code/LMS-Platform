import { shouldAutoDisable } from '@/lib/automation'
import type { Automation, AutomationRun } from '@/types'
import type { RequestContext } from '../core/context'
import { notify, recordAudit } from '../core/records'
import { systemContext } from './system-context'

/** Counts a run that actually started (skipped runs are not counted). */
export function markStarted(ctx: RequestContext, automation: Automation): Automation {
  const fresh = ctx.db.get('automations', automation.id, 'Automation')
  return ctx.db.save('automations', { ...fresh, runCount: fresh.runCount + 1, lastRunAt: ctx.timestamp })
}

function recipients(ctx: RequestContext, automation: Automation): string[] {
  const admins = ctx.db.all('users').filter((u) => u.status === 'active' && (u.role === 'admin' || u.role === 'super_admin'))
  return [...new Set([automation.createdBy, ...admins.map((u) => u.id)].filter((id): id is string => Boolean(id)))]
}

/**
 * Updates failure counters, notifies the owner and admins of a failure, and disables an
 * automation after too many consecutive failures.
 */
export function markFinished(ctx: RequestContext, automation: Automation, run: AutomationRun): void {
  const fresh = ctx.db.find('automations', automation.id)
  if (!fresh) return
  if (run.status === 'succeeded') {
    if (fresh.consecutiveFailures !== 0) ctx.db.save('automations', { ...fresh, consecutiveFailures: 0 })
    return
  }
  if (run.status !== 'failed') return

  const consecutiveFailures = fresh.consecutiveFailures + 1
  const disable = shouldAutoDisable(consecutiveFailures) && fresh.enabled
  const saved = ctx.db.save('automations', {
    ...fresh,
    errorCount: fresh.errorCount + 1,
    consecutiveFailures,
    enabled: disable ? false : fresh.enabled,
  })
  for (const userId of recipients(ctx, saved)) {
    notify(
      ctx,
      userId,
      {
        type: 'automation_failed',
        title: `Automation failed: ${saved.name}`,
        body: run.error ?? 'A step failed.',
        link: `/automations?run=${run.id}`,
      },
      { includeActor: true },
    )
  }
  if (!disable) return
  for (const userId of recipients(ctx, saved)) {
    notify(
      ctx,
      userId,
      {
        type: 'automation_failed',
        title: `Automation paused: ${saved.name}`,
        body: `It was turned off after ${consecutiveFailures} failures in a row.`,
        link: `/automations/${saved.id}`,
      },
      { includeActor: true },
    )
  }
  recordAudit(systemContext(ctx, saved, run.chain), {
    action: 'updated',
    entity: 'automation',
    entityId: saved.id,
    entityLabel: saved.name,
    previousValue: { enabled: true },
    newValue: { enabled: false, reason: `Disabled after ${consecutiveFailures} consecutive failures` },
  })
}
