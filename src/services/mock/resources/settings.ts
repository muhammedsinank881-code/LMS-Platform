import { ApiError } from '@/services/api/errors'
import type {
  AssignmentRuleInput,
  CustomFieldInput,
  LostReasonInput,
  QualificationQuestionInput,
  ScoringRuleInput,
  SettingsApiClient,
} from '@/services/api/settings'
import type { AuditValue } from '@/types/audit'
import type { ScoringThresholds, WorkspaceSettings } from '@/types/settings'
import { needsOptions, uniqueOptions } from '@/lib/settings/custom-field'
import { LEAD_FILTER_FIELDS, type FilterCondition } from '@/types'
import { createConfigApi, nextOrder, requireText } from '../core/config-crud'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { validationError } from '../core/validate'
import { mockTagsApi } from './config'
import { billingApi, evaluateRules, permissionsApi, profileApi } from './settings-extra'
import { assertRepeat, assertRuleConditions, scoringExtras } from './scoring'

const KNOWN_FIELDS: readonly string[] = LEAD_FILTER_FIELDS

function checkConditions(conditions: readonly FilterCondition[] | undefined): void {
  const unknown = (conditions ?? []).find((c) => !KNOWN_FIELDS.includes(c.field))
  if (unknown) throw validationError('conditions', `"${unknown.field}" is not a lead field.`)
}

function fieldOptions(type: string, options: string[]): string[] {
  if (!needsOptions(type as 'dropdown')) return options
  const unique = uniqueOptions(options)
  if (!unique || unique.length === 0) throw validationError('options', 'Add unique options.')
  return unique
}

function fieldInUse(ctx: RequestContext, entity: string, key: string): boolean {
  const rows =
    entity === 'deal' ? ctx.db.all('deals') : entity === 'customer' ? ctx.db.all('customers') : ctx.db.all('leads')
  return rows.some((row) => {
    const value = row.customFields?.[key]
    return value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)
  })
}

function workspaceSnapshot(workspace: WorkspaceSettings): AuditValue {
  const hours = workspace.businessHours
  return {
    name: workspace.name,
    currency: workspace.currency,
    timezone: workspace.timezone,
    logoUrl: workspace.logoUrl ?? null,
    dateFormat: workspace.dateFormat ?? null,
    businessHours: hours ? `${hours.days.join(',')} ${hours.start}–${hours.end}` : null,
    fiscalYearStart: workspace.fiscalYearStart ?? null,
    defaultStatusId: workspace.defaultStatusId ?? null,
    assignmentFallback: workspace.assignmentFallback?.userId ?? null,
  }
}

function workspaceSettingsRow(ctx: RequestContext) {
  const row = ctx.db.find('tenantSettings', ctx.tenantId)
  if (!row) throw new ApiError('NOT_FOUND', 'Workspace settings not found.')
  return row
}

