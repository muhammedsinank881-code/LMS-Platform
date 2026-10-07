import { createBrowserRouter, Navigate } from 'react-router-dom'
import { getDefaultPathForRole } from '@/lib/redirect'
import { useAuthStore } from '@/store/auth-store'
import { lazyPage } from './lazy-route'
import { RouteErrorBoundary } from './RouteErrorBoundary'
import { RouteFallback } from './RouteFallback'
import { protectedRoutes } from './routes/app-routes'
import { publicRoutes } from './routes/public-routes'

function RoleIndexRedirect() {
  const userRole = useAuthStore((state) => state.user?.role)
  const targetPath = getDefaultPathForRole(userRole)
  return <Navigate to={targetPath} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary fullPage />,
    HydrateFallback: RouteFallback,
    children: [
      { index: true, element: <RoleIndexRedirect /> },
      ...publicRoutes,
      ...protectedRoutes,
      { path: '*', lazy: lazyPage(() => import('./NotFoundPage'), 'NotFoundPage') },
    ],
  },
])
