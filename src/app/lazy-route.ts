import type { ComponentType } from 'react'
import type { LazyRouteFunction, RouteObject } from 'react-router-dom'

/**
 * Lazy route from a module with a named page export:
 * `lazy: lazyPage(() => import('@/features/leads/pages/LeadsPage'), 'LeadsPage')`.
 * Each call site keeps a static `import()` so Vite code-splits every page.
 */
export function lazyPage<Name extends string>(
  load: () => Promise<Record<Name, ComponentType>>,
  name: Name,
): LazyRouteFunction<RouteObject> {
  return async () => {
    const module = await load()
    return { Component: module[name] }
  }
}
