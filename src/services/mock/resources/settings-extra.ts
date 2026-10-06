import { pickAssignee } from '@/lib/assignment'
import { isWithinBusinessHours, rulesForClock } from '@/lib/settings/business-hours'
import {
  changesToAudit,
  DEFAULT_PERMISSION_MATRIX,
  defaultSectionGrants,
  diffMatrix,
  diffSectionGrants,
  superAdminIsLocked,
} from '@/lib/permissions'
import type { AssignmentSample, ProfileInput } from '@/services/api/settings'
import { PLAN_LIMITS, type BillingSnapshot, type TenantPlan } from '@/types'
import { ApiError } from '@/services/api/errors'
import { requireText } from '../core/config-crud'
import { request, type RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import { validationError } from '../core/validate'

function settingsRow(ctx: RequestContext) {
  const row = ctx.db.find('tenantSettings', ctx.tenantId)
  if (!row) throw new ApiError('NOT_FOUND', 'Workspace settings not found.')
  return row
}

function currentPermissions(ctx: RequestContext) {
  const row = settingsRow(ctx)
  return {
    matrix: row.permissions ?? DEFAULT_PERMISSION_MATRIX,
    sectionGrants: row.sectionGrants ?? defaultSectionGrants(),
  }
}

const MAX_AVATAR = 400_000

export const profileApi = {
  update: (patch: ProfileInput) =>
    request((ctx) => {
      ctx.require('settings', 'edit')
      const user = ctx.db.get('users', ctx.actor.id, 'User')
      if (patch.avatarUrl && patch.avatarUrl.length > MAX_AVATAR) {
        throw validationError('avatarUrl', 'That image is too large. Use a smaller file.')
      }
      if (patch.avatarUrl && !patch.avatarUrl.startsWith('data:image/')) {
        throw validationError('avatarUrl', 'Upload an image file.')
      }
      const saved = ctx.db.save('users', {
        ...user,
        ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
        ...(patch.phone !== undefined && { phone: patch.phone }),
        ...(patch.language !== undefined && { language: patch.language }),
        ...(patch.timezone !== undefined && { timezone: patch.timezone }),
        ...(patch.avatarUrl !== undefined && { avatarUrl: patch.avatarUrl }),
      })
      recordAudit(ctx, {
        action: 'updated',
        entity: 'user',
        entityId: saved.id,
        entityLabel: saved.name,
        previousValue: { name: user.name, phone: user.phone ?? null, language: user.language },
        newValue: { name: saved.name, phone: saved.phone ?? null, language: saved.language },
      })
      return saved
    }),
}

export const permissionsApi = {
  get: () => request((ctx) => currentPermissions(ctx)),
  update: (next: ReturnType<typeof currentPermissions>) =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      if (!superAdminIsLocked(next.matrix, next.sectionGrants)) {
        throw new ApiError('FORBIDDEN', 'Super admin permissions are locked.')
      }
      const row = settingsRow(ctx)
      const previous = currentPermissions(ctx)
      ctx.db.save('tenantSettings', { ...row, permissions: next.matrix, sectionGrants: next.sectionGrants })
      const changes = [
        ...diffMatrix(previous.matrix, next.matrix),
        ...diffSectionGrants(previous.sectionGrants, next.sectionGrants),
      ]
      const diff = changesToAudit(changes)
      if (diff) {
        recordAudit(ctx, {
          action: 'settings_changed',
          entity: 'setting',
          entityId: 'permissions',
          entityLabel: 'Permissions',
          ...diff,
        })
      }
      return next
    }),
  reset: () =>
    request((ctx) => {
      ctx.requireWorkspaceAdmin()
      const row = settingsRow(ctx)
      const previous = currentPermissions(ctx)
      const next = { matrix: DEFAULT_PERMISSION_MATRIX, sectionGrants: defaultSectionGrants() }
      ctx.db.save('tenantSettings', { ...row, permissions: next.matrix, sectionGrants: next.sectionGrants })
      const diff = changesToAudit([
        ...diffMatrix(previous.matrix, next.matrix),
        ...diffSectionGrants(previous.sectionGrants, next.sectionGrants),
      ])
      recordAudit(ctx, {
        action: 'settings_changed',
        entity: 'setting',
        entityId: 'permissions',
        entityLabel: 'Permissions reset',
        previousValue: diff?.previousValue ?? null,
        newValue: diff?.newValue ?? { reset: true },
      })
      return next
    }),
}

function planOf(ctx: RequestContext): TenantPlan {
  return settingsRow(ctx).plan ?? 'pro'
}

export const billingApi = {
  get: () =>
    request((ctx): BillingSnapshot => {
      ctx.require('settings', 'view')
      const plan = planOf(ctx)
      const users = ctx.db.all('users').filter((user) => user.status !== 'inactive').length
      const leads = ctx.db.all('leads').filter((lead) => !lead.archivedAt).length
      return {
        plan,
        limits: PLAN_LIMITS[plan],
        usage: { users, leads, storageMb: Math.round(leads * 0.4) },
        invoices: [
          { id: 'inv-1008', issuedAt: '2026-09-01T00:00:00.000Z', amount: plan === 'free' ? 0 : 4999, status: 'paid' },
          { id: 'inv-1007', issuedAt: '2026-08-01T00:00:00.000Z', amount: plan === 'free' ? 0 : 4999, status: 'paid' },
        ],
      }
    }),
}

export function evaluateRules(sample: AssignmentSample) {
  return request((ctx) => {
    ctx.requireWorkspaceAdmin()
    const workspace = settingsRow(ctx).workspace
    const open = isWithinBusinessHours(ctx.now, workspace.businessHours, workspace.timezone)
    const rules = rulesForClock(ctx.db.all('assignmentRules'), open)
    const users = ctx.db.all('users')
    return pickAssignee(
      sample,
      rules,
      users,
      ctx.db.all('leads'),
      ctx.now,
      workspace.assignmentFallback,
    )
  })
}
