import {
  ACTIONS,
  type Action,
  type DataScope,
  type PermissionMatrix,
  type Resource,
  type ResourceAccess,
  type Role,
} from '@/types'

function grant(scope: DataScope, ...actions: Action[]): ResourceAccess {
  return { scope, actions }
}

const NONE: ResourceAccess = { scope: 'own', actions: [] }

const ADMIN_ACCESS: Record<Resource, ResourceAccess> = {
  dashboard: grant('all', 'view'),
  followups: grant('all', ...ACTIONS),
  leads: grant('all', ...ACTIONS),
  pipeline: grant('all', ...ACTIONS),
  deals: grant('all', ...ACTIONS),
  customers: grant('all', ...ACTIONS),
  inbox: grant('all', ...ACTIONS),
  tasks: grant('all', ...ACTIONS),
  campaigns: grant('all', ...ACTIONS),
  automations: grant('all', ...ACTIONS),
  reports: grant('all', ...ACTIONS),
  team: grant('all', ...ACTIONS),
  audit_logs: grant('all', 'view', 'export'),
  settings: grant('all', ...ACTIONS),
}

const MANAGER_ACCESS: Record<Resource, ResourceAccess> = {
  dashboard: grant('all', 'view'),
  followups: grant('all', 'view', 'create', 'edit', 'delete', 'assign'),
  leads: grant('all', ...ACTIONS),
  pipeline: grant('all', 'view', 'create', 'edit', 'assign'),
  deals: grant('all', 'view', 'create', 'edit', 'delete', 'assign', 'export'),
  customers: grant('all', 'view', 'create', 'edit', 'export'),
  inbox: grant('all', 'view', 'create', 'edit', 'assign'),
  tasks: grant('all', 'view', 'create', 'edit', 'delete', 'assign'),
  campaigns: grant('all', 'view', 'create', 'edit', 'export'),
  automations: grant('all', 'view', 'create', 'edit'),
  reports: grant('all', 'view', 'export'),
  // Managers see their own team, and cannot invite or edit members.
  team: grant('team', 'view'),
  audit_logs: NONE,
  // Non-admins only manage their own profile here.
  settings: grant('own', 'view', 'edit'),
}

const TEAM_LEADER_ACCESS: Record<Resource, ResourceAccess> = {
  dashboard: grant('team', 'view'),
  followups: grant('team', 'view', 'create', 'edit', 'assign'),
  leads: grant('team', 'view', 'create', 'edit', 'assign', 'export'),
  pipeline: grant('team', 'view', 'create', 'edit'),
  deals: grant('team', 'view', 'create', 'edit', 'assign'),
  customers: grant('team', 'view', 'create', 'edit'),
  inbox: grant('team', 'view', 'create', 'edit'),
  tasks: grant('team', 'view', 'create', 'edit', 'assign'),
  campaigns: grant('team', 'view'),
  automations: NONE,
  reports: grant('team', 'view'),
  team: grant('team', 'view'),
  audit_logs: NONE,
  settings: grant('own', 'view', 'edit'),
}

const SALESPERSON_ACCESS: Record<Resource, ResourceAccess> = {
  dashboard: grant('own', 'view'),
  followups: grant('own', 'view', 'create', 'edit'),
  leads: grant('own', 'view', 'create', 'edit'),
  pipeline: grant('own', 'view', 'create', 'edit'),
  deals: grant('own', 'view', 'create', 'edit'),
  customers: grant('own', 'view'),
  inbox: grant('own', 'view', 'create', 'edit'),
  tasks: grant('own', 'view', 'create', 'edit'),
  campaigns: NONE,
  automations: NONE,
  reports: grant('own', 'view'),
  team: NONE,
  audit_logs: NONE,
  settings: grant('own', 'view', 'edit'),
}

/**
 * Default role × resource × action matrix. Workspaces will be able to override it later
 * (Team & Permissions editor); `can` and `getDataScope` accept a custom matrix for that.
 * `super_admin` currently equals `admin`; it is reserved for platform-level actions.
 */
export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  super_admin: ADMIN_ACCESS,
  admin: ADMIN_ACCESS,
  manager: MANAGER_ACCESS,
  team_leader: TEAM_LEADER_ACCESS,
  salesperson: SALESPERSON_ACCESS,
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  manager: 'Manager',
  team_leader: 'Team leader',
  salesperson: 'Salesperson',
}
