import type { ApiKeysApiClient } from './api-keys'
import type { AuditLogsApiClient } from './audit-logs'
import type { IntegrationsApiClient } from './integrations'
import type { LeadFormsApiClient } from './lead-forms'
import type { WebhooksApiClient } from './webhooks'
import type { AuthApiClient } from './auth'
import type { AutomationsApiClient } from './automations'
import type { CallLogsApiClient } from './call-logs'
import type { AdSetsApiClient } from './ad-sets'
import type { BroadcastsApiClient } from './broadcasts'
import type { CampaignsApiClient } from './campaigns'
import type { PerformanceApiClient } from './performance'
import type { SpendApiClient } from './spend'
import type { SourcesApiClient, StatusesApiClient } from './config'
import type { ConversationsApiClient } from './conversations'
import type { CustomersApiClient } from './customers'
import type { DealsApiClient } from './deals'
import type { FollowUpsApiClient } from './followups'
import type { LeadsApiClient } from './leads'
import type { NotificationApiClient } from './notifications'
import type { PipelinesApiClient } from './pipelines'
import type { ReportsApiClient } from './reports'
import type { SavedViewsApiClient } from './saved-views'
import type { SettingsApiClient } from './settings'
import type { TasksApiClient } from './tasks'
import type { TeamApiClient } from './team'
import type { QuickRepliesApiClient } from './quick-replies'
import type { SimulatorApiClient } from './simulator'
import type { TemplatesApiClient } from './templates'
import type { StudentProfileApiClient } from './student-profile'
import type { StudentJobsApiClient } from './student-jobs'

/** Every resource the app talks to. A backend implements this once; the UI never sees which. */
export interface Api {
  auth: AuthApiClient
  leads: LeadsApiClient
  followUps: FollowUpsApiClient
  tasks: TasksApiClient
  deals: DealsApiClient
  customers: CustomersApiClient
  pipelines: PipelinesApiClient
  statuses: StatusesApiClient
  sources: SourcesApiClient
  campaigns: CampaignsApiClient
  adSets: AdSetsApiClient
  spend: SpendApiClient
  broadcasts: BroadcastsApiClient
  performance: PerformanceApiClient
  conversations: ConversationsApiClient
  templates: TemplatesApiClient
  quickReplies: QuickRepliesApiClient
  callLogs: CallLogsApiClient
  simulator: SimulatorApiClient
  automations: AutomationsApiClient
  notifications: NotificationApiClient
  auditLogs: AuditLogsApiClient
  savedViews: SavedViewsApiClient
  team: TeamApiClient
  settings: SettingsApiClient
  studentProfile: StudentProfileApiClient
  studentJobs: StudentJobsApiClient
  reports: ReportsApiClient
  integrations: IntegrationsApiClient
  leadForms: LeadFormsApiClient
  apiKeys: ApiKeysApiClient
  webhooks: WebhooksApiClient
}
