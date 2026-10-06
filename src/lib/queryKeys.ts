import type {
  ActivityListParams,
  AuditLogListParams,
  AutomationListParams,
  AutomationRunListParams,
  CallLogListParams,
  CampaignListParams,
  CompanyListParams,
  ConversationListParams,
  CustomerListParams,
  DealListParams,
  DuplicateProbe,
  FollowUpListParams,
  LeadListParams,
  ListParams,
  NotificationListParams,
  ReportQuery,
  SavedViewEntity,
  SpendListParams,
  TaskListParams,
} from '@/types'

/** Who the cached data belongs to. Anything that changes what the API returns belongs here. */
export interface WorkspaceScope {
  tenantId: string
  userId: string
  /** The acting role, because data scope (own / team / all) changes with it. */
  role: string
}

/** Small, bounded workspace configuration that is fetched whole. */
export const CONFIG_NAMES = [
  'statuses',
  'sources',
  'templates',
  'quickReplies',
  'tags',
  'customFields',
  'scoringRules',
  'qualificationQuestions',
  'assignmentRules',
  'lostReasons',
] as const
export type ConfigName = (typeof CONFIG_NAMES)[number]

/** Not tied to a workspace (the user may not be signed in yet). */
export const authKeys = {
  invitation: (token: string) => ['auth', 'invitation', token] as const,
}

/**
 * Key factory for everything inside a workspace. Every key starts with
 * `['ws', tenantId, userId, role]`, so two workspaces, two users or two roles can never share a
 * cache entry, and one prefix addresses a whole resource: `keys.leads.all` covers its lists,
 * details and activities.
 */
