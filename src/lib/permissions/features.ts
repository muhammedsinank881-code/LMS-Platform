import type { FeaturePermission, Role } from '@/types'

const ADMIN_ONLY: readonly Role[] = ['super_admin', 'admin', 'manager']

/** Who holds each feature permission by default. */
export const FEATURE_GRANTS: Record<FeaturePermission, readonly Role[]> = {
  'view-spend': ADMIN_ONLY,
  'manage-targets': ADMIN_ONLY,
  'send-broadcasts': ADMIN_ONLY,
}

export function hasFeature(
  subject: { role: Role } | null | undefined,
  feature: FeaturePermission,
): boolean {
  return subject ? FEATURE_GRANTS[feature].includes(subject.role) : false
}
