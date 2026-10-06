import { ApiError } from '@/services/api/errors'
import { useAuthStore } from '@/store/auth-store'
import type { SessionUser } from '@/types'

/** Who is calling: the signed-in user and the workspace they are acting in. */
export interface MockSession {
  user: SessionUser
  tenantId: string
}

type SessionResolver = () => MockSession | null

function sessionFromAuthStore(): MockSession | null {
  const { user, tenant, token } = useAuthStore.getState()
  return user && tenant && token ? { user, tenantId: tenant.id } : null
}

let resolver: SessionResolver = sessionFromAuthStore

/** Every mock call goes through here, the way a real API reads the bearer token. */
export function getMockSession(): MockSession {
  const session = resolver()
  if (!session) throw new ApiError('unauthorized', 'Your session has expired. Sign in again.')
  return session
}

/** Tests inject a session; pass null to restore the auth-store default. */
export function setMockSessionResolver(next: SessionResolver | null): void {
  resolver = next ?? sessionFromAuthStore
}
