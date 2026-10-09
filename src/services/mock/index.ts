import type { Api } from '@/services/api/api'
import { registerAutomationEngine } from './automation/register'
import { registerWebhookDispatcher } from './webhooks/dispatcher'
import { mockApiKeysApi } from './resources/api-keys'
import { mockIntegrationsApi } from './resources/integrations'
import { mockLeadFormsApi } from './resources/lead-forms'
import { mockWebhooksApi } from './resources/webhooks'
import { mockAuthApi } from './auth/mock-auth-api'
import { mockNotificationsApi } from './notifications/mock-notifications-api'
import { mockAdSetsApi } from './resources/ad-sets'
import { mockBroadcastsApi } from './resources/broadcasts'
import { mockCampaignsApi } from './resources/campaigns'
import { mockPerformanceApi } from './resources/performance'
import { mockSpendApi } from './resources/spend'
import { mockCallLogsApi } from './resources/call-logs'
import { mockSourcesApi, mockStatusesApi, mockTemplatesApi } from './resources/config'
import { mockConversationsApi } from './resources/conversations'
import { mockQuickRepliesApi } from './resources/quick-replies'
import { mockSimulatorApi } from './resources/simulator'
import { mockCustomersApi } from './resources/customers'
import { mockDealsApi } from './resources/deals'
import { mockFollowUpsApi } from './resources/followups'
import { mockLeadsApi } from './resources/leads'
import { mockPipelinesApi } from './resources/pipelines'
import { mockReportsApi } from './resources/reports'
import { mockAuditLogsApi } from './resources/audit-logs'
import { mockAutomationsApi } from './resources/automations'
import { mockSavedViewsApi } from './resources/saved-views'
import { mockSettingsApi } from './resources/settings'
import { mockTasksApi } from './resources/tasks'
import { mockTeamApi } from './resources/team'
import { mockStudentProfileApi } from './resources/student-profile'
import { mockStudentJobsApi } from './resources/student-jobs'

registerAutomationEngine()
registerWebhookDispatcher()

/** The complete mock backend. `services/api/index.ts` binds this to `api`. */
export const mockApi: Api = {
  auth: mockAuthApi,
  leads: mockLeadsApi,
  followUps: mockFollowUpsApi,
  tasks: mockTasksApi,
  deals: mockDealsApi,
  customers: mockCustomersApi,
  pipelines: mockPipelinesApi,
  statuses: mockStatusesApi,
  sources: mockSourcesApi,
  campaigns: mockCampaignsApi,
  adSets: mockAdSetsApi,
  spend: mockSpendApi,
  broadcasts: mockBroadcastsApi,
  performance: mockPerformanceApi,
  conversations: mockConversationsApi,
  templates: mockTemplatesApi,
  quickReplies: mockQuickRepliesApi,
  callLogs: mockCallLogsApi,
  simulator: mockSimulatorApi,
  automations: mockAutomationsApi,
  notifications: mockNotificationsApi,
  auditLogs: mockAuditLogsApi,
  savedViews: mockSavedViewsApi,
  team: mockTeamApi,
  settings: mockSettingsApi,
  studentProfile: mockStudentProfileApi,
  studentJobs: mockStudentJobsApi,
  reports: mockReportsApi,
  integrations: mockIntegrationsApi,
  leadForms: mockLeadFormsApi,
  apiKeys: mockApiKeysApi,
  webhooks: mockWebhooksApi,
}

export { resetMockDb } from './core/state'
export {
  advanceMockClock,
  getMockClockOffset,
  getMockConfig,
  resetMockClock,
  setMockClock,
  setMockConfig,
} from './config'
export type { MockConfig } from './config'
export { setMockSessionResolver } from './session'
