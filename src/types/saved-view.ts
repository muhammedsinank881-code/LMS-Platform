import type { FilterCondition, SortParam, TenantOwned } from './common'
import type { SavedViewId, UserId } from './ids'

export const SAVED_VIEW_ENTITIES = ['leads', 'deals', 'followups', 'tasks', 'customers'] as const
export type SavedViewEntity = (typeof SAVED_VIEW_ENTITIES)[number]

export interface SavedView extends TenantOwned {
  id: SavedViewId
  entity: SavedViewEntity
  name: string
  /** Emoji shown before the name, e.g. a flame for Hot Leads. */
  icon: string
  conditions: FilterCondition[]
  sort: SortParam[]
  /** Owner. Null for workspace presets. */
  userId: UserId | null
  /** Presets ship with the workspace and cannot be renamed or deleted. */
  isPreset: boolean
  createdAt: string
}

export type SavedViewInput = Pick<SavedView, 'entity' | 'name' | 'icon' | 'conditions' | 'sort'>
