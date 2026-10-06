import type { SavedView, SavedViewEntity, SavedViewInput } from '@/types'

export interface SavedViewsApiClient {
  /** Workspace presets plus the signed-in user's own views. */
  listAll(entity: SavedViewEntity): Promise<SavedView[]>
  create(input: SavedViewInput): Promise<SavedView>
  /** Presets cannot be changed (FORBIDDEN). */
  update(id: string, patch: Partial<SavedViewInput>): Promise<SavedView>
  delete(id: string): Promise<void>
}
