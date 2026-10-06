import { addMinutes } from 'date-fns'
import { createFollowUpRecord } from '../../resources/followups'
import { createTaskRecord } from '../../resources/tasks'
import { fallbackUserId, interpolate, leadOf, type ExecutorGroup } from './types'

const dueAt = (now: Date, hours: number) => addMinutes(now, Math.round(hours * 60)).toISOString()

export const taskExecutors: ExecutorGroup<'create_followup' | 'create_task'> = {
  create_followup(ctx, action, target, automation) {
    const lead = leadOf(ctx, target)
    const followUp = createFollowUpRecord(ctx, {
      leadId: lead.id,
      type: action.followUpType,
      dueAt: dueAt(ctx.now, action.dueInHours),
      assigneeId: fallbackUserId(ctx, lead, automation),
      priority: action.priority,
      notes: `Created by ${automation.name}`,
      dealId: target.dealId ?? undefined,
    })
    return `Created a ${followUp.type} follow-up due ${followUp.dueAt}`
  },
  create_task(ctx, action, target, automation) {
    const lead = target.leadId ? leadOf(ctx, target) : null
    const title = interpolate(ctx, action.title, target)
    const task = createTaskRecord(ctx, {
      title,
      description: `Created by ${automation.name}`,
      dueAt: dueAt(ctx.now, action.dueInHours),
      priority: action.priority,
      assigneeId: fallbackUserId(ctx, lead, automation),
      leadId: lead?.id,
      dealId: target.dealId ?? undefined,
    })
    return `Created task "${task.title}"`
  },
}
