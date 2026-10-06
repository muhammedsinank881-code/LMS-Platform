import {
  SETTINGS_SECTIONS,
  type Role,
  type SectionGrants,
  type SettingsSection,
} from '@/types'

const ALL_TRUE = Object.fromEntries(SETTINGS_SECTIONS.map((section) => [section, true])) as Record<
  SettingsSection,
  boolean
>

const PROFILE_ONLY = Object.fromEntries(
  SETTINGS_SECTIONS.map((section) => [section, section === 'profile']),
) as Record<SettingsSection, boolean>

/** Seed and reset target. Admins configure the workspace; everyone else gets Profile. */
export function defaultSectionGrants(): SectionGrants {
  return {
    super_admin: { ...ALL_TRUE },
    admin: { ...ALL_TRUE },
    manager: { ...PROFILE_ONLY, lead_capture: true },
    team_leader: { ...PROFILE_ONLY },
    salesperson: { ...PROFILE_ONLY },
    mentor: { ...ALL_TRUE },
    student: { ...ALL_TRUE },
  }
}

export function canAccessSection(
  role: Role | null | undefined,
  section: SettingsSection,
  grants: SectionGrants = defaultSectionGrants(),
): boolean {
  if (!role) return false
  return grants[role][section]
}
