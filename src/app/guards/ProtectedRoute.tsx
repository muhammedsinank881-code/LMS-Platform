import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { buildLoginUrl } from '@/lib/redirect'
import { selectIsAuthenticated, useAuthStore } from '@/store/auth-store'

const ONBOARDING_PATH = '/onboarding'
const DEFAULT_PATH = '/dashboard'

/**
 * Requires a signed-in user. Unauthenticated visitors go to /login and come back afterwards
 * (`?redirect=`). Workspaces that have not finished onboarding are held on /onboarding.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const intentionalSignOut = useAuthStore((state) => state.intentionalSignOut)
  const onboardingCompleted = useAuthStore((state) => state.tenant?.onboardingCompleted ?? false)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    const returnTo = intentionalSignOut ? undefined : `${location.pathname}${location.search}`
    return <Navigate to={buildLoginUrl(returnTo)} replace />
  }

  const defaultPath = user?.role === 'student' ? '/student/dashboard' : DEFAULT_PATH

  const onOnboarding = location.pathname === ONBOARDING_PATH
  if (!onboardingCompleted && !onOnboarding) return <Navigate to={ONBOARDING_PATH} replace />
  if (onboardingCompleted && onOnboarding) return <Navigate to={defaultPath} replace />

  return <Outlet />
}
