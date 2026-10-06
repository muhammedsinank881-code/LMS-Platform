import { Ellipsis } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/cn'
import { getNavItem, MOBILE_TAB_RESOURCES } from './nav-config'

export interface MobileTabBarProps {
  onOpenMore: () => void
}

const tabClasses =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'

/** Bottom tab bar for phones: Home, Follow-ups, Leads, Inbox, More (opens the full nav drawer). */
export function MobileTabBar({ onOpenMore }: MobileTabBarProps) {
  const { can } = usePermission()
  const tabs = MOBILE_TAB_RESOURCES.map(getNavItem).filter((item) => can(item.resource, 'view'))

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] print:hidden lg:hidden"
    >
      {tabs.map((item) => (
        <NavLink
          key={item.resource}
          to={item.path}
          className={({ isActive }) =>
            cn(
              tabClasses,
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          <item.icon aria-hidden="true" className="h-5 w-5" />
          {item.resource === 'dashboard' ? 'Home' : item.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onOpenMore}
        className={cn(tabClasses, 'text-muted-foreground hover:text-foreground')}
      >
        <Ellipsis aria-hidden="true" className="h-5 w-5" />
        More
      </button>
    </nav>
  )
}
