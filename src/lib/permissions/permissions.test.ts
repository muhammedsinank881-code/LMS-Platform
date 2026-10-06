import { describe, expect, it } from 'vitest'
import { ACTIONS, RESOURCES, ROLES, type PermissionMatrix, type Role } from '@/types'
import { can, getDataScope } from './can'
import { DEFAULT_PERMISSION_MATRIX } from './matrix'

const as = (role: Role) => ({ role })

describe('can', () => {
  it('denies everything to signed-out users', () => {
    expect(can(null, 'dashboard', 'view')).toBe(false)
    expect(can(undefined, 'leads', 'view')).toBe(false)
  })

  describe.each(['super_admin', 'admin'] as const)('%s', (role) => {
    it('has every action on every editable module', () => {
      for (const resource of RESOURCES) {
        if (resource === 'dashboard' || resource === 'audit_logs') continue
        for (const action of ACTIONS) expect(can(as(role), resource, action)).toBe(true)
      }
    })

    it('can view and export audit logs but never change them', () => {
      expect(can(as(role), 'audit_logs', 'view')).toBe(true)
      expect(can(as(role), 'audit_logs', 'export')).toBe(true)
      expect(can(as(role), 'audit_logs', 'delete')).toBe(false)
      expect(can(as(role), 'audit_logs', 'edit')).toBe(false)
    })
  })

  describe('manager', () => {
    it('manages leads end to end, including import and export', () => {
      for (const action of ACTIONS) expect(can(as('manager'), 'leads', action)).toBe(true)
    })

    it('cannot see audit logs or delete team members', () => {
      expect(can(as('manager'), 'audit_logs', 'view')).toBe(false)
      expect(can(as('manager'), 'team', 'delete')).toBe(false)
    })

    it('can view reports and automations but not import into reports', () => {
      expect(can(as('manager'), 'reports', 'view')).toBe(true)
      expect(can(as('manager'), 'automations', 'view')).toBe(true)
      expect(can(as('manager'), 'reports', 'import')).toBe(false)
    })
  })

  describe('team_leader', () => {
    it('can assign leads but not delete or import them', () => {
      expect(can(as('team_leader'), 'leads', 'assign')).toBe(true)
      expect(can(as('team_leader'), 'leads', 'delete')).toBe(false)
      expect(can(as('team_leader'), 'leads', 'import')).toBe(false)
    })

    it('has no access to automations or audit logs', () => {
      expect(can(as('team_leader'), 'automations', 'view')).toBe(false)
      expect(can(as('team_leader'), 'audit_logs', 'view')).toBe(false)
    })

    it('can view the team page but not invite members', () => {
      expect(can(as('team_leader'), 'team', 'view')).toBe(true)
      expect(can(as('team_leader'), 'team', 'create')).toBe(false)
    })
  })

  describe('salesperson', () => {
    it('can work their own leads and follow-ups', () => {
      expect(can(as('salesperson'), 'leads', 'view')).toBe(true)
      expect(can(as('salesperson'), 'leads', 'create')).toBe(true)
      expect(can(as('salesperson'), 'followups', 'edit')).toBe(true)
    })

    it('cannot assign, delete, export or import leads', () => {
      for (const action of ['assign', 'delete', 'export', 'import'] as const) {
        expect(can(as('salesperson'), 'leads', action)).toBe(false)
      }
    })

    it('has no access to team, campaigns, automations or audit logs', () => {
      for (const resource of ['team', 'campaigns', 'automations', 'audit_logs'] as const) {
        expect(can(as('salesperson'), resource, 'view')).toBe(false)
      }
    })
  })

  it('honours a custom matrix', () => {
    const custom: PermissionMatrix = {
      ...DEFAULT_PERMISSION_MATRIX,
      salesperson: {
        ...DEFAULT_PERMISSION_MATRIX.salesperson,
        leads: { scope: 'own', actions: ['view', 'export'] },
      },
    }
    expect(can(as('salesperson'), 'leads', 'export', custom)).toBe(true)
    expect(can(as('salesperson'), 'leads', 'create', custom)).toBe(false)
  })
})

describe('getDataScope', () => {
  it('returns null for signed-out users', () => {
    expect(getDataScope(null, 'leads')).toBeNull()
  })

  it.each([
    ['super_admin', 'all'],
    ['admin', 'all'],
    ['manager', 'all'],
    ['team_leader', 'team'],
    ['salesperson', 'own'],
  ] as const)('%s sees %s leads', (role, scope) => {
    expect(getDataScope(as(role), 'leads')).toBe(scope)
  })

  it('returns null when the role has no access to the resource', () => {
    expect(getDataScope(as('salesperson'), 'team')).toBeNull()
    expect(getDataScope(as('manager'), 'audit_logs')).toBeNull()
    expect(getDataScope(as('team_leader'), 'automations')).toBeNull()
  })

  it('scopes settings to the own profile for non-admins', () => {
    expect(getDataScope(as('admin'), 'settings')).toBe('all')
    for (const role of ['manager', 'team_leader', 'salesperson'] as const) {
      expect(getDataScope(as(role), 'settings')).toBe('own')
    }
  })

  it('never returns a scope for a resource without any granted action', () => {
    for (const role of ROLES) {
      for (const resource of RESOURCES) {
        const hasAny = ACTIONS.some((action) => can(as(role), resource, action))
        expect(getDataScope(as(role), resource) !== null).toBe(hasAny)
      }
    }
  })
})
