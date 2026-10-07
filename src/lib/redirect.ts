export const DEFAULT_AUTHENTICATED_PATH = '/dashboard'
export const LOGIN_PATH = '/login'
export const REDIRECT_PARAM = 'redirect'

export function getDefaultPathForRole(role?: string | null): string {
  if (role === 'mentor') return '/mentor/dashboard'
  if (role === 'student') return '/student/dashboard'
  return DEFAULT_AUTHENTICATED_PATH
}

/**
 * Only same-origin, in-app paths are allowed as a post-login target, which blocks open
 * redirects such as `//evil.com` or `https://evil.com`. Auth screens are never a target.
 */
export function getSafeRedirect(
  raw: string | null | undefined,
  fallback: string = DEFAULT_AUTHENTICATED_PATH,
  role?: string | null,
): string {
  const defaultPath = getDefaultPathForRole(role)
  const safeFallback = fallback === DEFAULT_AUTHENTICATED_PATH ? defaultPath : fallback

  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return safeFallback
  const pathname = raw.split(/[?#]/)[0]
  const authPaths = ['/login', '/register', '/forgot-password', '/accept-invite']
  return authPaths.includes(pathname) ? safeFallback : raw
}

export function buildLoginUrl(returnTo?: string): string {
  if (!returnTo || returnTo === '/' || returnTo === DEFAULT_AUTHENTICATED_PATH) return LOGIN_PATH
  return `${LOGIN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(returnTo)}`
}
