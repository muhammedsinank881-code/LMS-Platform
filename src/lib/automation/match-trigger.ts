import type { Automation, AutomationTrigger, DomainEvent } from '@/types'
import { isScheduledSlot } from './schedule'

const anyOrEqual = (expected: string | null | undefined, actual: string | null | undefined) =>
  expected == null || expected === actual

const MINUTES = { hours: 60, days: 1440 } as const

function crossed(trigger: Extract<AutomationTrigger, { type: 'score_crossed' }>, event: DomainEvent): boolean {
  const { fromScore: from, toScore: to } = event.data
  if (from === undefined || to === undefined) return false
  const up = from < trigger.threshold && to >= trigger.threshold
  const down = from >= trigger.threshold && to < trigger.threshold
  if (trigger.direction === 'up') return up
  if (trigger.direction === 'down') return down
  return up || down
}

/** Whether a domain event should start this automation. Pure; conditions are checked later. */
export function matchTrigger(event: DomainEvent, automation: Pick<Automation, 'trigger'>): boolean {
  const trigger = automation.trigger
  if (event.type !== trigger.type) return false
  const { data } = event
  switch (trigger.type) {
    case 'lead_created':
      return trigger.sourceIds.length === 0 || trigger.sourceIds.includes(data.sourceId ?? '')
    case 'lead_updated':
      return data.changedFields?.includes(trigger.field) ?? false
    case 'status_changed':
      return anyOrEqual(trigger.fromStatusId, data.fromStatusId) && anyOrEqual(trigger.toStatusId, data.toStatusId)
    case 'lead_assigned':
      return anyOrEqual(trigger.toUserId, data.toUserId)
    case 'score_crossed':
      return crossed(trigger, event)
    case 'lead_not_contacted':
      return (data.idleMinutes ?? -1) >= trigger.amount * MINUTES[trigger.unit]
    case 'followup_completed':
      return anyOrEqual(trigger.followUpType, data.followUpType)
    case 'deal_stage_changed':
      return (
        anyOrEqual(trigger.pipelineId, data.pipelineId) &&
        anyOrEqual(trigger.fromStageId, data.fromStageId) &&
        anyOrEqual(trigger.toStageId, data.toStageId)
      )
    case 'message_received':
      return trigger.channel === null || trigger.channel === data.channel
    case 'form_submitted':
      return anyOrEqual(trigger.formId, data.formId)
    case 'scheduled':
      return data.firedAt !== undefined && isScheduledSlot(trigger, data.firedAt)
    case 'followup_overdue':
    case 'deal_won':
    case 'deal_lost':
    case 'import_completed':
      return true
  }
}
