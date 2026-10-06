import { ApiError } from '@/services/api/errors'
import type { SavedViewsApiClient } from '@/services/api/saved-views'
import type { Resource, SavedView, SavedViewEntity } from '@/types'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'

const RESOURCE_FOR: Record<SavedViewEntity, Resource> = {
  leads: 'leads',
  deals: 'deals',
  followups: 'followups',
  tasks: 'tasks',
  customers: 'customers',
}

/** Presets are shared by the workspace; everything else belongs to one user. */
function requireOwnView(ctx: RequestContext, id: string): SavedView {
  const view = ctx.db.get('savedViews', id, 'Saved view')
  ctx.require(RESOURCE_FOR[view.entity], 'view')
  if (view.isPreset) throw new ApiError('FORBIDDEN', 'Preset views cannot be changed.')
  if (view.userId !== ctx.actor.id)
    throw new ApiError('FORBIDDEN', 'That view belongs to someone else.')
  return view
}

export const mockSavedViewsApi: SavedViewsApiClient = {
  listAll: (entity) =>
    request((ctx) => {
      ctx.require(RESOURCE_FOR[entity], 'view')
      return ctx.db
        .all('savedViews')
        .filter((v) => v.entity === entity && (v.isPreset || v.userId === ctx.actor.id))
        .sort(
          (a, b) =>
            Number(b.isPreset) - Number(a.isPreset) || a.createdAt.localeCompare(b.createdAt),
        )
    }),
  create: (input) =>
    request((ctx) => {
      ctx.require(RESOURCE_FOR[input.entity], 'view')
      const name = input.name.trim()
      if (!name) throw validationError('name', 'Give the view a name.')
      return ctx.db.insert('savedViews', {
        id: newId('view'),
        entity: input.entity,
        name,
        icon: input.icon,
        conditions: input.conditions,
        sort: input.sort,
        userId: ctx.actor.id,
        isPreset: false,
        createdAt: ctx.timestamp,
      })
    }),
  update: (id, patch) =>
    request((ctx) => {
      const view = requireOwnView(ctx, id)
      if (patch.name !== undefined && !patch.name.trim()) {
        throw validationError('name', 'Give the view a name.')
      }
      return ctx.db.save('savedViews', {
        ...view,
        ...patch,
        name: patch.name?.trim() ?? view.name,
        id,
        tenantId: view.tenantId,
      })
    }),
  delete: (id) =>
    request((ctx) => {
      const view = requireOwnView(ctx, id)
      ctx.db.remove('savedViews', id)
      recordAudit(ctx, {
        action: 'deleted',
        entity: 'setting',
        entityId: id,
        entityLabel: `Saved view: ${view.name}`,
      })
    }),
}
