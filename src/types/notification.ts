import type { ListParams, TenantOwned } from './common'
import type { NotificationId, UserId } from './ids'

export const NOTIFICATION_TYPES = [
  'lead_assigned',
  'followup_due',
  'followup_overdue',
  'whatsapp_reply',
  'email_received',
  'lead_uncontacted',
  'leads_overdue',
  'response_time_increased',
  'deal_won',
  'deal_lost',
  'import_finished',
  'merge_completed',
  'mention',
  'automation_alert',
  'automation_failed',
  'integration_alert',
  'form_submission',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_GROUPS = {
  leads: ['lead_assigned', 'lead_uncontacted'],
  followups: ['followup_due', 'followup_overdue', 'leads_overdue'],
  messages: ['whatsapp_reply', 'email_received'],
  deals: ['deal_won', 'deal_lost'],
  system: [
    'import_finished',
    'merge_completed',
    'response_time_increased',
    'mention',
    'automation_alert',
    'automation_failed',
    'integration_alert',
    'form_submission',
  ],
} as const
export type NotificationGroup = keyof typeof NOTIFICATION_GROUPS

export interface NotificationChannelPreference {
  type: NotificationType
  inApp: boolean
  email: boolean
  push: boolean
}

export interface QuietHours {
  enabled: boolean
  /** 24-hour `HH:mm` in the workspace timezone. */
  start: string
  end: string
}

export interface NotificationPreferences {
  channels: NotificationChannelPreference[]
  quietHours: QuietHours
}

export interface Notification extends TenantOwned {
  id: NotificationId
  /** Recipient. Notifications are always private to this user. */
  userId: UserId
  type: NotificationType
  title: string
  body: string
  /** In-app route to open, e.g. /leads/L-10231. */
  link: string
  readAt: string | null
  createdAt: string
}

export type NotificationFilterField = 'type' | 'readAt' | 'createdAt'
export type NotificationListParams = ListParams<NotificationFilterField>

export interface CreateNotificationInput {
  type: NotificationType
  title: string
  body: string
  /** In-app route, e.g. /follow-ups?bucket=overdue. */
  link: string
}
