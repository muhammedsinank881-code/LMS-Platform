import { useAuthStore } from '@/store/auth-store'
import { useWorkspace } from '@/hooks/use-workspace'
import { usePersistentState } from '@/hooks/use-persistent-state'
import type { SavedViewEntity } from '@/types'

export function defaultViewStorageKey(
  tenantId: string,
  userId: string,
  entity: SavedViewEntity,
): string {
  return `leadflow:default-view:${tenantId}:${userId}:${entity}`
}

export function useDefaultView(entity: SavedViewEntity) {
  const { tenantId } = useWorkspace()
  const userId = useAuthStore((state) => state.user?.id ?? 'anon')
  const key = defaultViewStorageKey(tenantId ?? 'none', userId, entity)
  const [defaultViewId, setDefaultViewId] = usePersistentState<string | null>(key, null)
  return { defaultViewId, setDefaultViewId }
}
