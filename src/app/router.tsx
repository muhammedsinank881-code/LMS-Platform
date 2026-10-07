import { createBrowserRouter } from 'react-router-dom'
import { RoleIndexRedirect } from './RoleIndexRedirect'
import { lazyPage } from './lazy-route'
import { RouteErrorBoundary } from './RouteErrorBoundary'
import { RouteFallback } from './RouteFallback'
import { protectedRoutes } from './routes/app-routes'
import { publicRoutes } from './routes/public-routes'

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
