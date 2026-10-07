import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button, Tooltip } from '@/components/ui'
import { useFollowUpSummary } from '@/features/followups/hooks/use-followup-summary'
import { useInboxUnreadCount } from '@/features/inbox/hooks/use-conversations'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/cn'
import { BrandMark } from './BrandMark'
import { MENTOR_NAV_ITEMS, NAV_ITEMS } from './nav-config'
import { SidebarNavItem } from './SidebarNavItem'
import { STUDENT_NAV_ITEMS } from './student-nav-config'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export interface SidebarProps {
  collapsed: boolean
  /** Omit to hide the collapse button (the mobile drawer is never collapsed). */
  onToggleCollapsed?: () => void
  /** Called after a nav link is followed, e.g. to close the mobile drawer. */
  onNavigate?: () => void
  className?: string
}

export function Sidebar({ collapsed, onToggleCollapsed, onNavigate, className }: SidebarProps) {
  const { can, role } = usePermission()
  const summary = useFollowUpSummary()
  const inboxUnread = useInboxUnreadCount()

  const visibleItems =
    role === 'mentor'
      ? MENTOR_NAV_ITEMS
      : role === 'student'
        ? STUDENT_NAV_ITEMS
        : NAV_ITEMS.filter((item) => can(item.resource, 'view'))

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <div className={cn('flex h-full flex-col bg-surface', className)}>
      <div
        className={cn('flex h-16 shrink-0 items-center px-4', collapsed && 'justify-center px-2')}
      >
        <BrandMark iconOnly={collapsed} />
      </div>
      <div className={cn('shrink-0 px-3 pb-3', collapsed && 'px-2')}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {visibleItems.map((item, idx) => {
            const showSectionHeader =
              !collapsed &&
              item.section &&
              (idx === 0 || visibleItems[idx - 1]?.section !== item.section)

            return (
              <li key={`${item.path}-${idx}`}>
                {showSectionHeader ? (
                  <div className="mt-4 mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    {item.section}
                  </div>
                ) : null}

                <SidebarNavItem
                  item={item}
                  collapsed={collapsed}
                  badge={
                    'resource' in item && item.resource === 'followups'
                      ? summary.dueNow
                      : 'resource' in item && item.resource === 'inbox'
                        ? inboxUnread
                        : 0
                  }
                  onNavigate={onNavigate}
                />
              </li>
            )
          })}
        </ul>
      </nav>
      {onToggleCollapsed ? (
        <div
          className={cn('shrink-0 border-t border-border p-3', collapsed && 'flex justify-center')}
        >
          <Tooltip content={toggleLabel} side="right">
            <Button
              variant="ghost"
              size={collapsed ? 'icon' : 'md'}
              onClick={onToggleCollapsed}
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              className={cn(!collapsed && 'w-full justify-start text-muted-foreground')}
            >
              <ToggleIcon aria-hidden="true" />
              {collapsed ? null : 'Collapse'}
            </Button>
          </Tooltip>
        </div>
      ) : null}
    </div>
  )
}
