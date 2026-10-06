import type { User } from '@/types'
import type { RequestContext } from '../../core/context'
import { notify } from '../../core/records'
import { interpolate, type ExecTarget, type ExecutorGroup } from './types'

function linkFor(target: ExecTarget, automationId: string): string {
  const path = target.dealId ? `/deals/${target.dealId}` : target.leadId ? `/leads/${target.leadId}` : '/automations'
  return `${path}?automation=${automationId}`
}

function send(ctx: RequestContext, users: User[], message: string, target: ExecTarget, automation: { id: string; name: string }): number {
  let sent = 0
  for (const user of users) {
    const made = notify(
      ctx,
      user.id,
      { type: 'automation_alert', title: automation.name, body: message, link: linkFor(target, automation.id) },
      { includeActor: true },
    )
    if (made) sent += 1
  }
  return sent
}

function managersFor(ctx: RequestContext, teamId: string | null): User[] {
  const active = ctx.db.all('users').filter((u) => u.status === 'active')
  const managers = active.filter(
    (u) => u.role === 'manager' || (u.role === 'team_leader' && (!teamId || u.teamId === teamId)),
  )
  return managers.length ? managers : active.filter((u) => u.role === 'admin' || u.role === 'super_admin')
}

export const notifyExecutors: ExecutorGroup<'notify_user' | 'notify_team'> = {
  notify_user(ctx, action, target, automation) {
    const lead = target.leadId ? ctx.db.find('leads', target.leadId) : undefined
    const userId = action.userId === 'assignee' ? (lead?.assignedTo ?? automation.createdBy) : action.userId
    const user = userId ? ctx.db.find('users', userId) : undefined
    if (!user) throw new Error('There is nobody to notify: the lead has no owner.')
    send(ctx, [user], interpolate(ctx, action.message, target), target, automation)
    return `Notified ${user.name}`
  },
  notify_team(ctx, action, target, automation) {
    const lead = target.leadId ? ctx.db.find('leads', target.leadId) : undefined
    const owner = lead?.assignedTo ? ctx.db.find('users', lead.assignedTo) : undefined
    const teamId = action.teamId ?? owner?.teamId ?? null
    const users =
      action.target === 'manager'
        ? managersFor(ctx, teamId)
        : ctx.db.all('users').filter((u) => u.status === 'active' && (!teamId || u.teamId === teamId))
    if (users.length === 0) throw new Error('Nobody matched to notify.')
    send(ctx, users, interpolate(ctx, action.message, target), target, automation)
    return `Notified ${users.map((u) => u.name).join(', ')}`
  },
}
