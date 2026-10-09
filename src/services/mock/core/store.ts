import { ApiError } from '@/services/api/errors'
import type {
  Activity,
  Ad,
  AdSet,
  Broadcast,
  SavedReport,
  SpendEntry,
  Target,
  AssignmentRule,
  AuditLog,
  Automation,
  AutomationRun,
  AutomationVersion,
  Campaign,
  Company,
  CallLog,
  Conversation,
  Customer,
  CustomFieldDefinition,
  Deal,
  FollowUp,
  Lead,
  LeadId,
  LeadSource,
  LeadStatus,
  LostReason,
  Message,
  MessageTemplate,
  QuickReply,
  Notification,
  NotificationPreferences,
  Pipeline,
  PipelineStage,
  QualificationQuestion,
  SavedView,
  ScoringRule,
  PermissionMatrix,
  Role,
  ScoreDecay,
  ScoringThresholds,
  SectionGrants,
  Tag,
  Task,
  Team,
  TenantPlan,
  User,
  WorkspaceSettings,
  ApiKey,
  FormSubmission,
  Integration,
  IntegrationEvent,
  LeadForm,
  WebhookDelivery,
  WebhookEndpoint,
  WebhookOutcome,
} from '@/types'
import type { StudentProfile } from '@/services/api/student-profile'
import type { StudentJobApplication } from '@/services/api/student-jobs'

export interface TenantSettings {
  /** Equals `tenantId`; one row per workspace. */
  id: string
  tenantId: string
  scoringThresholds: ScoringThresholds
  /** Lowers a lead's score after a stretch without activity. */
  scoringDecay?: ScoreDecay
  workspace: WorkspaceSettings
  /** Absent on workspaces saved before the matrix moved into tenant data. */
  permissions?: PermissionMatrix
  sectionGrants?: SectionGrants
  plan?: TenantPlan
  /** Monthly sales targets, per rep or for the team. */
  targets?: Target[]
}

/** Pending invite. Accept Invite reads the matching row in the auth database. */
export interface WorkspaceInvitation {
  id: string
  tenantId: string
  email: string
  role: Role
  teamId: string | null
  token: string
  invitedByName: string
  userId: string
  createdAt: string
}

/** A pair of leads a user marked "Keep Separate", so they are not suggested as duplicates again. */
export interface StoredNotificationPreferences extends NotificationPreferences {
  id: string
  tenantId: string
  userId: string
}

export interface DuplicateDismissal {
  id: string
  tenantId: string
  leadIds: [LeadId, LeadId]
}

/** Every table. All rows carry `tenantId`; nothing here is shared between workspaces. */
export interface MockTables {
  users: User[]
  studentProfiles: StudentProfile[]
  studentJobApplications: StudentJobApplication[]
  teams: Team[]
  leads: Lead[]
  leadStatuses: LeadStatus[]
  leadSources: LeadSource[]
  activities: Activity[]
  followUps: FollowUp[]
  tasks: Task[]
  pipelines: Pipeline[]
  stages: PipelineStage[]
  deals: Deal[]
  customers: Customer[]
  companies: Company[]
  campaigns: Campaign[]
  adSets: AdSet[]
  ads: Ad[]
  spendEntries: SpendEntry[]
  broadcasts: Broadcast[]
  savedReports: SavedReport[]
  conversations: Conversation[]
  messages: Message[]
  templates: MessageTemplate[]
  quickReplies: QuickReply[]
  callLogs: CallLog[]
  automations: Automation[]
  automationRuns: AutomationRun[]
  automationVersions: AutomationVersion[]
  notifications: Notification[]
  notificationPreferences: StoredNotificationPreferences[]
  auditLogs: AuditLog[]
  savedViews: SavedView[]
  customFields: CustomFieldDefinition[]
  scoringRules: ScoringRule[]
  qualificationQuestions: QualificationQuestion[]
  lostReasons: LostReason[]
  assignmentRules: AssignmentRule[]
  tags: Tag[]
  tenantSettings: TenantSettings[]
  invitations: WorkspaceInvitation[]
  duplicateDismissals: DuplicateDismissal[]
  integrations: Integration[]
  integrationEvents: IntegrationEvent[]
  leadForms: LeadForm[]
  formSubmissions: FormSubmission[]
  apiKeys: ApiKey[]
  webhooks: WebhookEndpoint[]
  webhookDeliveries: WebhookDelivery[]
}

