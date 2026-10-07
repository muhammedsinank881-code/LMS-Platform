import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/auth-store'
import { MentorProfileHeader } from './MentorProfileHeader'

export interface MentorNavItem {
  id: string
  label: string
  path: string
  aliases?: string[]
  icon: LucideIcon
  badge?: number
  hasDot?: boolean
}

export const MENTOR_SIDEBAR_ITEMS: MentorNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/mentor/home',
    aliases: ['/mentor', '/mentor/dashboard'],
    icon: Home,
  },
  {
    id: 'my-classes',
    label: 'My Classes',
    path: '/mentor/classes',
    aliases: ['/mentor/my-classes', '/mentor/batch-overview'],
    icon: BookOpen,
  },
  {
    id: 'students',
    label: 'Students',
    path: '/mentor/students',
    aliases: ['/mentor/my-students'],
    icon: Users,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/mentor/attendance',
    aliases: ['/mentor/attendance-tracking'],
    icon: UserCheck,
  },
  {
    id: 'assignments',
    label: 'Assignments',
    path: '/mentor/assignments',
    icon: FileText,
  },
  {
    id: 'exams',
    label: 'Exams',
    path: '/mentor/exams',
    icon: Award,
  },
  {
    id: 'results',
    label: 'Results',
    path: '/mentor/results',
    aliases: ['/mentor/performance-reports'],
    icon: BarChart3,
  },
  {
    id: 'timetable',
    label: 'Timetable',
    path: '/mentor/timetable',
    icon: Calendar,
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/mentor/messages',
    icon: MessageSquare,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/mentor/notifications',
    icon: Bell,
    hasDot: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/mentor/profile',
    icon: User,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/mentor/settings',
    aliases: ['/settings'],
    icon: Settings,
  },
]

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
