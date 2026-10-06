import { ApiError } from '@/services/api/errors'
import type { SourcesApiClient, StatusesApiClient } from '@/services/api/config'
import type { TagInput, TagsApiClient } from '@/services/api/settings'
import { keepsWonAndLost } from '@/lib/settings/terminal'
import { createConfigApi, nextOrder, requireText } from '../core/config-crud'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { validationError } from '../core/validate'

const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function requireColor(value: string | undefined, field = 'color'): string {
  if (!value || !HEX_COLOR.test(value))
    throw validationError(field, 'Use a hex color like #6366f1.')
  return value
}

function conflict(message: string): never {
  throw new ApiError('CONFLICT', message)
}

export const mockStatusesApi: StatusesApiClient = createConfigApi({
  table: 'leadStatuses',
  label: 'Lead status',
  idPrefix: 'status',
  orderField: 'order',
  nameOf: (row) => row.name,
  build: (_ctx, input, existing) => ({
    name: requireText(input.name, 'name', 'Name'),
    color: requireColor(input.color),
    type: input.type,
    order: nextOrder(existing),
  }),
  apply: (ctx, row, patch) => {
    const type = patch.type ?? row.type
    if (!keepsWonAndLost(ctx.db.all('leadStatuses'), undefined, { id: row.id, type })) {
      conflict('Keep at least one won status and one lost status.')
    }
    return {
      ...row,
      ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
      ...(patch.color !== undefined && { color: requireColor(patch.color) }),
      type,
    }
  },
  present: (ctx, row) => ({
    ...row,
    usageCount: ctx.db.all('leads').filter((lead) => lead.statusId === row.id).length,
  }),
  guardDelete(ctx, row, options) {
    if (!keepsWonAndLost(ctx.db.all('leadStatuses'), row.id)) {
      conflict('Keep at least one won status and one lost status.')
    }
    const used = ctx.db.all('leads').filter((lead) => lead.statusId === row.id)
    if (used.length === 0) return
    if (!options?.replacementId) {
      conflict(`${used.length} leads are still "${row.name}". Choose a replacement status.`)
    }
    if (options.replacementId === row.id || !ctx.db.find('leadStatuses', options.replacementId)) {
      throw validationError('replacementId', 'Choose a different status.')
    }
    for (const lead of used) ctx.db.save('leads', { ...lead, statusId: options.replacementId })
  },
})

export const mockSourcesApi: SourcesApiClient = createConfigApi({
  table: 'leadSources',
  label: 'Lead source',
  idPrefix: 'source',
  nameOf: (row) => row.name,
  build(ctx, input) {
    const key = requireText(input.key, 'key', 'Key').toLowerCase().replace(/\s+/g, '_')
    if (ctx.db.all('leadSources').some((s) => s.key === key))
      conflict(`A source with key "${key}" exists.`)
    return {
      key,
      name: requireText(input.name, 'name', 'Name'),
      icon: input.icon || 'Globe',
      isActive: input.isActive ?? true,
      builtIn: false,
    }
  },
  apply: (_ctx, row, patch) => {
    if (patch.key !== undefined && patch.key !== row.key) {
      conflict('A source key cannot be changed once it exists.')
    }
    return {
      ...row,
      ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
      ...(patch.icon !== undefined && { icon: patch.icon }),
      ...(patch.isActive !== undefined && { isActive: patch.isActive }),
    }
  },
  present: (ctx, row) => ({
    ...row,
    usageCount: ctx.db.all('leads').filter((lead) => lead.sourceId === row.id).length,
  }),
  guardDelete(ctx, row, options) {
    if (row.builtIn) conflict(`"${row.name}" is built in. Disable it instead of deleting it.`)
    const used = ctx.db.all('leads').filter((lead) => lead.sourceId === row.id)
    if (used.length === 0) return
    if (!options?.replacementId) {
      conflict(`${used.length} leads came from "${row.name}". Choose a replacement source.`)
    }
    if (options.replacementId === row.id || !ctx.db.find('leadSources', options.replacementId)) {
      throw validationError('replacementId', 'Choose a different source.')
    }
    for (const lead of used) ctx.db.save('leads', { ...lead, sourceId: options.replacementId })
  },
})

function renameTag(ctx: RequestContext, from: string, to: string | null): void {
  for (const lead of ctx.db.all('leads')) {
    if (!lead.tags.includes(from)) continue
    const tags = lead.tags.flatMap((tag) => (tag === from ? (to ? [to] : []) : [tag]))
    ctx.db.save('leads', { ...lead, tags: [...new Set(tags)] })
  }
}

const tagCrud = createConfigApi<'tags', TagInput, Partial<TagInput>>({
  table: 'tags',
  label: 'Tag',
  idPrefix: 'tag',
  nameOf: (row) => row.name,
  build(ctx, input) {
    const name = requireText(input.name, 'name', 'Name')
    if (ctx.db.all('tags').some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      conflict(`A tag named "${name}" already exists.`)
    }
    return { name, color: requireColor(input.color) }
  },
  apply(ctx, row, patch) {
    const name = patch.name === undefined ? row.name : requireText(patch.name, 'name', 'Name')
    if (name !== row.name) renameTag(ctx, row.name, name)
    return {
      ...row,
      name,
      color: patch.color === undefined ? row.color : requireColor(patch.color),
    }
  },
  present: (ctx, row) => ({
    ...row,
    usageCount: ctx.db.all('leads').filter((lead) => lead.tags.includes(row.name)).length,
  }),
  guardDelete(ctx, row, options) {
    const used = ctx.db.all('leads').filter((lead) => lead.tags.includes(row.name))
    if (used.length === 0) return
    if (!options?.replacementId) {
      conflict(`${used.length} leads use "${row.name}". Choose a replacement tag.`)
    }
    const next = ctx.db.find('tags', options.replacementId)
    if (!next || next.id === row.id) throw validationError('replacementId', 'Choose a different tag.')
    renameTag(ctx, row.name, next.name)
  },
  onDelete: (ctx, row) => renameTag(ctx, row.name, null),
})

export const mockTagsApi: TagsApiClient = {
  ...tagCrud,
  merge: (sourceId, targetId) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const source = ctx.db.get('tags', sourceId, 'Tag')
      const target = ctx.db.get('tags', targetId, 'Tag')
      if (source.id === target.id) throw validationError('targetId', 'Choose a different tag.')
      renameTag(ctx, source.name, target.name)
      ctx.db.remove('tags', source.id)
      recordAudit(ctx, {
        action: 'merged',
        entity: 'setting',
        entityId: target.id,
        entityLabel: `Tag: ${source.name} → ${target.name}`,
        previousValue: { tag: source.name },
        newValue: { tag: target.name },
      })
      return {
        ...target,
        usageCount: ctx.db.all('leads').filter((lead) => lead.tags.includes(target.name)).length,
      }
    }),
  bulkDelete: (ids) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      for (const id of ids) {
        const row = ctx.db.get('tags', id, 'Tag')
        const used = ctx.db.all('leads').filter((lead) => lead.tags.includes(row.name)).length
        if (used > 0) conflict(`"${row.name}" is used by ${used} leads. Merge or replace it first.`)
        ctx.db.remove('tags', id)
        recordAudit(ctx, {
          action: 'deleted',
          entity: 'setting',
          entityId: id,
          entityLabel: `Tag: ${row.name}`,
          previousValue: { name: row.name },
          newValue: null,
        })
      }
    }),
}

export { mockTemplatesApi } from './templates'
