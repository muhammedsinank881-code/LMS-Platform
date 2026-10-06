import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, BellOff, CheckCheck, MailOpen, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Checkbox, EmptyState, Pagination, Skeleton, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { useDateRangeState } from '@/hooks/use-date-range-state'
import { calendarDayKey } from '@/lib/date-range'
import { formatDayLabel } from '@/lib/format'
import { defaultNotificationPreferences } from '@/lib/notification-prefs'
import { NOTIFICATION_GROUPS, type Notification, type NotificationGroup } from '@/types'
import { NotificationFilters } from '../components/NotificationFilters'
import { NotificationPreferencesPanel } from '../components/NotificationPreferencesPanel'
import { NotificationRow } from '../components/NotificationRow'
import { useDeleteNotifications, useNotificationPreferences, useUpdateNotificationPreferences } from '../hooks/use-notification-actions'
import { useMarkAllNotificationsRead, useMarkNotificationsRead, useMarkNotificationsUnread, useNotifications } from '../hooks/use-notifications'
import { useUnreadNotificationCount } from '../hooks/use-unread-count'

const GROUPS = Object.keys(NOTIFICATION_GROUPS) as NotificationGroup[]
const PAGE_SIZE = 20

function byDay(items: Notification[]): Array<{ key: string; label: string; items: Notification[] }> {
  const days = new Map<string, Notification[]>()
  for (const item of items) {
    const key = calendarDayKey(item.createdAt) ?? 'unknown'
    days.set(key, [...(days.get(key) ?? []), item])
  }
  return [...days].map(([key, rows]) => ({ key, label: formatDayLabel(rows[0].createdAt), items: rows }))
}

export function NotificationsPage() {
  const range = useDateRangeState()
  const [params, setParams] = useSearchParams()
  const [panel, setPanel] = useState<'list' | 'preferences'>('list')
  const [selected, setSelected] = useState<string[]>([])
  const unreadOnly = params.get('read') === 'unread'
  const rawGroup = params.get('group') as NotificationGroup
  const group = GROUPS.includes(rawGroup) ? rawGroup : null
  const search = params.get('q') ?? ''
  const page = Number(params.get('page')) || 1
  const unread = useUnreadNotificationCount().data ?? 0
  const list = useNotifications({
    page,
    pageSize: PAGE_SIZE,
    search,
    filters: [
      ...(unreadOnly ? [{ field: 'readAt' as const, operator: 'is_empty' as const }] : []),
      ...(group ? [{ field: 'type' as const, operator: 'in' as const, value: [...NOTIFICATION_GROUPS[group]] }] : []),
      { field: 'createdAt', operator: 'between', value: [range.range.from, range.range.to] },
    ],
  })
  const markRead = useMarkNotificationsRead()
  const markUnread = useMarkNotificationsUnread()
  const markAll = useMarkAllNotificationsRead()
  const remove = useDeleteNotifications()
  const preferences = useNotificationPreferences()
  const savePreferences = useUpdateNotificationPreferences()
  const items = list.data?.items ?? []
  const sections = useMemo(() => byDay(items), [items])
  const filtered = unreadOnly || group !== null || search !== ''
  const allSelected = items.length > 0 && selected.length === items.length

  const patch = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (!value) next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
    setSelected([])
  }

  return (
    <div className="mx-auto min-w-0 max-w-4xl">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : 'You are all caught up'}
        actions={
          <>
            <Tabs variant="pill" value={panel} onValueChange={(value) => setPanel(value as typeof panel)}>
              <TabsList aria-label="Notifications view">
                <TabsTrigger value="list">Inbox</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
            </Tabs>
            {panel === 'list' ? (
              <Button type="button" variant="outline" disabled={unread === 0} loading={markAll.isPending} onClick={() => markAll.mutate()}>
                <CheckCheck /> Mark all read
              </Button>
            ) : null}
          </>
        }
      />
      {panel === 'preferences' ? (
        preferences.data ? (
          <NotificationPreferencesPanel value={preferences.data} onChange={(next) => savePreferences.mutate(next)} />
        ) : preferences.isError ? (
          <EmptyState tone="destructive" icon={AlertTriangle} title="Could not load preferences" action={<Button onClick={() => void preferences.refetch()}>Retry</Button>} />
        ) : (
          <NotificationPreferencesPanel value={defaultNotificationPreferences()} onChange={() => undefined} />
        )
      ) : (
        <div className="space-y-4">
          <NotificationFilters search={search} unreadOnly={unreadOnly} group={group} range={range} unreadCount={unread} onChange={patch} />
          {selected.length > 0 ? (
            <div role="toolbar" aria-label="Bulk actions" className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
              <span className="text-sm font-medium">{selected.length} selected</span>
              <div className="flex-1" />
              <Button type="button" size="sm" variant="outline" onClick={() => markRead.mutate(selected, { onSuccess: () => setSelected([]) })}>
                <MailOpen /> Mark read
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => remove.mutate(selected, { onSuccess: () => setSelected([]) })}>
                <Trash2 /> Delete
              </Button>
            </div>
          ) : null}
          {list.isLoading ? (
            <div className="space-y-px overflow-hidden rounded-lg border border-border" aria-busy="true" aria-label="Loading notifications">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex gap-3 p-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3.5 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {list.isError ? (
            <EmptyState tone="destructive" icon={AlertTriangle} title="Could not load notifications" description="Check your connection and try again." action={<Button onClick={() => void list.refetch()}>Retry</Button>} />
          ) : null}
          {!list.isLoading && !list.isError && items.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title={filtered ? 'No matching notifications' : 'No notifications yet'}
              description={filtered ? 'Try another filter, a wider date range, or clear the search.' : 'New leads, follow-ups and messages will appear here.'}
            />
          ) : null}
          {items.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3 py-2 sm:px-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => setSelected(checked === true ? items.map((item) => item.id) : [])}
                  aria-label="Select all notifications on this page"
                />
                <span className="text-xs text-muted-foreground">{list.data?.total ?? 0} notifications</span>
              </div>
              {sections.map((section) => (
                <section key={section.key} aria-label={section.label}>
                  <h2 className="border-b border-border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.label}
                  </h2>
                  <ul className="divide-y divide-border">
                    {section.items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        selected={selected.includes(item.id)}
                        onSelect={(checked) => setSelected((current) => (checked ? [...current, item.id] : current.filter((id) => id !== item.id)))}
                        onOpen={() => {
                          if (!item.readAt) markRead.mutate([item.id])
                        }}
                        onToggleRead={() => (item.readAt ? markUnread.mutate([item.id]) : markRead.mutate([item.id]))}
                        onDelete={() => remove.mutate([item.id])}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : null}
          <Pagination page={page} pageSize={PAGE_SIZE} total={list.data?.total ?? 0} onPageChange={(next) => patch('page', next === 1 ? null : String(next))} />
        </div>
      )}
    </div>
  )
}
