import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { buildLoginUrl, getDefaultPathForRole } from '@/lib/redirect'
import { selectIsAuthenticated, useAuthStore } from '@/store/auth-store'

const ONBOARDING_PATH = '/onboarding'

/**
 * Requires a signed-in user. Unauthenticated visitors go to /login and come back afterwards
 * (`?redirect=`). Workspaces that have not finished onboarding are held on /onboarding.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const userRole = useAuthStore((state) => state.user?.role)
  const intentionalSignOut = useAuthStore((state) => state.intentionalSignOut)
  const onboardingCompleted = useAuthStore((state) => state.tenant?.onboardingCompleted ?? false)

  if (!isAuthenticated) {
    const returnTo = intentionalSignOut ? undefined : `${location.pathname}${location.search}`
    return <Navigate to={buildLoginUrl(returnTo)} replace />
  }

  const defaultRolePath = getDefaultPathForRole(userRole)
  const onOnboarding = location.pathname === ONBOARDING_PATH
  if (!onboardingCompleted && !onOnboarding) return <Navigate to={ONBOARDING_PATH} replace />
  if (onboardingCompleted && onOnboarding) return <Navigate to={defaultRolePath} replace />

  return <Outlet />
}
