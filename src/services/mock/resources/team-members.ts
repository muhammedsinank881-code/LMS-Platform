import { pickAssignee } from '@/lib/assignment'
import { isWithinBusinessHours, rulesForClock } from '@/lib/settings/business-hours'
import { normalizeEmail } from '@/lib/duplicates'
import { ApiError } from '@/services/api/errors'
import type { DeactivateMemberInput, Invitation, Member } from '@/services/api/team'
import { ROLES, type Role, type User } from '@/types'
import { readDb, writeDb } from '../auth/auth-db'
import { requireText } from '../core/config-crud'
import type { RequestContext } from '../core/context'
import { recordAudit } from '../core/records'
import type { WorkspaceInvitation } from '../core/store'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import { adjustWorkload } from './leads/changes'

const ADMINS = new Set<Role>(['super_admin', 'admin'])

export function toMember(ctx: RequestContext, user: User): Member {
  const openStatus = new Set(
    ctx.db.all('leadStatuses').filter((status) => status.type === 'open').map((status) => status.id),
  )
  return {
    ...user,
    openLeads: ctx.db
      .all('leads')
      .filter((lead) => lead.assignedTo === user.id && !lead.archivedAt && openStatus.has(lead.statusId)).length,
    openFollowUps: ctx.db
      .all('followUps')
      .filter((item) => item.assigneeId === user.id && item.status !== 'done').length,
  }
}

export function assertLastAdmin(ctx: RequestContext, user: User, nextRole: Role, nextStatus: User['status']): void {
  const wasAdmin = ADMINS.has(user.role) && user.status === 'active'
  const stays = ADMINS.has(nextRole) && nextStatus === 'active'
  if (!wasAdmin || stays) return
  const others = ctx.db
    .all('users')
    .filter((member) => member.id !== user.id && member.status === 'active' && ADMINS.has(member.role))
  if (others.length === 0) {
    throw new ApiError('CONFLICT', 'The workspace needs at least one active admin.')
  }
}

function toInvitation(row: WorkspaceInvitation): Invitation {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    teamId: row.teamId,
    token: row.token,
    invitedByName: row.invitedByName,
    userId: row.userId,
    createdAt: row.createdAt,
  }
}

function writeAuthInvite(row: WorkspaceInvitation): void {
  const db = readDb()
  db.invitations = db.invitations.filter((item) => item.email !== row.email || item.tenantId !== row.tenantId)
  db.invitations.push({
    token: row.token,
    email: row.email,
    tenantId: row.tenantId,
    role: row.role,
    invitedByName: row.invitedByName,
  })
  writeDb(db)
}

function dropAuthInvite(token: string): void {
  const db = readDb()
  db.invitations = db.invitations.filter((item) => item.token !== token)
  writeDb(db)
}

export function inviteMembers(
  ctx: RequestContext,
  emails: string[],
  role: Role,
  teamId: string | null,
): Invitation[] {
  if (emails.length === 0) throw validationError('emails', 'Enter at least one email address.')
  const created: Invitation[] = []
  for (const raw of emails) {
    const email = normalizeEmail(raw)
    if (!email || !email.includes('@')) throw validationError('emails', `"${raw}" is not a valid email.`)
    if (ctx.db.all('users').some((user) => user.email.toLowerCase() === email)) {
      throw new ApiError('CONFLICT', `${email} is already in this workspace.`)
    }
    const user = ctx.db.insert('users', {
      id: newId('user'),
      name: requireText(email.split('@')[0], 'emails', 'Email'),
      email,
      role,
      teamId,
      avatarUrl: null,
      language: 'English',
      location: '',
      workload: 0,
      status: 'invited',
      phone: null,
      createdAt: ctx.timestamp,
    })
    const row = ctx.db.insert('invitations', {
      id: newId('invite'),
      email,
      role,
      teamId,
      token: newId('token'),
      invitedByName: ctx.actor.name,
      userId: user.id,
      createdAt: ctx.timestamp,
    })
    writeAuthInvite(row)
    recordAudit(ctx, {
      action: 'created',
      entity: 'user',
      entityId: user.id,
      entityLabel: user.name,
      newValue: { role, email },
    })
    created.push(toInvitation(row))
  }
  return created
}

export function listInvitations(ctx: RequestContext): Invitation[] {
  return ctx.db.all('invitations').map(toInvitation)
}

export function resendInvitation(ctx: RequestContext, id: string): Invitation {
  const row = ctx.db.get('invitations', id, 'Invitation')
  dropAuthInvite(row.token)
  const saved = ctx.db.save('invitations', { ...row, token: newId('token'), createdAt: ctx.timestamp })
  writeAuthInvite(saved)
  return toInvitation(saved)
}

export function revokeInvitation(ctx: RequestContext, id: string): void {
  const row = ctx.db.get('invitations', id, 'Invitation')
  const user = ctx.db.find('users', row.userId)
  if (user && user.status !== 'invited') {
    throw new ApiError('CONFLICT', 'That invitation was already accepted.')
  }
  dropAuthInvite(row.token)
  ctx.db.remove('invitations', id)
  if (user) ctx.db.remove('users', user.id)
  recordAudit(ctx, {
    action: 'deleted',
    entity: 'user',
    entityId: row.userId,
    entityLabel: row.email,
    previousValue: { email: row.email, role: row.role },
    newValue: null,
  })
}

export function deactivateMember(ctx: RequestContext, user: User, input: DeactivateMemberInput): User {
  if (user.id === ctx.actor.id) throw validationError('status', 'You cannot deactivate yourself.')
  assertLastAdmin(ctx, user, user.role, 'inactive')
  const openStatus = new Set(
    ctx.db.all('leadStatuses').filter((status) => status.type === 'open').map((status) => status.id),
  )
  const open = ctx.db.all('leads').filter((lead) => lead.assignedTo === user.id && !lead.archivedAt && openStatus.has(lead.statusId))
  if (input.mode === 'user') {
    if (!input.userId || input.userId === user.id || !ctx.db.find('users', input.userId)) {
      throw validationError('userId', 'Choose someone to receive the open leads.')
    }
    for (const lead of open) {
      ctx.db.save('leads', { ...lead, assignedTo: input.userId, assignedAt: ctx.timestamp })
      adjustWorkload(ctx, user.id, -1)
      adjustWorkload(ctx, input.userId, 1)
    }
  } else {
    const workspace = ctx.db.find('tenantSettings', ctx.tenantId)?.workspace
    const hoursOpen = workspace
      ? isWithinBusinessHours(ctx.now, workspace.businessHours, workspace.timezone)
      : true
    const rules = rulesForClock(ctx.db.all('assignmentRules'), hoursOpen)
    const users = ctx.db.all('users').filter((member) => member.id !== user.id)
    for (const lead of open) {
      const picked = pickAssignee(lead, rules, users, ctx.db.all('leads'), ctx.now, workspace?.assignmentFallback)
      ctx.db.save('leads', { ...lead, assignedTo: picked.userId, assignedAt: picked.userId ? ctx.timestamp : null })
      adjustWorkload(ctx, user.id, -1)
      adjustWorkload(ctx, picked.userId, 1)
    }
  }
  const saved = ctx.db.save('users', { ...ctx.db.get('users', user.id), status: 'inactive' })
  recordAudit(ctx, {
    action: 'updated',
    entity: 'user',
    entityId: user.id,
    entityLabel: user.name,
    previousValue: { status: user.status },
    newValue: { status: 'inactive', reassigned: open.length },
  })
  return saved
}

export const roleRank = (role: Role) => ROLES.indexOf(role)