export function createQueryKeys({ tenantId, userId, role }: WorkspaceScope) {
  const root = ['ws', tenantId, userId, role] as const
  const key = <R extends string, A extends readonly unknown[]>(resource: R, ...rest: A) =>
    [...root, resource, ...rest] as const
  const params = <P extends ListParams>(p: P | undefined) => p ?? ({} as P)

  return {
    root,
    leads: {
      all: key('leads'),
      lists: key('leads', 'list'),
      list: (p?: LeadListParams) => key('leads', 'list', params(p)),
      stageSummary: (p?: LeadListParams) => key('leads', 'stage-summary', params(p)),
      detail: (id: string) => key('leads', 'detail', id),
      activities: (id: string, p?: ActivityListParams) => key('leads', 'activities', id, params(p)),
      /** Prefix for every activity query of one lead, including infinite pages. */
      activityLists: (id: string) => key('leads', 'activities', id),
      pinnedNotes: (id: string) => key('leads', 'pinned-notes', id),
      relations: (id: string) => key('leads', 'relations', id),
      duplicateGroups: key('leads', 'duplicate-groups'),
      duplicateCheck: (probe: DuplicateProbe, excludeId?: string) =>
        key('leads', 'duplicate-check', probe, excludeId ?? null),
    },
    followUps: {
      all: key('followUps'),
      lists: key('followUps', 'list'),
      list: (p?: FollowUpListParams) => key('followUps', 'list', params(p)),
      detail: (id: string) => key('followUps', 'detail', id),
      buckets: (p?: FollowUpListParams) => key('followUps', 'buckets', params(p)),
    },
    tasks: {
      all: key('tasks'),
      lists: key('tasks', 'list'),
      list: (p?: TaskListParams) => key('tasks', 'list', params(p)),
      detail: (id: string) => key('tasks', 'detail', id),
    },
    deals: {
      all: key('deals'),
      lists: key('deals', 'list'),
      list: (p?: DealListParams) => key('deals', 'list', params(p)),
      detail: (id: string) => key('deals', 'detail', id),
      summary: (p?: DealListParams) => key('deals', 'summary', params(p)),
      activities: (id: string, p?: ActivityListParams) => key('deals', 'activities', id, params(p)),
    },
    customers: {
      all: key('customers'),
      lists: key('customers', 'list'),
      list: (p?: CustomerListParams) => key('customers', 'list', params(p)),
      detail: (id: string) => key('customers', 'detail', id),
      timeline: (id: string) => key('customers', 'timeline', id),
      companies: (p?: CompanyListParams) => key('customers', 'companies', params(p)),
      company: (id: string) => key('customers', 'company', id),
    },
    pipelines: {
      all: key('pipelines'),
      list: key('pipelines', 'list'),
      detail: (id: string) => key('pipelines', 'detail', id),
    },
    pipelineBoard: {
      all: key('pipelineBoard'),
      columns: key('pipelineBoard', 'column'),
      column: (board: string, pipelineId: string, stageId: string, p?: ListParams) =>
        key('pipelineBoard', 'column', board, pipelineId, stageId, params(p)),
    },
    campaigns: {
      all: key('campaigns'),
      lists: key('campaigns', 'list'),
      list: (p?: CampaignListParams) => key('campaigns', 'list', params(p)),
      detail: (id: string) => key('campaigns', 'detail', id),
      funnel: (id: string) => key('campaigns', 'funnel', id),
      /** Detail metrics, funnel, time series and breakdown for one campaign and date range. */
      view: (id: string, name: string, query: unknown) => key('campaigns', 'view', id, name, query),
    },
    adSets: {
      all: key('adSets'),
      list: (campaignId: string) => key('adSets', 'list', campaignId),
    },
    spend: {
      all: key('spend'),
      list: (p?: SpendListParams) => key('spend', 'list', p ?? {}),
    },
    broadcasts: {
      all: key('broadcasts'),
      list: key('broadcasts', 'list'),
      detail: (id: string) => key('broadcasts', 'detail', id),
      audience: (audience: unknown) => key('broadcasts', 'audience', audience),
      preview: (...parts: unknown[]) => key('broadcasts', 'preview', ...parts),
    },
    performance: {
      all: key('performance'),
      view: (name: string, ...parts: unknown[]) => key('performance', name, ...parts),
    },
    conversations: {
      all: key('conversations'),
      lists: key('conversations', 'list'),
      list: (p?: ConversationListParams) => key('conversations', 'list', params(p)),
      detail: (id: string) => key('conversations', 'detail', id),
      messages: (id: string, p?: ListParams) => key('conversations', 'messages', id, params(p)),
    },
    callLogs: {
      all: key('callLogs'),
      list: (p?: CallLogListParams) => key('callLogs', 'list', params(p)),
    },
    automations: {
      all: key('automations'),
      lists: key('automations', 'list'),
      list: (p?: AutomationListParams) => key('automations', 'list', params(p)),
      detail: (id: string) => key('automations', 'detail', id),
      runs: (p?: AutomationRunListParams) => key('automations', 'runs', params(p)),
      run: (id: string) => key('automations', 'run', id),
      templates: key('automations', 'templates'),
      versions: (id: string) => key('automations', 'versions', id),
      stats: key('automations', 'stats'),
    },
    notifications: {
      all: key('notifications'),
      lists: key('notifications', 'list'),
      list: (p?: NotificationListParams) => key('notifications', 'list', params(p)),
      unreadCount: key('notifications', 'unread-count'),
    },
    auditLogs: {
      all: key('auditLogs'),
      list: (p?: AuditLogListParams) => key('auditLogs', 'list', params(p)),
      detail: (id: string) => key('auditLogs', 'detail', id),
    },
    savedViews: {
      all: key('savedViews'),
      list: (entity: SavedViewEntity) => key('savedViews', entity),
    },
    team: {
      all: key('team'),
      directory: key('team', 'directory'),
      members: (p?: ListParams) => key('team', 'members', params(p)),
      member: (id: string) => key('team', 'member', id),
      teams: key('team', 'teams'),
    },
    reports: {
      all: key('reports'),
      view: (name: string, query: ReportQuery) => key('reports', name, query),
    },
    integrations: {
      all: key('integrations'),
      list: key('integrations', 'list'),
      events: (provider: string) => key('integrations', 'events', provider),
    },
    leadForms: {
      all: key('leadForms'),
      list: key('leadForms', 'list'),
      detail: (id: string) => key('leadForms', 'detail', id),
      submissions: (id: string) => key('leadForms', 'submissions', id),
    },
    apiKeys: {
      all: key('apiKeys'),
      list: key('apiKeys', 'list'),
      summary: key('apiKeys', 'summary'),
    },
    webhooks: {
      all: key('webhooks'),
      list: key('webhooks', 'list'),
      options: key('webhooks', 'options'),
      deliveries: (id: string) => key('webhooks', 'deliveries', id),
    },
    notificationPreferences: {
      all: key('notificationPreferences'),
      current: key('notificationPreferences', 'current'),
    },
    scoring: {
      all: key('scoring'),
      settings: key('scoring', 'settings'),
      usage: key('scoring', 'usage'),
      distribution: (hot: number, warm: number) => key('scoring', 'distribution', hot, warm),
      job: (id: string) => key('scoring', 'job', id),
    },
    config: {
      all: key('config'),
      list: (name: ConfigName) => key('config', name),
      workspace: key('config', 'workspace'),
      scoringThresholds: key('config', 'scoring-thresholds'),
      permissions: key('config', 'permissions'),
    },
  }
}

export type QueryKeys = ReturnType<typeof createQueryKeys>
/** Top-level resource names, for invalidating a whole area at once. */
export type ResourceName = Exclude<keyof QueryKeys, 'root'>