export type TableName = keyof MockTables
export type TableRow<K extends TableName> = MockTables[K][number]
/** A row as the caller supplies it: the store stamps `tenantId`. Distributes over unions. */
export type NewRow<T> = T extends unknown ? Omit<T, 'tenantId'> : never

export const COUNTERS = ['lead', 'deal', 'customer', 'task'] as const
export type CounterName = (typeof COUNTERS)[number]
export type Counters = Record<CounterName, number>

export interface MockState {
  tables: MockTables
  /** Last issued number per tenant, so ids like L-10231 stay human-readable and per-workspace. */
  counters: Record<string, Counters>
  /**
   * Mock-only secret store, outside the tables: webhook signing secrets by endpoint id. A real
   * backend keeps these server side; nothing here is ever returned by an API call.
   */
  vault?: Record<string, string>
  /** What the next simulated webhook delivery does. Set from the dev simulator. */
  webhookOutcome?: WebhookOutcome
}

/**
 * A view of the database for one workspace. Resource code only ever sees this, so a query
 * cannot return, change, or delete another tenant's rows, even by mistake.
 */
export interface TenantDb {
  readonly tenantId: string
  all<K extends TableName>(table: K): Array<TableRow<K>>
  find<K extends TableName>(table: K, id: string): TableRow<K> | undefined
  /** Like `find` but throws NOT_FOUND. */
  get<K extends TableName>(table: K, id: string, label?: string): TableRow<K>
  insert<K extends TableName>(table: K, row: NewRow<TableRow<K>>): TableRow<K>
  save<K extends TableName>(table: K, row: TableRow<K>): TableRow<K>
  remove<K extends TableName>(table: K, id: string): boolean
  nextNumber(counter: CounterName): number
}

function bucket<K extends TableName>(state: MockState, table: K): Array<TableRow<K>> {
  return state.tables[table] as unknown as Array<TableRow<K>>
}

export function createTenantDb(state: MockState, tenantId: string): TenantDb {
  function all<K extends TableName>(table: K): Array<TableRow<K>> {
    return bucket(state, table).filter((row) => row.tenantId === tenantId)
  }

  function find<K extends TableName>(table: K, id: string): TableRow<K> | undefined {
    return bucket(state, table).find((row) => row.tenantId === tenantId && row.id === id)
  }

  function get<K extends TableName>(table: K, id: string, label = 'Record'): TableRow<K> {
    const row = find(table, id)
    if (!row) throw new ApiError('NOT_FOUND', `${label} not found.`)
    return row
  }

  function insert<K extends TableName>(table: K, row: NewRow<TableRow<K>>): TableRow<K> {
    const stamped = { ...(row as object), tenantId } as unknown as TableRow<K>
    bucket(state, table).push(stamped)
    return stamped
  }

  function save<K extends TableName>(table: K, row: TableRow<K>): TableRow<K> {
    if (row.tenantId !== tenantId) {
      throw new ApiError('FORBIDDEN', 'Record belongs to another workspace.')
    }
    const rows = bucket(state, table)
    const index = rows.findIndex((r) => r.tenantId === tenantId && r.id === row.id)
    if (index === -1) throw new ApiError('NOT_FOUND', 'Record not found.')
    rows[index] = row
    return row
  }

  function remove<K extends TableName>(table: K, id: string): boolean {
    const rows = bucket(state, table)
    const index = rows.findIndex((r) => r.tenantId === tenantId && r.id === id)
    if (index === -1) return false
    rows.splice(index, 1)
    return true
  }

  function nextNumber(counter: CounterName): number {
    const counters = (state.counters[tenantId] ??= createCounters())
    counters[counter] += 1
    return counters[counter]
  }

  return { tenantId, all, find, get, insert, save, remove, nextNumber }
}

export function createCounters(): Counters {
  return { lead: 10000, deal: 1000, customer: 1000, task: 1000 }
}
