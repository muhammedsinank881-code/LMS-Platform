import type {
  Activity,
  ActivityPayload,
  AuditAction,
  AuditEntity,
  AuditLog,
  AuditValue,
  DealId,
  LeadId,
  Notification,
  NotificationType,
} from '@/types'
import type { RequestContext } from './context'
import { newId } from './util'

interface ActivityOptions {
  /** Defaults to the acting user. Pass null for system events. */
  actorId?: string | null
  dealId?: DealId | null
}

/** Appends an event to a lead's timeline. */
export function recordActivity(
  ctx: RequestContext,
  leadId: LeadId,
  payload: ActivityPayload,
  options: ActivityOptions = {},
): Activity {
  return ctx.db.insert('activities', {
    id: newId('act'),
    leadId,
    dealId: options.dealId ?? null,
    actorId: ctx.automation || ctx.system ? null : options.actorId === undefined ? ctx.actor.id : options.actorId,
    ...(ctx.automation && { automation: { id: ctx.automation.id, name: ctx.automation.name } }),
    createdAt: ctx.timestamp,
    ...payload,
  })
}

interface AuditEntry {
  action: AuditAction
  entity: AuditEntity
  entityId: string
  entityLabel: string
  previousValue?: AuditValue | null
  newValue?: AuditValue | null
}

/** Writes an audit log entry for the acting user. */
export function recordAudit(ctx: RequestContext, entry: AuditEntry): AuditLog {
  return ctx.db.insert('auditLogs', {
    id: newId('audit'),
    userId: ctx.automation || ctx.system ? 'system' : ctx.actor.id,
    ...(ctx.system && { actorType: 'system' as const, actorLabel: ctx.system.label }),
    ...(ctx.automation && {
      actorType: 'system' as const,
      actorLabel: `Automation: ${ctx.automation.name}`,
      automationId: ctx.automation.id,
    }),
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    entityLabel: entry.entityLabel,
    previousValue: entry.previousValue ?? null,
    newValue: entry.newValue ?? null,
    ip: '127.0.0.1',
    device: 'Mock browser',
    createdAt: ctx.timestamp,
  })
}

interface NotificationEntry {
  type: NotificationType
  title: string
  body: string
  link: string
}

interface NotifyOptions {
  /** System events (a deal the actor just closed, their own import) still notify them. */
  includeActor?: boolean
}

/** Tells a user something happened. Own actions are skipped unless `includeActor` is set. */
export function notify(
  ctx: RequestContext,
  userId: string | null | undefined,
  entry: NotificationEntry,
  options: NotifyOptions = {},
): Notification | null {
  if (!userId || (!options.includeActor && userId === ctx.actor.id)) return null
  const prefs = ctx.db.all('notificationPreferences').find((row) => row.userId === userId)
  const channel = prefs?.channels.find((item) => item.type === entry.type)
  if (channel && !channel.inApp) return null
  const existing = ctx.db
    .all('notifications')
    .find((item) => item.userId === userId && item.readAt === null && item.type === entry.type && item.link === entry.link)
  if (existing) return existing
  return ctx.db.insert('notifications', {
    id: newId('notif'),
    userId,
    ...entry,
    readAt: null,
    createdAt: ctx.timestamp,
  })
}

/** The fields that differ between two versions of a record, as before/after audit values. */
export function diffValues(
  before: object,
  after: object,
  fields: readonly string[],
): { previousValue: AuditValue; newValue: AuditValue } | null {
  const previousValue: AuditValue = {}
  const newValue: AuditValue = {}
  for (const field of fields) {
    const a = (before as Record<string, unknown>)[field]
    const b = (after as Record<string, unknown>)[field]
    if (JSON.stringify(a) === JSON.stringify(b)) continue
    previousValue[field] = toAuditValue(a)
    newValue[field] = toAuditValue(b)
  }
  return Object.keys(newValue).length > 0 ? { previousValue, newValue } : null
}

function toAuditValue(value: unknown): AuditValue[string] {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) return value.map(String)
  return JSON.stringify(value)
}
