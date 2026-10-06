import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DETAIL_ROUTE = /^\/(leads|deals|customers|inbox)\/[^/]+$/

/** Bottom tabs stay on main sections and hide on detail pages and settings forms. */
export function useHideMobileTabs(): boolean {
  const { pathname } = useLocation()
  return pathname.startsWith('/settings') || DETAIL_ROUTE.test(pathname)
}

/** Keep the focused field above the keyboard and the bottom chrome. */
export function useKeepFieldVisible(): void {
  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (!target.matches('input, textarea, select')) return
      window.setTimeout(() => {
        target.scrollIntoView({ block: 'center', inline: 'nearest' })
      }, 300)
    }
    document.addEventListener('focusin', onFocus)
    return () => document.removeEventListener('focusin', onFocus)
  }, [])
}
