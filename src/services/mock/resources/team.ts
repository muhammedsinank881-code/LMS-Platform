import { ApiError } from '@/services/api/errors'
import type { DirectoryUser, Member, MemberFilterField, TeamApiClient } from '@/services/api/team'
import { ROLES, type Role, type User } from '@/types'
import { requireText } from '../core/config-crud'
import { request, type RequestContext } from '../core/context'
import { applyListParams, propertyValue, type ListSpec } from '../core/list-engine'
import { diffValues, recordAudit } from '../core/records'
import { newId } from '../core/util'
import { validationError } from '../core/validate'
import {
  assertLastAdmin,
  deactivateMember,
  inviteMembers,
  listInvitations,
  resendInvitation,
  revokeInvitation,
  toMember,
} from './team-members'

const FIELDS: readonly MemberFilterField[] = ['name', 'role', 'teamId', 'status']

/** Lower index = more privileged. */
const rank = (role: Role) => ROLES.indexOf(role)

const toDirectory = (u: User): DirectoryUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  teamId: u.teamId,
  avatarUrl: u.avatarUrl,
  status: u.status,
  language: u.language,
  location: u.location,
})

const spec = (ctx: RequestContext): ListSpec<Member, MemberFilterField> => ({
  fields: FIELDS,
  value: propertyValue,
  searchable: (u) => [u.name, u.email, u.location],
  defaultSort: [{ field: 'name', direction: 'asc' }],
  now: ctx.now,
})

function requireMember(ctx: RequestContext, id: string, action: 'view' | 'edit'): User {
  ctx.require('team', action)
  const user = ctx.db.get('users', id, 'Team member')
  ctx.assertInScope('team', user.id)
  return user
}

/** Nobody can hand out, or take away, privileges above their own. */
function assertCanGrant(ctx: RequestContext, role: Role): void {
  if (rank(role) < rank(ctx.actor.role)) {
    throw new ApiError('FORBIDDEN', 'You cannot grant a role higher than your own.')
  }
}

function assertTeam(ctx: RequestContext, teamId: string | null | undefined): void {
  if (teamId && !ctx.db.find('teams', teamId))
    throw validationError('teamId', 'Select a valid team.')
}

export const mockTeamApi: TeamApiClient = {
  directory: () => request((ctx) => ctx.db.all('users').map(toDirectory)),

  listMembers: (params) =>
    request((ctx) => {
      ctx.require('team', 'view')
      const members = ctx.db.all('users').filter((u) => ctx.inScope('team', u.id)).map((user) => toMember(ctx, user))
      return applyListParams(members, params, spec(ctx), 'team members')
    }),
  getMember: (id) => request((ctx) => toMember(ctx, requireMember(ctx, id, 'view'))),

  invite: (input) =>
    request((ctx) => {
      ctx.require('team', 'create')
      assertCanGrant(ctx, input.role)
      assertTeam(ctx, input.teamId)
      return inviteMembers(ctx, input.emails, input.role, input.teamId ?? null)
    }),
  listInvitations: () =>
    request((ctx) => {
      ctx.require('team', 'view')
      return listInvitations(ctx)
    }),
  resendInvitation: (id) =>
    request((ctx) => {
      ctx.require('team', 'create')
      return resendInvitation(ctx, id)
    }),
  revokeInvitation: (id) =>
    request((ctx) => {
      ctx.require('team', 'delete')
      revokeInvitation(ctx, id)
    }),

  updateMember: (id, patch) =>
    request((ctx) => {
      const user = requireMember(ctx, id, 'edit')
      assertCanGrant(ctx, user.role)
      assertLastAdmin(ctx, user, patch.role ?? user.role, patch.status ?? user.status)
      if (patch.role !== undefined && patch.role !== user.role) {
        if (id === ctx.actor.id) throw validationError('role', 'You cannot change your own role.')
        ctx.require('team', 'assign')
        assertCanGrant(ctx, patch.role)
      }
      if (patch.status === 'inactive' && id === ctx.actor.id) {
        throw validationError('status', 'You cannot deactivate yourself.')
      }
      assertTeam(ctx, patch.teamId)
      const saved = ctx.db.save('users', {
        ...user,
        ...(patch.role && { role: patch.role }),
        ...(patch.teamId !== undefined && { teamId: patch.teamId }),
        ...(patch.status && { status: patch.status }),
        ...(patch.language !== undefined && { language: patch.language }),
        ...(patch.location !== undefined && { location: patch.location }),
      })
      const diff = diffValues(user, saved, ['role', 'teamId', 'status', 'language', 'location'])
      if (diff) {
        recordAudit(ctx, {
          action: 'updated',
          entity: 'user',
          entityId: id,
          entityLabel: saved.name,
          ...diff,
        })
      }
      return saved
    }),

  deactivateMember: (id, input) =>
    request((ctx) => {
      const user = requireMember(ctx, id, 'edit')
      assertCanGrant(ctx, user.role)
      return deactivateMember(ctx, user, input)
    }),

  listTeams: () => request((ctx) => ctx.db.all('teams')),
  createTeam: (input) =>
    request((ctx) => {
      ctx.require('team', 'create')
      if (input.leaderId && !ctx.db.find('users', input.leaderId)) {
        throw validationError('leaderId', 'Select a valid team leader.')
      }
      return ctx.db.insert('teams', {
        id: newId('team'),
        name: requireText(input.name, 'name', 'Name'),
        leaderId: input.leaderId,
        color: input.color,
        createdAt: ctx.timestamp,
      })
    }),
  updateTeam: (id, patch) =>
    request((ctx) => {
      ctx.require('team', 'edit')
      const team = ctx.db.get('teams', id, 'Team')
      if (patch.leaderId && !ctx.db.find('users', patch.leaderId)) {
        throw validationError('leaderId', 'Select a valid team leader.')
      }
      return ctx.db.save('teams', {
        ...team,
        ...(patch.name !== undefined && { name: requireText(patch.name, 'name', 'Name') }),
        ...(patch.leaderId !== undefined && { leaderId: patch.leaderId }),
        ...(patch.color !== undefined && { color: patch.color }),
      })
    }),
  deleteTeam: (id) =>
    request((ctx) => {
      ctx.require('team', 'delete')
      const team = ctx.db.get('teams', id, 'Team')
      const members = ctx.db.all('users').filter((u) => u.teamId === id).length
      if (members > 0)
        throw new ApiError('CONFLICT', `${members} members are still in "${team.name}".`)
      ctx.db.remove('teams', id)
    }),
}
