export const ROLES = ['super_admin', 'admin', 'manager', 'team_leader', 'salesperson'] as const
export type Role = (typeof ROLES)[number]

/** One entry per top-level module. Matches the sidebar navigation. */
export const RESOURCES = [
  'dashboard',
  'followups',
  'leads',
  'pipeline',
  'deals',
  'customers',
  'inbox',
  'tasks',
  'campaigns',
  'automations',
  'reports',
  'team',
  'audit_logs',
  'settings',
] as const
export type Resource = (typeof RESOURCES)[number]

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'assign', 'export', 'import'] as const
export type Action = (typeof ACTIONS)[number]

/** How much of a resource's data a role may see: own records, its team's, or everything. */
export const DATA_SCOPES = ['own', 'team', 'all'] as const
export type DataScope = (typeof DATA_SCOPES)[number]

export interface ResourceAccess {
  actions: readonly Action[]
  scope: DataScope
}

export type PermissionMatrix = Record<Role, Record<Resource, ResourceAccess>>

/** Anything with a role can be checked: the full `User`, or `{ role }` in tests. */
export interface PermissionSubject {
  role: Role
}

/** Settings sub-pages. Grants sit beside the matrix so they are not sidebar resources. */
export const SETTINGS_SECTIONS = [
  'profile',
  'workspace',
  'statuses',
  'pipelines',
  'sources',
  'tags',
  'custom_fields',
  'qualification',
  'assignment',
  'lost_reasons',
  'billing',
  'scoring',
  'templates',
  'integrations',
  'api_keys',
  'lead_capture',
] as const
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]

export type SectionGrants = Record<Role, Record<SettingsSection, boolean>>

/**
 * Capabilities that are not a resource x action pair. They default by role and sit beside the
 * matrix, like the settings section grants.
 */
export const FEATURE_PERMISSIONS = ['view-spend', 'manage-targets', 'send-broadcasts'] as const
export type FeaturePermission = (typeof FEATURE_PERMISSIONS)[number]