const settingsCore = {
  workspace: {
    get: () => request((ctx) => workspaceSettingsRow(ctx).workspace),
    update: (patch: Partial<WorkspaceSettings>) =>
      request((ctx) => {
        ctx.requireWorkspaceAdmin()
        const row = workspaceSettingsRow(ctx)
        const workspace = {
          ...row.workspace,
          ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
          ...(patch.currency !== undefined && { currency: patch.currency }),
          ...(patch.timezone !== undefined && { timezone: patch.timezone }),
          ...(patch.logoUrl !== undefined && { logoUrl: patch.logoUrl }),
          ...(patch.dateFormat !== undefined && { dateFormat: patch.dateFormat }),
          ...(patch.businessHours !== undefined && { businessHours: patch.businessHours }),
          ...(patch.fiscalYearStart !== undefined && { fiscalYearStart: patch.fiscalYearStart }),
          ...(patch.defaultStatusId !== undefined && { defaultStatusId: patch.defaultStatusId }),
          ...(patch.assignmentFallback !== undefined && { assignmentFallback: patch.assignmentFallback }),
        }
        ctx.db.save('tenantSettings', { ...row, workspace })
        recordAudit(ctx, {
          action: 'settings_changed',
          entity: 'setting',
          entityId: 'workspace',
          entityLabel: 'Workspace settings',
          previousValue: workspaceSnapshot(row.workspace),
          newValue: workspaceSnapshot(workspace),
        })
        return workspace
      }),
  },

  customFields: createConfigApi<'customFields', CustomFieldInput, Partial<CustomFieldInput>>({
    table: 'customFields',
    label: 'Custom field',
    idPrefix: 'cf',
    orderField: 'order',
    nameOf: (row) => row.label,
    build(_ctx, input, existing) {
      const key = requireText(input.key, 'key', 'Key')
      if (existing.some((f) => f.entity === input.entity && f.key === key)) {
        throw new ApiError('CONFLICT', `A ${input.entity} field with key "${key}" exists.`)
      }
      return {
        entity: input.entity,
        key,
        label: requireText(input.label, 'label', 'Label'),
        type: input.type,
        options: fieldOptions(input.type, input.options),
        required: input.required,
        order: input.order ?? nextOrder(existing),
        helpText: input.helpText ?? '',
        defaultValue: input.defaultValue ?? null,
        validation: input.validation ?? {},
        showInTable: input.showInTable ?? false,
        archived: false,
      }
    },
    apply: (ctx, row, patch) => {
      if (patch.key !== undefined && patch.key !== row.key) {
        throw new ApiError('CONFLICT', 'A custom field key cannot change after it is created.')
      }
      const type = patch.type ?? row.type
      return {
        ...row,
        ...(patch.label !== undefined && { label: requireText(patch.label, 'label', 'Label') }),
        type,
        ...(patch.options !== undefined && { options: fieldOptions(type, patch.options) }),
        ...(patch.required !== undefined && { required: patch.required }),
        ...(patch.order !== undefined && { order: patch.order }),
        ...(patch.helpText !== undefined && { helpText: patch.helpText }),
        ...(patch.defaultValue !== undefined && { defaultValue: patch.defaultValue }),
        ...(patch.validation !== undefined && { validation: patch.validation }),
        ...(patch.showInTable !== undefined && { showInTable: patch.showInTable }),
        ...(patch.archived !== undefined && { archived: patch.archived }),
        ...(patch.archived === undefined && fieldInUse(ctx, row.entity, row.key) ? {} : {}),
      }
    },
    guardDelete(ctx, row) {
      if (fieldInUse(ctx, row.entity, row.key)) {
        throw new ApiError('CONFLICT', `"${row.label}" has saved values. Archive it instead of deleting it.`)
      }
    },
  }),

  scoringRules: {
    ...createConfigApi<'scoringRules', ScoringRuleInput, Partial<ScoringRuleInput>>({
      table: 'scoringRules',
      label: 'Scoring rule',
      idPrefix: 'score',
      orderField: 'order',
      nameOf: (row) => row.name,
      build(ctx, input, existing) {
        assertRuleConditions(ctx, input.conditions)
        assertRepeat(input.maxApplications, input.repeatField)
        if (!Number.isInteger(input.points) || Math.abs(input.points) > 100) {
          throw validationError('points', 'Points must be a whole number between -100 and 100.')
        }
        return {
          name: requireText(input.name, 'name', 'Name'),
          conditions: input.conditions,
          points: input.points,
          isActive: input.isActive,
          order: input.order ?? nextOrder(existing),
          maxApplications: input.maxApplications ?? 'once',
          repeatField: input.repeatField ?? null,
        }
      },
      apply(ctx, row, patch) {
        assertRuleConditions(ctx, patch.conditions)
        assertRepeat(patch.maxApplications ?? row.maxApplications, patch.repeatField ?? row.repeatField)
        return {
          ...row,
          ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
          ...(patch.conditions !== undefined && { conditions: patch.conditions }),
          ...(patch.points !== undefined && { points: patch.points }),
          ...(patch.isActive !== undefined && { isActive: patch.isActive }),
          ...(patch.order !== undefined && { order: patch.order }),
          ...(patch.maxApplications !== undefined && { maxApplications: patch.maxApplications }),
          ...(patch.repeatField !== undefined && { repeatField: patch.repeatField }),
        }
      },
    }),
    ...scoringExtras,
    getThresholds: () => request((ctx) => workspaceSettingsRow(ctx).scoringThresholds),
    updateThresholds: (thresholds: ScoringThresholds) =>
      request((ctx) => {
        ctx.requireWorkspaceAdmin()
        const { hot, warm } = thresholds
        if (!(warm >= 0 && hot <= 100 && warm < hot)) {
          throw validationError('hot', 'Warm must be lower than hot, both between 0 and 100.')
        }
        const row = workspaceSettingsRow(ctx)
        ctx.db.save('tenantSettings', { ...row, scoringThresholds: { hot, warm } })
        recordAudit(ctx, {
          action: 'settings_changed',
          entity: 'setting',
          entityId: 'scoring-thresholds',
          entityLabel: 'Scoring thresholds',
          previousValue: { ...row.scoringThresholds },
          newValue: { hot, warm },
        })
        return { hot, warm }
      }),
  },

  qualificationQuestions: createConfigApi<
    'qualificationQuestions',
    QualificationQuestionInput,
    Partial<QualificationQuestionInput>
  >({
    table: 'qualificationQuestions',
    label: 'Qualification question',
    idPrefix: 'qq',
    orderField: 'order',
    nameOf: (row) => row.question,
    build(_ctx, input, existing) {
      if (input.type === 'dropdown' && input.options.length === 0) {
        throw validationError('options', 'Add at least one option.')
      }
      return {
        question: requireText(input.question, 'question', 'Question'),
        type: input.type,
        options: input.options,
        required: input.required,
        isActive: input.isActive ?? true,
        order: input.order ?? nextOrder(existing),
      }
    },
    apply: (_ctx, row, patch) => ({
      ...row,
      ...(patch.question !== undefined && {
        question: requireText(patch.question, 'question', 'Question'),
      }),
      ...(patch.type !== undefined && { type: patch.type }),
      ...(patch.options !== undefined && { options: patch.options }),
      ...(patch.required !== undefined && { required: patch.required }),
      ...(patch.isActive !== undefined && { isActive: patch.isActive }),
      ...(patch.order !== undefined && { order: patch.order }),
    }),
  }),

  assignmentRules: createConfigApi<'assignmentRules', AssignmentRuleInput, Partial<AssignmentRuleInput>>({
    table: 'assignmentRules',
    label: 'Assignment rule',
    idPrefix: 'assign',
    orderField: 'priority',
    nameOf: (row) => row.name,
    build(ctx, input, existing) {
      checkConditions(input.conditions)
      const missing = input.pool.userIds.find((id) => !ctx.db.find('users', id))
      if (missing)
        throw validationError('pool', 'The pool lists someone who is not in this workspace.')
      return {
        ...input,
        name: requireText(input.name, 'name', 'Name'),
        priority: input.priority || nextOrder(existing),
      }
    },
    apply(_ctx, row, patch) {
      checkConditions(patch.conditions)
      return {
        ...row,
        ...patch,
        name: patch.name === undefined ? row.name : requireText(patch.name, 'name', 'Name'),
      }
    },
  }),

  lostReasons: createConfigApi<'lostReasons', LostReasonInput, Partial<LostReasonInput>>({
    table: 'lostReasons',
    label: 'Lost reason',
    idPrefix: 'lost',
    orderField: 'order',
    nameOf: (row) => row.name,
    build: (_ctx, input, existing) => ({
      name: requireText(input.name, 'name', 'Name'),
      isActive: input.isActive,
      order: input.order ?? nextOrder(existing),
    }),
    apply: (_ctx, row, patch) => ({
      ...row,
      ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
      ...(patch.isActive !== undefined && { isActive: patch.isActive }),
      ...(patch.order !== undefined && { order: patch.order }),
    }),
    present: (ctx, row) => ({
      ...row,
      usageCount:
        ctx.db.all('leads').filter((lead) => lead.lostReasonId === row.id).length +
        ctx.db.all('deals').filter((deal) => deal.lostReasonId === row.id).length,
    }),
    guardDelete(ctx, row) {
      const used =
        ctx.db.all('leads').filter((l) => l.lostReasonId === row.id).length +
        ctx.db.all('deals').filter((d) => d.lostReasonId === row.id).length
      if (used > 0) {
        throw new ApiError(
          'CONFLICT',
          `"${row.name}" is used by ${used} records. Deactivate it instead.`,
        )
      }
    },
  }),

  tags: mockTagsApi,
}

export const mockSettingsApi: SettingsApiClient = {
  ...settingsCore,
  profile: profileApi,
  permissions: permissionsApi,
  billing: billingApi,
  assignmentRules: { ...settingsCore.assignmentRules, evaluate: evaluateRules },
}
