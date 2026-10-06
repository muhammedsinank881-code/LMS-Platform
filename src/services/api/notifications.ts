import type {
  CreateNotificationInput,
  Notification,
  NotificationListParams,
  NotificationPreferences,
  Paginated,
} from '@/types'

export interface NotificationApiClient {
  /** Unread notifications for the signed-in user in the given workspace. */
  getUnreadCount(tenantId: string): Promise<number>
  /** The signed-in user's notifications, newest first. */
  list(params?: NotificationListParams): Promise<Paginated<Notification>>
  /**
   * Stores a notification for the signed-in user.
   * Returns the existing unread row when the same type and link are already unread.
   */
  create(input: CreateNotificationInput): Promise<Notification>
  markRead(ids: string[]): Promise<void>
  markUnread(ids: string[]): Promise<void>
  markAllRead(): Promise<void>
  delete(ids: string[]): Promise<void>
  getPreferences(): Promise<NotificationPreferences>
  updatePreferences(input: NotificationPreferences): Promise<NotificationPreferences>
}
