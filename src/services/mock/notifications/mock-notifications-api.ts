import { defaultNotificationPreferences, inAppEnabled, normalizePreferences, reminderSuppressed } from '@/lib/notification-prefs'
import { ApiError } from '@/services/api/errors'
import type { NotificationApiClient } from '@/services/api/notifications'
import {
  NOTIFICATION_TYPES,
  type CreateNotificationInput,
  type Notification,
  type NotificationFilterField,
  type NotificationPreferences,
} from '@/types'
import { request, type RequestContext } from '../core/context'
import { applyListParams, propertyValue, type ListSpec } from '../core/list-engine'
import { newId } from '../core/util'
import { validationError } from '../core/validate'

const FIELDS: readonly NotificationFilterField[] = ['type', 'readAt', 'createdAt']

/** Notifications are private: every query is limited to the caller's own. */
const mine = (ctx: RequestContext): Notification[] =>
  ctx.db.all('notifications').filter((n) => n.userId === ctx.actor.id)

function ownedBy(ctx: RequestContext, ids: readonly string[]): Notification[] {
  const own = mine(ctx)
  return ids.map((id) => {
    const found = own.find((n) => n.id === id)
    // Someone else's notification looks the same as one that does not exist.
    if (!found) throw new ApiError('NOT_FOUND', 'Notification not found.')
    return found
  })
}

function setRead(ctx: RequestContext, ids: readonly string[], read: boolean): void {
  for (const notification of ownedBy(ctx, ids)) {
    ctx.db.save('notifications', { ...notification, readAt: read ? ctx.timestamp : null })
  }
}

const spec = (ctx: RequestContext): ListSpec<Notification, NotificationFilterField> => ({
  fields: FIELDS,
  value: propertyValue,
  searchable: (n) => [n.title, n.body],
  defaultSort: [{ field: 'createdAt', direction: 'desc' }],
  now: ctx.now,
})

function createNotification(ctx: RequestContext, input: CreateNotificationInput): Notification {
  const title = input.title.trim()
  const body = input.body.trim()
  const link = input.link.trim()
  if (!title) throw validationError('title', 'Add a title.')
  if (!link.startsWith('/')) throw validationError('link', 'Link must be an in-app path.')
  if (!NOTIFICATION_TYPES.includes(input.type)) throw validationError('type', 'Unknown notification type.')
  const existing = mine(ctx).find((item) => item.readAt === null && item.type === input.type && item.link === link)
  if (existing) return existing
  const prefs = readPreferences(ctx)
  if (!inAppEnabled(prefs, input.type) || reminderSuppressed(prefs, input.type, ctx.now)) {
    return { id: newId('notif'), userId: ctx.actor.id, type: input.type, title, body, link, readAt: ctx.timestamp, createdAt: ctx.timestamp, tenantId: ctx.tenantId }
  }
  return ctx.db.insert('notifications', {
    id: newId('notif'),
    userId: ctx.actor.id,
    type: input.type,
    title,
    body,
    link,
    readAt: null,
    createdAt: ctx.timestamp,
  })
}

function readPreferences(ctx: RequestContext): NotificationPreferences {
  const saved = ctx.db.all('notificationPreferences').find((row) => row.userId === ctx.actor.id)
  return saved ?? defaultNotificationPreferences()
}

export const mockNotificationsApi: NotificationApiClient = {
  getUnreadCount: (tenantId) =>
    request((ctx) => {
      if (tenantId !== ctx.tenantId) {
        throw new ApiError('FORBIDDEN', 'You are not signed in to that workspace.')
      }
      return mine(ctx).filter((n) => n.readAt === null).length
    }),
  list: (params) =>
    request((ctx) => applyListParams(mine(ctx), params, spec(ctx), 'notifications')),
  create: (input) => request((ctx) => createNotification(ctx, input)),
  markRead: (ids) => request((ctx) => setRead(ctx, ids, true)),
  markUnread: (ids) => request((ctx) => setRead(ctx, ids, false)),
  markAllRead: () =>
    request((ctx) => {
      setRead(
        ctx,
        mine(ctx)
          .filter((n) => n.readAt === null)
          .map((n) => n.id),
        true,
      )
    }),
  delete: (ids) =>
    request((ctx) => {
      for (const notification of ownedBy(ctx, ids)) ctx.db.remove('notifications', notification.id)
    }),
  getPreferences: () => request((ctx) => readPreferences(ctx)),
  updatePreferences: (input) =>
    request((ctx) => {
      const next = normalizePreferences(input)
      const existing = ctx.db.all('notificationPreferences').find((row) => row.userId === ctx.actor.id)
      if (existing) return ctx.db.save('notificationPreferences', { ...existing, ...next, userId: ctx.actor.id })
      return ctx.db.insert('notificationPreferences', { id: ctx.actor.id, userId: ctx.actor.id, ...next })
    }),
}
