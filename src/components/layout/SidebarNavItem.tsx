import { NavLink } from 'react-router-dom'
import { Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { NavItem } from './nav-config'

export interface SidebarNavItemProps {
  item: NavItem
  collapsed: boolean
  badge?: number
  onNavigate?: () => void
}

export function SidebarNavItem({ item, collapsed, badge = 0, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon
  const link = (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors max-lg:h-11',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          isActive
            ? 'bg-primary-subtle text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-0',
        )
      }
    >
      <span className="relative">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
        {collapsed && badge > 0 ? (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
        ) : null}
      </span>
      {collapsed ? null : <span className="truncate">{item.label}</span>}
      {!collapsed && badge > 0 ? (
        <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] font-semibold leading-4 text-destructive-foreground">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </NavLink>
  )

  return collapsed ? (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  )
}
