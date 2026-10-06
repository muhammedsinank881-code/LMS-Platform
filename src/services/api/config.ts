import type { LeadSource, LeadStatus } from '@/types'
import type { ConfigClient, Reorderable } from './resource'

export type StatusInput = Pick<LeadStatus, 'name' | 'color' | 'type'>
export type SourceInput = Pick<LeadSource, 'key' | 'name' | 'icon' | 'isActive'>

/** Deleting a status that leads still use fails with CONFLICT. */
export type StatusesApiClient = ConfigClient<LeadStatus, StatusInput, Partial<StatusInput>> &
  Reorderable

/** Deleting a source that leads still use fails with CONFLICT. */
export type SourcesApiClient = ConfigClient<LeadSource, SourceInput>
