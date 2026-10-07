import { LogOut } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/auth-store'
import { MentorProfileHeader } from './MentorProfileHeader'
import { MENTOR_SIDEBAR_ITEMS, type MentorNavItem } from './mentor-sidebar-items'

export interface MentorSidebarProps {
  collapsed?: boolean
  onNavigate?: () => void
  className?: string
}

export function MentorSidebar({
  collapsed = false,
  onNavigate,
  className,
}: MentorSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const signOut = useAuthStore((state) => state.signOut)

  const handleLogout = () => {
    signOut({ intentional: true })
    navigate('/login')
    if (onNavigate) onNavigate()
  }

  const isItemActive = (item: MentorNavItem) => {
    const pathname = location.pathname
    if (pathname === item.path) return true
    if (item.aliases?.includes(pathname)) return true
    // Special check for home root
    if (item.id === 'home' && (pathname === '/mentor' || pathname === '/mentor/')) return true
    return false
  }

  return (
    <div className={cn('flex h-full flex-col bg-surface border-r border-border text-foreground', className)}>
      {/* Mentor Profile Header */}
      <MentorProfileHeader collapsed={collapsed} />

      {/* Navigation Links */}
      <nav aria-label="Mentor Navigation" className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {MENTOR_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item)

          const linkContent = (
            <NavLink
              to={item.path}
              onClick={onNavigate}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all cursor-pointer select-none',
                active
                  ? 'bg-primary-subtle text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium',
                collapsed && 'justify-center px-0',
              )}
            >
              <span className="relative flex items-center justify-center">
                <Icon className={cn('size-4.5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                {item.hasDot ? (
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive" />
                ) : null}
              </span>

              {collapsed ? null : (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {!collapsed && item.badge ? (
                <span className="ml-auto px-2 py-0.5 text-[11px] font-bold rounded-full bg-destructive/10 text-destructive">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          )

          return (
            <div key={item.id}>
              {collapsed ? (
                <Tooltip content={item.label} side="right">
                  {linkContent}
                </Tooltip>
              ) : (
                linkContent
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Logout Divider & Action */}
      <div className={cn('shrink-0 border-t border-border p-3', collapsed && 'flex justify-center')}>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors w-full cursor-pointer',
            collapsed && 'justify-center px-0 w-10 h-10',
          )}
          aria-label="Logout"
        >
          <LogOut className="size-4.5 shrink-0 text-destructive" />
          {collapsed ? null : <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
