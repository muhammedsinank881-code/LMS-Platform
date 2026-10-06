import type {
  AssignmentRule,
  BillingSnapshot,
  ConfigInput,
  CustomFieldDefinition,
  Lead,
  LostReason,
  PermissionMatrix,
  QualificationQuestion,
  ScoreDecay,
  ScoreResult,
  ScoringRule,
  ScoringThresholds,
  SectionGrants,
  Tag,
  User,
  WorkspaceSettings,
} from '@/types'
import type { AssignmentResult } from '@/lib/assignment'
import type { ScoreDistribution } from '@/lib/scoring'
import type { ConfigClient, Reorderable } from './resource'

export interface ScoringSettings {
  thresholds: ScoringThresholds
  decay: ScoreDecay
}

export interface RecalculationJob {
  id: string
  status: 'running' | 'completed'
  total: number
  processed: number
  /** Leads whose score changed. */
  scoreChanges: number
  /** Leads whose category (hot/warm/cold) changed. */
  categoryChanges: number
  /** Category moves, e.g. warm to hot: 12 leads. */
  moves: Array<{ from: 'hot' | 'warm' | 'cold'; to: 'hot' | 'warm' | 'cold'; count: number }>
  startedAt: string
  finishedAt: string | null
}

/** Create payload for an orderable item: `order` defaults to the end of the list. */
export type OrderedInput<T extends { order: number }> = Omit<ConfigInput<T>, 'order'> & {
  order?: number
}

export type CustomFieldInput = OrderedInput<CustomFieldDefinition>
export type ScoringRuleInput = OrderedInput<ScoringRule>
export type QualificationQuestionInput = OrderedInput<QualificationQuestion>
export type LostReasonInput = OrderedInput<LostReason>
export type AssignmentRuleInput = ConfigInput<AssignmentRule>
export type TagInput = ConfigInput<Tag>

export type CustomFieldsApiClient = ConfigClient<
  CustomFieldDefinition,
  CustomFieldInput,
  Partial<CustomFieldInput>
> &
  Reorderable

export type ScoringApiClient = ConfigClient<
  ScoringRule,
  ScoringRuleInput,
  Partial<ScoringRuleInput>
> &
  Reorderable & {
    getThresholds(): Promise<ScoringThresholds>
    updateThresholds(thresholds: ScoringThresholds): Promise<ScoringThresholds>
    getSettings(): Promise<ScoringSettings>
    updateSettings(patch: Partial<ScoringSettings>): Promise<ScoringSettings>
    /** Leads currently matching each rule, keyed by rule id. */
    usage(): Promise<Record<string, number>>
    /** How leads would split into hot, warm and cold under these thresholds. */
    distribution(thresholds: ScoringThresholds): Promise<ScoreDistribution>
    /** The exact score breakdown for one lead under the current rules. Nothing is saved. */
    testLead(leadId: string): Promise<ScoreResult>
    /** Starts a background-style job. Poll `getRecalculation` to advance and read progress. */
    startRecalculation(): Promise<RecalculationJob>
    getRecalculation(id: string): Promise<RecalculationJob>
  }

export type QualificationQuestionsApiClient = ConfigClient<
  QualificationQuestion,
  QualificationQuestionInput,
  Partial<QualificationQuestionInput>
> &
  Reorderable

/** Sample lead for "Test this rule". Only the fields the conditions read are required. */
export type AssignmentSample = Partial<
  Pick<Lead, 'sourceId' | 'productInterest' | 'location' | 'language' | 'score' | 'assignedTo'>
>

/** `reorder` sets rule priority: first id = highest priority. */
export type AssignmentRulesApiClient = ConfigClient<
  AssignmentRule,
  AssignmentRuleInput,
  Partial<AssignmentRuleInput>
> &
  Reorderable & {
    evaluate(sample: AssignmentSample): Promise<AssignmentResult>
  }

export type LostReasonsApiClient = ConfigClient<
  LostReason,
  LostReasonInput,
  Partial<LostReasonInput>
> &
  Reorderable

export type TagsApiClient = ConfigClient<Tag, TagInput, Partial<TagInput>> & {
  merge(sourceId: string, targetId: string): Promise<Tag>
  bulkDelete(ids: string[]): Promise<void>
}

export interface PermissionSettings {
  matrix: PermissionMatrix
  sectionGrants: SectionGrants
}

export interface PermissionsApiClient {
  get(): Promise<PermissionSettings>
  update(next: PermissionSettings): Promise<PermissionSettings>
  reset(): Promise<PermissionSettings>
}

export interface ProfileInput {
  name?: string
  phone?: string | null
  language?: string
  timezone?: string | null
  avatarUrl?: string | null
}

export interface ProfileApiClient {
  update(patch: ProfileInput): Promise<User>
}

export interface BillingApiClient {
  get(): Promise<BillingSnapshot>
}

export interface WorkspaceApiClient {
  get(): Promise<WorkspaceSettings>
  update(patch: Partial<WorkspaceSettings>): Promise<WorkspaceSettings>
}

export interface SettingsApiClient {
  workspace: WorkspaceApiClient
  profile: ProfileApiClient
  permissions: PermissionsApiClient
  billing: BillingApiClient
  customFields: CustomFieldsApiClient
  scoringRules: ScoringApiClient
  qualificationQuestions: QualificationQuestionsApiClient
  assignmentRules: AssignmentRulesApiClient
  lostReasons: LostReasonsApiClient
  tags: TagsApiClient
}
