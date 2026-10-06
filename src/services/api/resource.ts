import type { ListParams, Paginated } from '@/types'

/** Standard CRUD surface for a paginated, user-facing entity. */
export interface CrudClient<
  T,
  TCreate,
  TUpdate,
  TParams extends ListParams = ListParams,
  TId extends string = string,
> {
  list(params?: TParams): Promise<Paginated<T>>
  get(id: TId): Promise<T>
  create(input: TCreate): Promise<T>
  update(id: TId, patch: TUpdate): Promise<T>
  delete(id: TId): Promise<void>
}

/**
 * Small, bounded workspace configuration (statuses, tags, rules, ...). Returned whole instead
 * of paginated, since the UI always needs the complete set to render selects and filters.
 */
export interface ReplaceOnDelete {
  replacementId?: string
}

export interface ConfigClient<T, TCreate = Omit<T, 'id' | 'tenantId'>, TUpdate = Partial<TCreate>> {
  listAll(): Promise<T[]>
  create(input: TCreate): Promise<T>
  update(id: string, patch: TUpdate): Promise<T>
  /** When records still use the row, pass `replacementId` or the call fails with CONFLICT. */
  delete(id: string, options?: ReplaceOnDelete): Promise<void>
}

/** Items that can be manually ordered (statuses, stages, custom fields, ...). */
export interface Reorderable {
  /** Persists a new order. `orderedIds` must contain every id exactly once. */
  reorder(orderedIds: string[]): Promise<void>
}
