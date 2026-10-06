import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button, Tooltip } from '@/components/ui'
import { useFollowUpSummary } from '@/features/followups/hooks/use-followup-summary'
import { useInboxUnreadCount } from '@/features/inbox/hooks/use-conversations'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/cn'
import { BrandMark } from './BrandMark'
import { NAV_ITEMS } from './nav-config'
import { SidebarNavItem } from './SidebarNavItem'
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
  const { can } = usePermission()
  const summary = useFollowUpSummary()
  const inboxUnread = useInboxUnreadCount()
  const visibleItems = NAV_ITEMS.filter((item) => can(item.resource, 'view'))
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
          {visibleItems.map((item) => (
            <li key={item.resource}>
              <SidebarNavItem
                item={item}
                collapsed={collapsed}
                badge={
                  item.resource === 'followups'
                    ? summary.dueNow
                    : item.resource === 'inbox'
                      ? inboxUnread
                      : 0
                }
                onNavigate={onNavigate}
              />
            </li>
          ))}
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
