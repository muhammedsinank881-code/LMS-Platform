import type { ConfigClient, Reorderable, ReplaceOnDelete } from '@/services/api/resource'
import { ApiError } from '@/services/api/errors'
import { request, type RequestContext } from './context'
import { diffValues, recordAudit } from './records'
import type { NewRow, TableRow } from './store'
import { newId } from './util'
import { validationError } from './validate'

export type ConfigTable =
  | 'leadStatuses'
  | 'leadSources'
  | 'templates'
  | 'quickReplies'
  | 'customFields'
  | 'scoringRules'
  | 'qualificationQuestions'
  | 'lostReasons'
  | 'assignmentRules'
  | 'tags'

/** A row as `build` returns it: everything except the id and tenant the store assigns. */
export type Draft<R> = R extends unknown ? Omit<R, 'id' | 'tenantId'> : never

export interface ConfigDef<K extends ConfigTable, TCreate, TUpdate> {
  table: K
  /** Singular noun for messages and the audit trail, e.g. "Lead status". */
  label: string
  idPrefix: string
  /** Row name shown in the audit trail. */
  nameOf(row: TableRow<K>): string
  /** Builds the row to store (without id and tenant) from the create payload. */
  build(ctx: RequestContext, input: TCreate, existing: Array<TableRow<K>>): Draft<TableRow<K>>
  apply(ctx: RequestContext, row: TableRow<K>, patch: TUpdate): TableRow<K>
  /** Throws CONFLICT while something still depends on the row. May reassign when a replacement is given. */
  guardDelete?(ctx: RequestContext, row: TableRow<K>, options?: ReplaceOnDelete): void
  /** Adds computed fields such as usage counts. Not written back. */
  present?(ctx: RequestContext, row: TableRow<K>): TableRow<K>
  /** Cleans up after a delete, e.g. removing a deleted tag from leads. */
  onDelete?(ctx: RequestContext, row: TableRow<K>): void
  /** Field that defines the manual order, if the items can be reordered. */
  orderField?: 'order' | 'priority'
  /** Runs after any change, e.g. to rescore leads when scoring rules change. */
  afterWrite?(ctx: RequestContext): void
}

export const nextOrder = (rows: ReadonlyArray<Partial<Record<'order' | 'priority', number>>>) =>
  rows.reduce((max, row) => Math.max(max, row.order ?? row.priority ?? 0), 0) + 1

export function requireText(value: string | undefined, field: string, label: string): string {
  const text = value?.trim()
  if (!text) throw validationError(field, `${label} is required.`)
  return text
}

/**
 * One CRUD + reorder implementation for every small workspace list (statuses, sources, tags,
 * rules, ...). Anyone in the workspace can read; only workspace admins can change.
 */
export function createConfigApi<K extends ConfigTable, TCreate, TUpdate>(
  def: ConfigDef<K, TCreate, TUpdate>,
): ConfigClient<TableRow<K>, TCreate, TUpdate> & Reorderable {
  type Row = TableRow<K>
  const field = def.orderField

  const orderOf = (row: Row): number =>
    field ? ((row as unknown as Record<string, number>)[field] ?? 0) : 0
  const sorted = (rows: Row[]): Row[] =>
    field ? [...rows].sort((a, b) => orderOf(a) - orderOf(b)) : rows
  const fieldsOf = (row: Row) =>
    Object.keys(row).filter((key) => key !== 'id' && key !== 'tenantId' && key !== 'usageCount')
  const audit = (
    ctx: RequestContext,
    action: 'created' | 'updated' | 'deleted',
    row: Row,
    previous: Row | null = null,
  ) => {
    const diff =
      action === 'created'
        ? diffValues({} as Row, row, fieldsOf(row))
        : action === 'deleted'
          ? diffValues(row, {} as Row, fieldsOf(row))
          : previous
            ? diffValues(previous, row, fieldsOf(row))
            : null
    recordAudit(ctx, {
      action:
        action === 'created' ? 'created' : action === 'deleted' ? 'deleted' : 'settings_changed',
      entity: 'setting',
      entityId: row.id,
      entityLabel: `${def.label}: ${def.nameOf(row)}`,
      previousValue: action === 'created' ? null : (diff?.previousValue ?? null),
      newValue: action === 'deleted' ? null : (diff?.newValue ?? null),
    })
  }
  const finish = (ctx: RequestContext) => def.afterWrite?.(ctx)

  return {
    listAll: () =>
      request((ctx) => sorted(ctx.db.all(def.table)).map((row) => def.present?.(ctx, row) ?? row)),

    create: (input) =>
      request((ctx) => {
        ctx.requireWorkspaceAdmin()
        const built = def.build(ctx, input, ctx.db.all(def.table))
        const row = ctx.db.insert(def.table, {
          ...(built as object),
          id: newId(def.idPrefix),
        } as NewRow<Row>)
        audit(ctx, 'created', row)
        finish(ctx)
        return row
      }),

    update: (id, patch) =>
      request((ctx) => {
        ctx.requireWorkspaceAdmin()
        const row = ctx.db.get(def.table, id, def.label)
        const saved = ctx.db.save(def.table, def.apply(ctx, row, patch))
        audit(ctx, 'updated', saved, row)
        finish(ctx)
        return saved
      }),

    delete: (id, options) =>
      request((ctx) => {
        ctx.requireWorkspaceAdmin()
        const row = ctx.db.get(def.table, id, def.label)
        def.guardDelete?.(ctx, row, options)
        ctx.db.remove(def.table, id)
        def.onDelete?.(ctx, row)
        audit(ctx, 'deleted', row)
        finish(ctx)
      }),

    reorder: (orderedIds) =>
      request((ctx) => {
        ctx.requireWorkspaceAdmin()
        if (!field) throw new ApiError('VALIDATION', `${def.label} cannot be reordered.`)
        const rows = ctx.db.all(def.table)
        const same =
          orderedIds.length === rows.length &&
          new Set(orderedIds).size === rows.length &&
          rows.every((row) => orderedIds.includes(row.id))
        if (!same) throw validationError('orderedIds', 'List every item exactly once.')
        orderedIds.forEach((id, index) => {
          const row = ctx.db.get(def.table, id, def.label)
          ctx.db.save(def.table, { ...row, [field]: index + 1 } as Row)
        })
        finish(ctx)
      }),
  }
}
