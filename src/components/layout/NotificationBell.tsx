import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Dropdown, DropdownContent, DropdownItem, DropdownTrigger, Tooltip } from '@/components/ui'
import { useMarkAllNotificationsRead, useMarkNotificationsRead, useNotifications } from '@/features/notifications/hooks/use-notifications'
import { useUnreadNotificationCount } from '@/features/notifications'
import { calendarDayKey } from '@/lib/date-range'
import { formatRelative } from '@/lib/format'
import type { Notification } from '@/types'

function group(items: Notification[]) {
  const today = calendarDayKey(new Date().toISOString())
  const current: Notification[] = []
  const earlier: Notification[] = []
  for (const item of items) {
    if (calendarDayKey(item.createdAt) === today) current.push(item)
    else earlier.push(item)
  }
  return [
    { label: 'Today', items: current },
    { label: 'Earlier', items: earlier },
  ].filter((section) => section.items.length > 0)
}

export function NotificationBell() {
  const { data: unread = 0 } = useUnreadNotificationCount()
  const list = useNotifications({ pageSize: 8 })
  const markRead = useMarkNotificationsRead()
  const markAll = useMarkAllNotificationsRead()
  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
  const sections = group(list.data?.items ?? [])

  return (
    <Dropdown>
      <Tooltip content="Notifications">
        <DropdownTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={label} className="relative">
            <Bell aria-hidden="true" />
            {unread > 0 ? (
              <span aria-hidden="true" className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </Button>
        </DropdownTrigger>
      </Tooltip>
      <DropdownContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-medium">Notifications</p>
          {unread > 0 ? (
            <button type="button" className="text-xs text-primary hover:underline" onClick={() => markAll.mutate()}>
              Mark all read
            </button>
          ) : null}
        </div>
        {sections.length === 0 ? <p className="px-2 py-3 text-sm text-muted-foreground">You&apos;re all caught up.</p> : null}
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{section.label}</p>
            {section.items.map((item) => (
              <DropdownItem key={item.id} asChild>
                <Link
                  to={item.link}
                  className="flex flex-col items-start gap-0.5"
                  onClick={() => {
                    if (!item.readAt) markRead.mutate([item.id])
                  }}
                >
                  <span className={item.readAt ? 'font-medium' : 'font-semibold'}>{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.body}</span>
                  <span className="text-xs text-muted-foreground">{formatRelative(item.createdAt)}</span>
                </Link>
              </DropdownItem>
            ))}
          </div>
        ))}
        <DropdownItem asChild>
          <Link to="/notifications" className="justify-center text-sm text-primary">
            View all
          </Link>
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}
