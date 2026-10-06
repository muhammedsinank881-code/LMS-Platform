import { addDays, endOfDay, startOfDay } from 'date-fns'
import {
  toTaskId,
  type Deal,
  type FollowUp,
  type FollowUpType,
  type Lead,
  type Priority,
  type Task,
  type TaskStatus,
} from '@/types'
import { STATUS_DEFS } from './config-data'
import { assignableUsers, type SeedContext, type SeedWork } from './context'
import { FOLLOW_UP_NOTES, TASK_TITLES } from './indian-chat'
import {
  DAY,
  HOUR,
  MINUTE,
  chance,
  int,
  pick,
  scaled,
  seedId,
  shuffle,
  weighted,
  type SeedEnv,
} from './rng'

type Kind = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'done'

/** 80 follow-ups in the full dataset: the buckets the follow-ups page and dashboard show. */
const FOLLOW_UP_PLAN: Array<[Kind, number]> = [
  ['overdue', 20],
  ['today', 16],
  ['tomorrow', 12],
  ['upcoming', 22],
  ['done', 10],
]

const TYPE_WEIGHTS: Array<{ value: FollowUpType; weight: number }> = [
  { value: 'call', weight: 40 },
  { value: 'whatsapp', weight: 25 },
  { value: 'email', weight: 10 },
  { value: 'meeting', weight: 8 },
  { value: 'demo', weight: 7 },
  { value: 'reminder', weight: 6 },
  { value: 'task', weight: 4 },
]

const PRIORITY_WEIGHTS: Array<{ value: Priority; weight: number }> = [
  { value: 'low', weight: 2 },
  { value: 'medium', weight: 5 },
  { value: 'high', weight: 3 },
  { value: 'urgent', weight: 1 },
]

const COMPLETION_NOTES = [
  'Spoke to the client; sending the quotation today.',
  'Shared details on WhatsApp. Waiting for a reply.',
  'Demo done, client wants a revised proposal.',
  'Client asked to call again next month.',
] as const

/** When a follow-up in each bucket falls due. */
function dueFor(env: SeedEnv, kind: Kind): Date {
  const now = env.now
  const day = startOfDay(now)
  switch (kind) {
    case 'overdue':
      return new Date(now.getTime() - int(env, 20 * MINUTE, 6 * DAY))
    case 'done':
      return new Date(now.getTime() - int(env, 4 * HOUR, 14 * DAY))
    case 'today': {
      const remaining = endOfDay(now).getTime() - now.getTime()
      return new Date(
        now.getTime() + Math.max(MINUTE, Math.round(remaining * (int(env, 10, 90) / 100))),
      )
    }
    case 'tomorrow':
      return new Date(addDays(day, 1).getTime() + 9 * HOUR + int(env, 0, 9 * HOUR))
    case 'upcoming':
      return new Date(addDays(day, int(env, 2, 10)).getTime() + 9 * HOUR + int(env, 0, 8 * HOUR))
  }
}

const OPEN_STATUS_SLUGS = new Set(
  STATUS_DEFS.filter(([, , , type]) => type === 'open').map(([slug]) => slug),
)

export function buildWork(env: SeedEnv, ctx: SeedContext, deals: readonly Deal[]): SeedWork {
  const { leads, bases } = ctx
  const now = env.now.getTime()
  const openIds = new Set([...OPEN_STATUS_SLUGS].map((slug) => seedId(env, 'status', slug)))
  const pool = shuffle(
    env,
    leads.filter((l) => !l.archivedAt && l.assignedTo !== null && openIds.has(l.statusId)),
  )
  let cursor = 0
  const nextLead = (): Lead => pool[cursor++ % pool.length]

  const followUps: FollowUp[] = []
  for (const [kind, base] of FOLLOW_UP_PLAN) {
    for (let i = 0; i < scaled(env, base, 1); i++) {
      const lead = nextLead()
      const dueAt = dueFor(env, kind)
      const done = kind === 'done'
      const completedAt = done
        ? new Date(Math.min(now, dueAt.getTime() + int(env, -30 * MINUTE, 3 * HOUR)))
        : null
      followUps.push({
        id: seedId(env, 'followup', followUps.length + 1),
        tenantId: env.tenantId,
        leadId: lead.id,
        dealId: deals.find((d) => d.leadId === lead.id)?.id ?? null,
        type: weighted(env, TYPE_WEIGHTS),
        dueAt: dueAt.toISOString(),
        assigneeId: lead.assignedTo ?? ctx.users[0].id,
        priority: weighted(env, PRIORITY_WEIGHTS),
        status: done ? 'done' : 'pending',
        notes: pick(env, FOLLOW_UP_NOTES),
        reminderOffsetMinutes: 15,
        completedAt: completedAt?.toISOString() ?? null,
        completionNote: done ? pick(env, COMPLETION_NOTES) : null,
        createdBy: lead.assignedTo,
        createdAt: new Date(
          Math.min(now, dueAt.getTime(), Date.parse(lead.createdAt) + int(env, HOUR, 3 * DAY)),
        ).toISOString(),
      })
    }
  }
  followUps.sort((a, b) => a.dueAt.localeCompare(b.dueAt))

  // A lead's next follow-up is its earliest pending one.
  const nextByLead = new Map<string, string>()
  for (const f of followUps) {
    if (f.status === 'pending' && !nextByLead.has(f.leadId)) nextByLead.set(f.leadId, f.dueAt)
  }
  for (const lead of leads) lead.nextFollowUpAt = nextByLead.get(lead.id) ?? null

  return { followUps, tasks: buildTasks(env, ctx, deals, bases.task) }
}

type TaskPlan = [state: 'done' | 'in_progress' | 'overdue' | 'open', count: number]

const TASK_PLAN: TaskPlan[] = [
  ['done', 6],
  ['in_progress', 5],
  ['overdue', 5],
  ['open', 8],
]

function buildTasks(env: SeedEnv, ctx: SeedContext, deals: readonly Deal[], base: number): Task[] {
  const now = env.now.getTime()
  const owners = assignableUsers(ctx.users)
  const tasks: Task[] = []
  for (const [state, planned] of TASK_PLAN) {
    for (let i = 0; i < scaled(env, planned, 1); i++) {
      const assignee = pick(env, owners)
      const deal = deals.length > 0 && chance(env, 0.4) ? pick(env, deals) : null
      const lead = deal
        ? null
        : pick(
            env,
            ctx.leads.filter((l) => !l.archivedAt),
          )
      const dueAt =
        state === 'overdue' || state === 'done'
          ? now - int(env, 2 * HOUR, 8 * DAY)
          : now + int(env, 3 * HOUR, 9 * DAY)
      const status: TaskStatus = state === 'overdue' ? 'open' : state
      const title = pick(env, TASK_TITLES)
      tasks.push({
        id: toTaskId(base + tasks.length + 1),
        tenantId: env.tenantId,
        title,
        description: `${title}. Keep the lead's timeline updated once this is done.`,
        dueAt: new Date(dueAt).toISOString(),
        priority: weighted(env, PRIORITY_WEIGHTS),
        assigneeId: assignee.id,
        status,
        reminderAt: status === 'done' ? null : new Date(dueAt - HOUR).toISOString(),
        leadId: deal?.leadId ?? lead?.id ?? null,
        dealId: deal?.id ?? null,
        completedAt:
          status === 'done'
            ? new Date(Math.min(now, dueAt + int(env, 0, 4 * HOUR))).toISOString()
            : null,
        createdBy: assignee.id,
        createdAt: new Date(dueAt - int(env, 1, 6) * DAY).toISOString(),
      })
    }
  }
  return tasks.sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? ''))
}
