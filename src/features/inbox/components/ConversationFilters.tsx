import { SlidersHorizontal } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import {
  Button,
  DatePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { cn } from '@/lib/cn'
import type { UserId } from '@/types'
import { DEFAULT_INBOX_FILTERS, type InboxFilters } from '../lib/inbox-filters'

/** Filters beyond the channel tab and search that differ from the defaults. */
function activeCount(value: InboxFilters): number {
  return [
    value.unreadOnly,
    value.assignedToMe,
    value.unassigned,
    value.status !== DEFAULT_INBOX_FILTERS.status,
    Boolean(value.from || value.to),
  ].filter(Boolean).length
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-8 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:h-9',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-surface text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function ConversationFilters({
  value,
  userId,
  onChange,
}: {
  value: InboxFilters
  userId: UserId
  onChange: (next: InboxFilters) => void
}) {
  void userId
  const count = activeCount(value)
  return (
    <div className="space-y-3 border-b border-border p-3">
      <Tabs
        variant="pill"
        value={value.channel}
        onValueChange={(channel) => onChange({ ...value, channel: channel as InboxFilters['channel'] })}
      >
        <TabsList aria-label="Channel" className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="call">Calls</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchInput
            defaultValue={value.search}
            onValueChange={(search) => onChange({ ...value, search })}
            placeholder="Search conversations"
            aria-label="Search conversations"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label={count ? `Filters, ${count} active` : 'Filters'} className="relative">
              <SlidersHorizontal />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-3 p-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Select
                aria-label="Status"
                value={value.status}
                onValueChange={(status) => onChange({ ...value, status: status as InboxFilters['status'] })}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'all', label: 'Any status' },
                ]}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Last message</p>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker aria-label="From" value={value.from} onValueChange={(from) => onChange({ ...value, from })} />
                <DatePicker aria-label="To" value={value.to} onValueChange={(to) => onChange({ ...value, to })} />
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" className="w-full" disabled={count === 0} onClick={() => onChange({ ...DEFAULT_INBOX_FILTERS, channel: value.channel, search: value.search })}>
              Reset filters
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick filters">
        <Chip active={value.unreadOnly} onClick={() => onChange({ ...value, unreadOnly: !value.unreadOnly })}>
          Unread
        </Chip>
        <Chip
          active={value.assignedToMe}
          onClick={() => onChange({ ...value, assignedToMe: !value.assignedToMe, unassigned: false })}
        >
          Assigned to me
        </Chip>
        <Chip
          active={value.unassigned}
          onClick={() => onChange({ ...value, unassigned: !value.unassigned, assignedToMe: false })}
        >
          Unassigned
        </Chip>
      </div>
    </div>
  )
}
