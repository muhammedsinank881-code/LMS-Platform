import type { ListParams, TenantOwned } from './common'
import type { CustomerId, DealId, LeadId, LostReasonId, PipelineId, StageId, UserId } from './ids'
import type { CustomFieldValue } from './lead'

export const STAGE_TYPES = ['open', 'won', 'lost', 'invalid'] as const
export type StageType = (typeof STAGE_TYPES)[number]

export interface PipelineStage extends TenantOwned {
  id: StageId
  pipelineId: PipelineId
  name: string
  color: string
  order: number
  /** Win probability, 0 to 100. */
  probability: number
  type: StageType
  usageCount?: number
}

export interface Pipeline extends TenantOwned {
  id: PipelineId
  name: string
  isDefault: boolean
  createdAt: string
}

export interface PipelineWithStages extends Pipeline {
  stages: PipelineStage[]
}

export interface Deal extends TenantOwned {
  id: DealId
  title: string
  leadId: LeadId
  customerId: CustomerId | null
  value: number
  expectedCloseDate: string
  /** Win probability, 0 to 100. Starts from the stage's probability. */
  probability: number
  product: string
  ownerId: UserId
  pipelineId: PipelineId
  stageId: StageId
  /** Order within the stage column. A reorder writes only this field. */
  position: number
  /** When the deal entered `stageId`. */
  stageEnteredAt: string
  /** value * probability / 100. */
  expectedRevenue: number
  lostReasonId?: LostReasonId | null
  lostCompetitor?: string | null
  lostNote?: string | null
  customFields: Record<string, CustomFieldValue>
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

export type DealFilterField =
  | 'leadId'
  | 'ownerId'
  | 'pipelineId'
  | 'stageId'
  | 'product'
  | 'value'
  | 'probability'
  | 'expectedCloseDate'
  | 'createdAt'
  | 'sourceId'
  | 'priority'
  | 'score'
  | 'scoreCategory'
  | 'tags'
  | 'position'
  | 'stageType'
export type DealListParams = ListParams<DealFilterField>

export interface PipelineValue {
  total: number
  weighted: number
  count: number
}

export interface StageSummary extends PipelineValue {
  stageId: StageId
}

export interface DealsSummary extends PipelineValue {
  byStage: StageSummary[]
}

export interface MoveDealStageInput {
  stageId: StageId
  /** Fractional index inside the destination column. Omitted appends the card. */
  position?: number
  /** Required when the target stage is of type `lost`. */
  lostReasonId?: LostReasonId
  lostCompetitor?: string
  lostNote?: string
  /** Actual close date when moving into a won stage. Defaults to now. */
  closedAt?: string
  /** Final value when closing as won. Defaults to the current value. */
  finalValue?: number
}

export interface ReopenDealInput {
  stageId: StageId
}

export interface BulkDealStageInput extends MoveDealStageInput {
  ids: DealId[]
}
