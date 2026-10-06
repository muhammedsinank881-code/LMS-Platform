import { canAccessSection, defaultSectionGrants } from '@/lib/permissions'
import { ApiError } from '@/services/api/errors'
import type { SettingsSection } from '@/types'
import type { RequestContext } from './context'

/** Throws FORBIDDEN unless the acting role may open this settings section. Reads and writes both need it. */
export function requireSection(ctx: RequestContext, section: SettingsSection): void {
  const grants = ctx.db.find('tenantSettings', ctx.tenantId)?.sectionGrants ?? defaultSectionGrants()
  if (!canAccessSection(ctx.actor.role, section, grants)) {
    throw new ApiError('FORBIDDEN', 'Your role cannot manage this part of settings.')
  }
}
