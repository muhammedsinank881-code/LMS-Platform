import { isQuietNow } from '@/lib/date-range'
import { NOTIFICATION_TYPES, type NotificationPreferences, type NotificationType } from '@/types'

export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    channels: NOTIFICATION_TYPES.map((type) => ({ type, inApp: true, email: false, push: false })),
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
  }
}

export function inAppEnabled(prefs: NotificationPreferences, type: NotificationType): boolean {
  return prefs.channels.find((channel) => channel.type === type)?.inApp !== false
}

/** Quiet hours apply to reminder creation, not to assignment or deal events. */
export function reminderSuppressed(prefs: NotificationPreferences, type: NotificationType, now: Date): boolean {
  if (type !== 'followup_due' && type !== 'followup_overdue') return false
  return isQuietNow(prefs.quietHours, now)
}

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/

export function normalizePreferences(input: NotificationPreferences): NotificationPreferences {
  const defaults = defaultNotificationPreferences()
  const quiet = input.quietHours
  return {
    channels: defaults.channels.map((channel) => {
      const next = input.channels.find((item) => item.type === channel.type)
      return next
        ? { type: channel.type, inApp: Boolean(next.inApp), email: Boolean(next.email), push: Boolean(next.push) }
        : channel
    }),
    quietHours: {
      enabled: Boolean(quiet?.enabled),
      start: CLOCK.test(quiet?.start ?? '') ? quiet.start : defaults.quietHours.start,
      end: CLOCK.test(quiet?.end ?? '') ? quiet.end : defaults.quietHours.end,
    },
  }
}
