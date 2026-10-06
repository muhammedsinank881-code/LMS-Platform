import type { AuthApiClient, NotificationApiClient } from '@/services/api'
import { api } from '@/services/api'
import { getMockConfig, resetMockDb, setMockConfig } from '@/services/mock'

export { api }

/** Step 3 entry points, kept so existing auth and notification code is untouched. */
export const authApi: AuthApiClient = api.auth
export const notificationsApi: NotificationApiClient = api.notifications

/** Dev-only switches for the mock backend (latency, forced errors, reseeding). */
export const mockControls = { getMockConfig, setMockConfig, resetMockDb }
