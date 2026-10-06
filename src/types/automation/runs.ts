import type { ListParams, TenantOwned } from '../common'
import type { AutomationId } from '../ids'
import type { AutomationTriggerType } from './triggers'

export const RUN_STATUSES = [
  'running',
  'waiting',
  'succeeded',
  'failed',
  'skipped',
  'cancelled',
] as const
export type RunStatus = (typeof RUN_STATUSES)[number]

export type EntityKind = 'lead' | 'deal' | 'followup' | 'import' | 'system'

export interface EntityRef {
  kind: EntityKind
  id: string
}

/** Loose, typed bag of what an event carries. Matchers read only the keys they need. */
export interface EventData {
  changedFields?: string[]
  fromStatusId?: string | null
  toStatusId?: string | null
  fromScore?: number
  toScore?: number
  toUserId?: string | null
  fromStageId?: string | null
  toStageId?: string | null
  pipelineId?: string | null
  channel?: 'whatsapp' | 'email'
  followUpType?: string
  formId?: string | null
  sourceId?: string | null
  /** Minutes since the last contact (time-based triggers). */
  idleMinutes?: number
  /** ISO time a scheduled trigger fired for. */
  firedAt?: string
  signal?: string
}

/** Where an event sits in a causal chain of automations. */
export interface ChainInfo {
  chainId: string
  depth: number
  /** Automations whose writes led to this event. */
  causedBy: AutomationId[]
}

export interface DomainEvent {
  id: string
  tenantId: string
  type: AutomationTriggerType | 'engagement' | 'lead_converted'
  entity: EntityRef
  occurredAt: string
  data: EventData
  chain: ChainInfo
}

export type StepStatus = 'pending' | 'succeeded' | 'failed' | 'skipped' | 'waiting'

export interface AutomationRunStep {
  /** Position in the action list, e.g. "2" or "3.then.1". */
  path: string
  actionType: string
  status: StepStatus
  /** What happened, or what would happen in a dry run. */
  result: string
  error: string | null
  startedAt: string | null
  finishedAt: string | null
}

export interface ConditionTrace {
  label: string
  matched: boolean
  /** Why it matched or not, e.g. "Budget is 50,000, needs more than 100,000". */
  reason: string
}

export interface AutomationRun extends TenantOwned {
  id: string
  automationId: AutomationId
  automationName: string
  automationVersion: number
  entity: EntityRef
  eventId: string
  idempotencyKey: string
  chain: ChainInfo
  triggerType: AutomationTriggerType
  triggerPayload: EventData
  status: RunStatus
  steps: AutomationRunStep[]
  conditionTrace: ConditionTrace[]
  /** Index of the next top-level action to run when resuming. */
  cursor: number
  resumeAt: string | null
  error: string | null
  startedAt: string
  finishedAt: string | null
}

export type AutomationRunFilterField =
  | 'automationId'
  | 'status'
  | 'entityKind'
  | 'entityId'
  | 'startedAt'

export interface AutomationRunListParams extends ListParams<AutomationRunFilterField> {
  automationId?: AutomationId
  statuses?: RunStatus[]
  entityKind?: EntityKind
  entityId?: string
  from?: string
  to?: string
}

export interface DryRunResult {
  matched: boolean
  conditionTrace: ConditionTrace[]
  steps: AutomationRunStep[]
  /** Set when the plan stops at a wait. */
  waitsUntil: string | null
  warnings: string[]
}
