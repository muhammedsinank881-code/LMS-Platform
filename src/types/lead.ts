import type { ListParams, Priority, TenantOwned } from './common'
import type { Utm } from './lead-form'
import type {
  CampaignId,
  CustomerId,
  LeadId,
  LostReasonId,
  PipelineId,
  SourceId,
  StageId,
  StatusId,
  UserId,
} from './ids'

/** Statuses and sources are configurable per workspace, so they are data records, not enums. */
export const LEAD_STATUS_TYPES = ['open', 'won', 'lost', 'invalid'] as const
export type LeadStatusType = (typeof LEAD_STATUS_TYPES)[number]

export interface LeadStatus extends TenantOwned {
  id: StatusId
  name: string
  /** Hex color, e.g. #6366f1. */
  color: string
  order: number
  type: LeadStatusType
  /** Filled by list endpoints. Not stored. */
  usageCount?: number
}

export interface LeadSource extends TenantOwned {
  id: SourceId
  /** Stable machine key, e.g. facebook. */
  key: string
  name: string
  /** lucide icon name resolved by the SourceIcon component. */
  icon: string
  isActive: boolean
  /** Built-in sources can be disabled, not deleted. */
  builtIn?: boolean
  usageCount?: number
}

export const SCORE_CATEGORIES = ['hot', 'warm', 'cold'] as const
export type ScoreCategory = (typeof SCORE_CATEGORIES)[number]

export const QUALIFICATION_STATUSES = ['qualified', 'not_qualified', 'needs_info'] as const
export type QualificationStatus = (typeof QUALIFICATION_STATUSES)[number]

export const LEAD_TYPES = ['b2b', 'b2c'] as const
export type LeadType = (typeof LEAD_TYPES)[number]

export type CustomFieldValue = string | number | boolean | string[] | null
export type AnswerValue = string | number | boolean | string[]

export interface ScoreRuleRef {
  id: string
  name: string
}

export interface ScoreBreakdownItem {
  rule: ScoreRuleRef
  points: number
}

export interface ScoreResult {
  score: number
  category: ScoreCategory
  breakdown: ScoreBreakdownItem[]
}

export const ENGAGEMENT_SIGNALS = [
  'whatsappReplies',
  'emailOpens',
  'demosAttended',
  'quotationRequests',
  'formSubmissions',
  'websiteVisits',
] as const
export type EngagementSignal = (typeof ENGAGEMENT_SIGNALS)[number]

/** Mock engagement counters that scoring rules can read. */
export type LeadEngagement = Record<EngagementSignal, number> & { lastActivityAt: string | null }

export interface Lead extends TenantOwned {
  /** Human-readable, e.g. L-10231. */
  id: LeadId
  name: string
  /** Canonical +91XXXXXXXXXX form (see normalizePhone). */
  phone: string | null
  whatsapp: string | null
  email: string | null
  company: string | null
  location: string | null
  sourceId: SourceId
  campaignId: CampaignId | null
  adSetId?: string | null
  adId?: string | null
  /** The source the lead first came in through. First-touch attribution reads this. */
  originalSourceId?: SourceId
  /** Opted out of WhatsApp marketing messages. */
  whatsappOptOut?: boolean
  productInterest: string | null
  /** Amount in the workspace currency. */
  budget: number | null
  requirement: string | null
  leadType: LeadType
  priority: Priority
  language: string | null
  tags: string[]
  statusId: StatusId
  pipelineId: PipelineId
  stageId: StageId
  /** Order within the stage column. */
  position: number
  /** When the lead entered `stageId`. */
  stageEnteredAt: string
  assignedTo: UserId | null
  assignedAt: string | null
  score: number
  scoreCategory: ScoreCategory
  scoreBreakdown: ScoreBreakdownItem[]
  qualificationStatus: QualificationStatus
  /** Keyed by QualificationQuestion id. */
  qualificationAnswers: Record<string, AnswerValue>
  /** Keyed by CustomFieldDefinition key. */
  customFields: Record<string, CustomFieldValue>
  lostReasonId?: LostReasonId | null
  duplicateOf?: LeadId | null
  convertedToCustomerId?: CustomerId | null
  createdBy: UserId | null
  createdAt: string
  updatedAt: string
  lastContactedAt: string | null
  nextFollowUpAt: string | null
  firstResponseTimeMins: number | null
  /** Set when a lead was merged into another; archived leads are hidden from lists. */
  archivedAt: string | null
  engagement?: LeadEngagement
  /** Campaign tracking captured from a form or landing page. */
  utm?: Utm
}

/** Enough to show a duplicate candidate without exposing everything on the record. */
export type LeadSummary = Pick<
  Lead,
  'id' | 'name' | 'phone' | 'email' | 'company' | 'statusId' | 'assignedTo' | 'createdAt'
>

export const LEAD_FILTER_FIELDS = [
  'id',
  'name',
  'phone',
  'email',
  'company',
  'location',
  'sourceId',
  'campaignId',
  'statusId',
  'pipelineId',
  'stageId',
  'position',
  'assignedTo',
  'teamId',
  'score',
  'scoreCategory',
  'budget',
  'priority',
  'tags',
  'qualificationStatus',
  'productInterest',
  'leadType',
  'language',
  'createdAt',
  'lastContactedAt',
  'nextFollowUpAt',
  /** Virtual: overdue | today | tomorrow | upcoming | none, derived from nextFollowUpAt. */
  'followUpBucket',
  /** Virtual: whether the lead is flagged as a duplicate of another. */
  'isDuplicate',
] as const
export type LeadFilterField = (typeof LEAD_FILTER_FIELDS)[number]
export type LeadListParams = ListParams<LeadFilterField>

export const DUPLICATE_CONFIDENCES = ['high', 'medium', 'low'] as const
export type DuplicateConfidence = (typeof DUPLICATE_CONFIDENCES)[number]
export type DuplicateMatchField = 'phone' | 'email' | 'whatsapp' | 'company'

export interface DuplicateMatch {
  lead: LeadSummary
  confidence: DuplicateConfidence
  matchedOn: DuplicateMatchField[]
}

/** Fields compared when checking; both `Lead` and unsaved drafts satisfy it. */
export interface DuplicateProbe {
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  company?: string | null
}

export interface DuplicateGroup {
  key: string
  matchedOn: DuplicateMatchField[]
  confidence: DuplicateConfidence
  leads: LeadSummary[]
}

export const MERGEABLE_FIELDS = [
  'name',
  'phone',
  'whatsapp',
  'email',
  'company',
  'location',
  'sourceId',
  'campaignId',
  'productInterest',
  'budget',
  'requirement',
  'leadType',
  'priority',
  'language',
  'statusId',
  'assignedTo',
] as const
export type MergeableField = (typeof MERGEABLE_FIELDS)[number]
export type MergeSide = 'primary' | 'secondary'
/** Which record wins per field. Unlisted fields default to the primary lead. */
export type LeadMergeChoices = Partial<Record<MergeableField, MergeSide>>

export interface ImportLeadError {
  /** 1-based row number within the uploaded file. */
  row: number
  message: string
}

export interface ImportLeadsResult {
  total: number
  created: number
  duplicates: number
  invalid: number
  errors: ImportLeadError[]
}
