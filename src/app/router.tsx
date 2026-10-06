import { createBrowserRouter, Navigate } from 'react-router-dom'
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
      { index: true, element: <Navigate to="/dashboard" replace /> },
      ...publicRoutes,
      ...protectedRoutes,
      { path: '*', lazy: lazyPage(() => import('./NotFoundPage'), 'NotFoundPage') },
    ],
  },
])
