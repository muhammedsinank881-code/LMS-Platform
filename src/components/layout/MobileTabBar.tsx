import { BookOpen, Ellipsis, GraduationCap, LayoutDashboard, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/cn'
import { getNavItem, MOBILE_TAB_RESOURCES } from './nav-config'
import { STUDENT_NAV_ITEMS } from './student-nav-config'

export interface MobileTabBarProps {
  onOpenMore: () => void
}

export const MENTOR_MOBILE_TAB_ITEMS = [
  { label: 'Home', path: '/mentor/dashboard', icon: LayoutDashboard },
  { label: 'Classes', path: '/mentor/classes', icon: BookOpen },
  { label: 'Students', path: '/mentor/students', icon: Users },
  { label: 'Exams', path: '/mentor/exams', icon: GraduationCap },
]

const tabClasses =
  'flex min-h-12 py-1.5 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] sm:text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'

/** Bottom tab bar for phones: Home, Classes, Students, Schedule, More (opens the full nav drawer). */
export function MobileTabBar({ onOpenMore }: MobileTabBarProps) {
  const { can, role } = usePermission()
  const isStudent = role === 'student'
  const isMentor = role === 'mentor'

  const tabs = isMentor
    ? MENTOR_MOBILE_TAB_ITEMS
    : isStudent
      ? STUDENT_NAV_ITEMS.slice(0, 4)
      : MOBILE_TAB_RESOURCES.map(getNavItem).filter((item) => can(item.resource, 'view'))

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[max(0.25rem,env(safe-area-inset-bottom))] print:hidden lg:hidden"
    >
      {tabs.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              tabClasses,
              isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          <item.icon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span className="truncate px-0.5">
            {'resource' in item && item.resource === 'dashboard' ? 'Home' : item.label}
          </span>
          <item.icon aria-hidden="true" className="h-5 w-5" />
          {/* {'resource' in item && item.resource === 'dashboard' ? 'Home' : item.label} */}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onOpenMore}
        className={cn(tabClasses, 'text-muted-foreground hover:text-foreground')}
      >
        <Ellipsis aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
        <span className="truncate px-0.5">More</span>
        <Ellipsis aria-hidden="true" className="h-5 w-5" />
      </button>
    </nav>
  )
}
