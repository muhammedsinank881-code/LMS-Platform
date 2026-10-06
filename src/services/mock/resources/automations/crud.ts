import { allowedActionTypes, hasErrors, validateAutomation, type ValidationRefs } from '@/lib/automation'
import { ApiError } from '@/services/api/errors'
import type {
  Automation,
  AutomationContent,
  AutomationFilterField,
  AutomationInput,
  AutomationVersion,
} from '@/types'
import type { RequestContext } from '../../core/context'
import type { ListSpec } from '../../core/list-engine'
import { propertyValue } from '../../core/list-engine'
import { recordAudit } from '../../core/records'
import { newId } from '../../core/util'
import { validationError } from '../../core/validate'

export const FIELDS: readonly AutomationFilterField[] = ['name', 'enabled', 'runCount', 'updatedAt', 'status']

export function listSpec(ctx: RequestContext): ListSpec<Automation, AutomationFilterField> {
  return {
    fields: FIELDS,
    value: propertyValue,
    searchable: (a) => [a.name, a.description],
    defaultSort: [{ field: 'updatedAt', direction: 'desc' }],
    now: ctx.now,
  }
}

const ids = <T extends { id: string }>(rows: T[]): Set<string> => new Set(rows.map((r) => r.id))

/** What still exists in the workspace, for the same validation the builder runs. */
export function validationRefs(ctx: RequestContext): ValidationRefs {
  return {
    users: ids(ctx.db.all('users')),
    teams: ids(ctx.db.all('teams')),
    templates: ids(ctx.db.all('templates')),
    statuses: ids(ctx.db.all('leadStatuses')),
    sources: ids(ctx.db.all('leadSources')),
    pipelines: ids(ctx.db.all('pipelines')),
    stages: ids(ctx.db.all('stages')),
    customFieldKeys: ctx.db.all('customFields').filter((f) => f.entity === 'lead').map((f) => f.key),
    allowedActions: allowedActionTypes((resource, action) => ctx.can(resource, action)),
  }
}

export function contentOf(a: AutomationContent): AutomationContent {
  return { name: a.name, description: a.description, trigger: a.trigger, conditions: a.conditions, actions: a.actions }
}

function auditAutomation(
  ctx: RequestContext,
  action: 'created' | 'updated' | 'deleted',
  a: Automation,
  detail: Record<string, string | number | boolean> = {},
): void {
  recordAudit(ctx, {
    action,
    entity: 'automation',
    entityId: a.id,
    entityLabel: a.name,
    newValue: action === 'deleted' ? null : { status: a.status, enabled: a.enabled, version: a.version, ...detail },
  })
}

export function createDraft(ctx: RequestContext, input: AutomationInput): Automation {
  ctx.require('automations', 'create')
  if (!input.name.trim()) throw validationError('name', 'Name is required.')
  const saved = ctx.db.insert('automations', {
    ...contentOf(input),
    name: input.name.trim(),
    id: newId('auto'),
    status: 'draft',
    enabled: false,
    version: 0,
    runCount: 0,
    lastRunAt: null,
    errorCount: 0,
    consecutiveFailures: 0,
    createdBy: ctx.actor.id,
    createdAt: ctx.timestamp,
    updatedAt: ctx.timestamp,
  })
  auditAutomation(ctx, 'created', saved)
  return saved
}

/** Saving a draft pauses a published automation until it is published again. */
export function saveDraft(ctx: RequestContext, id: string, patch: Partial<AutomationInput>): Automation {
  ctx.require('automations', 'edit')
  const current = ctx.db.get('automations', id, 'Automation')
  if (patch.name !== undefined && !patch.name.trim()) throw validationError('name', 'Name is required.')
  const saved = ctx.db.save('automations', {
    ...current,
    ...(patch.name !== undefined && { name: patch.name.trim() }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.trigger !== undefined && { trigger: patch.trigger }),
    ...(patch.conditions !== undefined && { conditions: patch.conditions }),
    ...(patch.actions !== undefined && { actions: patch.actions }),
    status: 'draft',
    enabled: false,
    updatedAt: ctx.timestamp,
  })
  auditAutomation(ctx, 'updated', saved, { saved: 'draft' })
  return saved
}

export function publish(ctx: RequestContext, id: string, input?: AutomationInput): Automation {
  ctx.require('automations', 'edit')
  const current = ctx.db.get('automations', id, 'Automation')
  const content: AutomationContent = input ? contentOf({ ...current, ...input }) : contentOf(current)
  const issues = validateAutomation(content, validationRefs(ctx))
  const errors = issues.filter((i) => i.severity === 'error')
  if (hasErrors(issues)) throw validationError('actions', errors[0].message)

  const version = current.version + 1
  const saved = ctx.db.save('automations', {
    ...current,
    ...content,
    name: content.name.trim(),
    status: 'published',
    enabled: input?.enabled ?? true,
    version,
    consecutiveFailures: 0,
    updatedAt: ctx.timestamp,
  })
  const snapshot: AutomationVersion = {
    ...contentOf(saved),
    id: newId('autover'),
    tenantId: ctx.tenantId,
    automationId: id,
    version,
    publishedAt: ctx.timestamp,
    publishedBy: ctx.actor.id,
  }
  ctx.db.insert('automationVersions', snapshot)
  auditAutomation(ctx, 'updated', saved, { published: version })
  return saved
}

export function setEnabled(ctx: RequestContext, id: string, enabled: boolean): Automation {
  ctx.require('automations', 'edit')
  const current = ctx.db.get('automations', id, 'Automation')
  if (enabled && current.status !== 'published') {
    throw new ApiError('CONFLICT', 'Publish this automation before turning it on.')
  }
  const saved = ctx.db.save('automations', {
    ...current,
    enabled,
    consecutiveFailures: enabled ? 0 : current.consecutiveFailures,
    updatedAt: ctx.timestamp,
  })
  auditAutomation(ctx, 'updated', saved)
  return saved
}

export function duplicate(ctx: RequestContext, id: string): Automation {
  const current = ctx.db.get('automations', id, 'Automation')
  return createDraft(ctx, { ...contentOf(current), name: `${current.name} (copy)` })
}

export function remove(ctx: RequestContext, id: string): void {
  ctx.require('automations', 'delete')
  const current = ctx.db.get('automations', id, 'Automation')
  ctx.db.remove('automations', id)
  for (const run of ctx.db.all('automationRuns')) if (run.automationId === id) ctx.db.remove('automationRuns', run.id)
  for (const v of ctx.db.all('automationVersions')) if (v.automationId === id) ctx.db.remove('automationVersions', v.id)
  auditAutomation(ctx, 'deleted', current)
}

export function restoreVersion(ctx: RequestContext, id: string, version: number): Automation {
  const snapshot = ctx.db.all('automationVersions').find((v) => v.automationId === id && v.version === version)
  if (!snapshot) throw new ApiError('NOT_FOUND', 'Version not found.')
  return saveDraft(ctx, id, contentOf(snapshot))
}
