import type { FilterCondition, TenantOwned } from './common'
import type { LostReasonId, TagId, TeamId, UserId } from './ids'
import type { LeadFilterField } from './lead'

export interface ScoringRule extends TenantOwned {
  id: string
  name: string
  /** All conditions must match (AND) for the points to apply. Fields may be engagement signals. */
  conditions: FilterCondition<string>[]
  /** May be negative. */
  points: number
  isActive: boolean
  order: number
  /**
   * `once` applies the points a single time. A number repeats them per signal count
   * (`repeatField`), up to that many times.
   */
  maxApplications?: 'once' | number
  /** Engagement field counted for repeating rules, e.g. engagement.formSubmissions. */
  repeatField?: string | null
}

/** Reduces a lead's score after a stretch without activity. */
export interface ScoreDecay {
  enabled: boolean
  afterDays: number
  /** Points removed (positive number). */
  points: number
}

export const DEFAULT_SCORE_DECAY: ScoreDecay = { enabled: false, afterDays: 14, points: 10 }

export interface ScoringThresholds {
  /** Score at or above which a lead is hot. */
  hot: number
  /** Score at or above which a lead is warm. Below it, cold. */
  warm: number
}

export const QUESTION_TYPES = ['text', 'number', 'dropdown', 'boolean'] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export interface QualificationQuestion extends TenantOwned {
  id: string
  question: string
  type: QuestionType
  options: string[]
  required: boolean
  order: number
  /** Missing means active, so rows saved before this field still show. */
  isActive?: boolean
}

export const CUSTOM_FIELD_TYPES = [
  'text',
  'number',
  'dropdown',
  'multiselect',
  'date',
  'boolean',
  'currency',
  'file',
  'url',
] as const
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number]

export const CUSTOM_FIELD_ENTITIES = ['lead', 'deal', 'customer'] as const
export type CustomFieldEntity = (typeof CUSTOM_FIELD_ENTITIES)[number]

export interface CustomFieldValidation {
  min?: number
  max?: number
  /** Regular expression source, without slashes. Text fields only. */
  pattern?: string
}

export interface CustomFieldDefinition extends TenantOwned {
  id: string
  entity: CustomFieldEntity
  /** Key used inside `customFields` on the entity. Immutable after create. */
  key: string
  label: string
  type: CustomFieldType
  options: string[]
  required: boolean
  order: number
  helpText?: string
  defaultValue?: string | number | boolean | string[] | null
  validation?: CustomFieldValidation
  showInTable?: boolean
  /** Archived fields stay on records but disappear from forms and filters. */
  archived?: boolean
}

export interface LostReason extends TenantOwned {
  id: LostReasonId
  name: string
  isActive: boolean
  order: number
  usageCount?: number
}

export interface Tag extends TenantOwned {
  id: TagId
  name: string
  color: string
  usageCount?: number
}

export const ASSIGNMENT_DISTRIBUTIONS = [
  'manual',
  'specific_user',
  'round_robin',
  'workload',
  'highest_score',
] as const
export type AssignmentDistribution = (typeof ASSIGNMENT_DISTRIBUTIONS)[number]

/**
 * Who a matching lead goes to. `conditions` are tested against the lead (source, location,
 * product, language, score, ...); `pool` narrows the eligible users; `distribution` picks one.
 */
export interface AssignmentRule extends TenantOwned {
  id: string
  name: string
  /** Lower number = evaluated first. */
  priority: number
  isActive: boolean
  conditions: FilterCondition<LeadFilterField>[]
  pool: {
    teamId: TeamId | null
    userIds: UserId[]
    /** Only users whose language equals the lead's language. */
    matchLanguage: boolean
    /** Only users whose location equals the lead's location. */
    matchLocation: boolean
  }
  distribution: AssignmentDistribution
  /** When set, the rule matches only inside or only outside workspace business hours. */
  withinWorkingHours?: boolean | null
}

export interface BusinessHours {
  /** 0 = Sunday through 6 = Saturday. */
  days: number[]
  /** 24-hour HH:mm in the workspace timezone. */
  start: string
  end: string
}

export interface AssignmentFallback {
  /** Null leaves the lead unassigned when no rule matches. */
  userId: string | null
}

export interface WorkspaceSettings {
  name: string
  currency: string
  timezone: string
  logoUrl?: string | null
  /** date-fns pattern, e.g. dd MMM yyyy. */
  dateFormat?: string
  businessHours?: BusinessHours
  /** Month the fiscal year starts, 1–12. */
  fiscalYearStart?: number
  defaultStatusId?: string | null
  assignmentFallback?: AssignmentFallback
}

export type ConfigInput<T> = Omit<T, 'id' | 'tenantId'>
