import type { RouteObject } from 'react-router-dom'
import { PublicOnlyRoute } from '../guards/PublicOnlyRoute'
import { lazyPage } from '../lazy-route'

/** Auth screens. Signed-in users are redirected away from all but /accept-invite. */
export const publicRoutes: RouteObject[] = [
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: 'login',
        lazy: lazyPage(() => import('@/features/auth/pages/LoginPage'), 'LoginPage'),
      },
      {
        path: 'register',
        lazy: lazyPage(() => import('@/features/auth/pages/RegisterPage'), 'RegisterPage'),
      },
      {
        path: 'forgot-password',
        lazy: lazyPage(
          () => import('@/features/auth/pages/ForgotPasswordPage'),
          'ForgotPasswordPage',
        ),
      },
    ],
  },
  {
    // Not PublicOnly: a signed-in user may open an invite link and switch accounts.
    path: 'accept-invite',
    lazy: lazyPage(() => import('@/features/auth/pages/AcceptInvitePage'), 'AcceptInvitePage'),
  },
  {
    // A hosted lead form: standalone, no sign-in and no app shell.
    path: 'f/:formId',
    lazy: lazyPage(() => import('@/features/lead-capture/pages/PublicFormPage'), 'PublicFormPage'),
  },
  {
    path: 'design-system',
    lazy: lazyPage(() => import('../design-system/DesignSystemPage'), 'DesignSystemPage'),
  },
]
