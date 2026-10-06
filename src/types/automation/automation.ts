import type { ListParams, TenantOwned } from '../common'
import type { AutomationId, UserId } from '../ids'
import type { AutomationAction } from './actions'
import type { ConditionGroup } from './conditions'
import type { AutomationTrigger } from './triggers'

export type AutomationStatus = 'draft' | 'published'

export interface AutomationContent {
  name: string
  description: string
  trigger: AutomationTrigger
  /** IF: evaluated against the trigger's entity and the entities related to it. */
  conditions: ConditionGroup
  actions: AutomationAction[]
}

export interface Automation extends TenantOwned, AutomationContent {
  id: AutomationId
  /** Only published automations run. Saving a draft pauses a published one until it is published. */
  status: AutomationStatus
  enabled: boolean
  /** Incremented on every publish. */
  version: number
  runCount: number
  lastRunAt: string | null
  errorCount: number
  consecutiveFailures: number
  createdBy: UserId | null
  createdAt: string
  updatedAt: string
}

export type AutomationInput = AutomationContent & { enabled?: boolean }

/** A snapshot taken on publish. */
export interface AutomationVersion extends TenantOwned, AutomationContent {
  id: string
  automationId: AutomationId
  version: number
  publishedAt: string
  publishedBy: UserId | null
}

export interface AutomationTemplate extends AutomationContent {
  key: string
  /** Short label such as "Speed to lead". */
  category: string
}

export type AutomationFilterField = 'name' | 'enabled' | 'runCount' | 'updatedAt' | 'status'
export type AutomationListParams = ListParams<AutomationFilterField>

export interface AutomationActivityStats {
  runs: number
  succeeded: number
  failed: number
  /** 0-1, null when nothing ran. */
  successRate: number | null
  top: Array<{ automationId: AutomationId; name: string; runs: number }>
}
