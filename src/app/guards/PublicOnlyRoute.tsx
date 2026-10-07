import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { getSafeRedirect, REDIRECT_PARAM } from '@/lib/redirect'
import { selectIsAuthenticated, useAuthStore } from '@/store/auth-store'

/** Keeps signed-in users off /login, /register, etc. and performs the redirect-after-login. */
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [searchParams] = useSearchParams()

  if (isAuthenticated) {
    const defaultTarget = user?.role === 'student' ? '/student/dashboard' : undefined
    return <Navigate to={getSafeRedirect(searchParams.get(REDIRECT_PARAM), defaultTarget)} replace />
  }
  return <Outlet />
}
