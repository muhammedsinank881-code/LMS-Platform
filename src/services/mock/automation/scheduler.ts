import { latestScheduledSlot } from '@/lib/automation'
import type { Automation, AutomationTrigger } from '@/types'
import type { RequestContext } from '../core/context'
import { resumeRun } from './engine'
import { emit } from './event-bus'

const TICK_INTERVAL_MS = 30_000
const lastTicks = new Map<string, number>()

/** Forgets scheduler state (tests and workspace resets). */
export function resetScheduler(): void {
  lastTicks.clear()
}

type Of<T extends AutomationTrigger['type']> = Extract<AutomationTrigger, { type: T }>
const live = (automations: Automation[]) => automations.filter((a) => a.enabled && a.status === 'published')
const ofType = <T extends AutomationTrigger['type']>(automations: Automation[], type: T) =>
  live(automations).filter((a): a is Automation & { trigger: Of<T> } => a.trigger.type === type)

const MINUTES = { hours: 60, days: 1440 } as const

function emitNotContacted(ctx: RequestContext, automations: Automation[], from: number, to: number): void {
  const watchers = ofType(automations, 'lead_not_contacted')
  if (watchers.length === 0) return
  const open = new Set(ctx.db.all('leadStatuses').filter((s) => s.type === 'open').map((s) => s.id))
  for (const lead of ctx.db.all('leads')) {
    if (lead.archivedAt || !open.has(lead.statusId)) continue
    const last = Date.parse(lead.lastContactedAt ?? lead.createdAt)
    for (const { trigger } of watchers) {
      const idleAt = last + trigger.amount * MINUTES[trigger.unit] * 60_000
      if (idleAt <= from || idleAt > to) continue
      emit(ctx, {
        id: `idle:${lead.id}:${lead.lastContactedAt ?? lead.createdAt}`,
        type: 'lead_not_contacted',
        entity: { kind: 'lead', id: lead.id },
        data: { idleMinutes: Math.floor((to - last) / 60_000) },
      })
      break
    }
  }
}

function emitOverdue(ctx: RequestContext, automations: Automation[], from: number, to: number): void {
  if (ofType(automations, 'followup_overdue').length === 0) return
  for (const followUp of ctx.db.all('followUps')) {
    const due = Date.parse(followUp.dueAt)
    if (followUp.status === 'done' || due <= from || due > to) continue
    emit(ctx, {
      id: `overdue:${followUp.id}:${followUp.dueAt}`,
      type: 'followup_overdue',
      entity: { kind: 'followup', id: followUp.id },
      data: { followUpType: followUp.type },
    })
  }
}

function emitScheduled(ctx: RequestContext, automations: Automation[], from: number, to: number): void {
  for (const automation of ofType(automations, 'scheduled')) {
    const slot = latestScheduledSlot(automation.trigger, new Date(to))
    const at = slot.getTime()
    if (at <= from || at > to || at < Date.parse(automation.updatedAt)) continue
    emit(ctx, {
      id: `sched:${automation.id}:${slot.toISOString()}`,
      type: 'scheduled',
      entity: { kind: 'system', id: 'scheduler' },
      data: { firedAt: slot.toISOString() },
    })
  }
}

/**
 * The simulated scheduler: what a worker does on each tick. Resumes waiting runs whose time has
 * come and raises time-based events (idle leads, overdue follow-ups, schedules) for thresholds
 * crossed since the previous tick. The first tick only sets the baseline.
 */
export function tickAutomations(ctx: RequestContext, force = false): void {
  if (ctx.dryRun || ctx.automation) return
  const now = ctx.now.getTime()
  const last = lastTicks.get(ctx.tenantId)
  if (last === undefined || now < last) {
    lastTicks.set(ctx.tenantId, now)
    return
  }
  if (!force && now - last < TICK_INTERVAL_MS) return
  lastTicks.set(ctx.tenantId, now)

  const automations = ctx.db.all('automations')
  for (const run of ctx.db.all('automationRuns')) {
    if (run.status === 'waiting' && run.resumeAt && Date.parse(run.resumeAt) <= now) resumeRun(ctx, run)
  }
  emitNotContacted(ctx, automations, last, now)
  emitOverdue(ctx, automations, last, now)
  emitScheduled(ctx, automations, last, now)
}
