import { SearchInput } from '@/components/common/SearchInput'
import { DateRangePicker, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { NOTIFICATION_GROUPS, type NotificationGroup } from '@/types'
import { NOTIFICATION_GROUP_LABEL } from '../lib/notification-meta'

const GROUPS = Object.keys(NOTIFICATION_GROUPS) as NotificationGroup[]

function GroupChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:h-10',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function NotificationFilters({
  search,
  unreadOnly,
  group,
  range,
  unreadCount,
  onChange,
}: {
  search: string
  unreadOnly: boolean
  group: NotificationGroup | null
  range: DateRangeState
  unreadCount: number
  onChange: (key: 'q' | 'read' | 'group', value: string | null) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs variant="pill" value={unreadOnly ? 'unread' : 'all'} onValueChange={(value) => onChange('read', value === 'unread' ? 'unread' : null)}>
          <TabsList aria-label="Read state">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-full min-w-0 sm:w-64">
          <SearchInput defaultValue={search} onValueChange={(value) => onChange('q', value || null)} placeholder="Search notifications" aria-label="Search notifications" />
        </div>
        <DateRangePicker
          preset={range.preset}
          fromDay={range.fromDay}
          toDay={range.toDay}
          compare={range.compare}
          onPreset={range.setPreset}
          onCustom={range.setCustom}
          onCompare={range.setCompare}
        />
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Type">
        <GroupChip active={group === null} onClick={() => onChange('group', null)}>
          All types
        </GroupChip>
        {GROUPS.map((item) => (
          <GroupChip key={item} active={group === item} onClick={() => onChange('group', item)}>
            {NOTIFICATION_GROUP_LABEL[item]}
          </GroupChip>
        ))}
      </div>
    </div>
  )
}
