import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { isSameMonth } from 'date-fns'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { cn } from '@/lib/cn'
import { dayKey } from '@/lib/calendar-grid'
import type { FollowUp } from '@/types'
import { CalendarChip } from './CalendarChip'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function DayCell({
  day,
  cellId,
  inMonth,
  items,
  leadName,
  focused,
  tabIndex,
  onFocus,
  onCreate,
  onOpen,
  now,
}: {
  day: Date
  cellId: string
  inMonth: boolean
  items: FollowUp[]
  leadName: (id: string) => string
  focused: boolean
  tabIndex: number
  onFocus: () => void
  onCreate: (day: Date) => void
  onOpen: (followUp: FollowUp) => void
  now: Date
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day:${dayKey(day)}` })
  const shown = items.slice(0, 3)
  const hidden = items.slice(3)
  return (
    <div
      id={cellId}
      ref={setNodeRef}
      role="gridcell"
      tabIndex={tabIndex}
      onFocus={onFocus}
      className={cn(
        'flex min-h-28 flex-col gap-1 border-b border-r border-border p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !inMonth && 'bg-muted/40 text-muted-foreground',
        isOver && 'bg-primary/5',
        focused && 'ring-2 ring-ring',
      )}
    >
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center self-start rounded-md text-sm font-medium hover:bg-muted"
        onClick={() => onCreate(day)}
      >
        {day.getDate()}
      </button>
      {shown.map((item) => (
        <CalendarChip
          key={item.id}
          followUp={item}
          leadName={leadName(item.leadId)}
          overdue={new Date(item.dueAt) < now}
          onOpen={onOpen}
        />
      ))}
      {hidden.length > 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="min-h-11 justify-start px-2">
              +{hidden.length} more
            </Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-1">
            {hidden.map((item) => (
              <CalendarChip
                key={item.id}
                followUp={item}
                leadName={leadName(item.leadId)}
                overdue={new Date(item.dueAt) < now}
                onOpen={onOpen}
              />
            ))}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}

export function MonthGrid({
  days,
  month,
  itemsByDay,
  leadName,
  now,
  onCreate,
  onOpen,
}: {
  days: Date[]
  month: Date
  itemsByDay: Map<string, FollowUp[]>
  leadName: (id: string) => string
  now: Date
  onCreate: (day: Date) => void
  onOpen: (followUp: FollowUp) => void
}) {
  const [focus, setFocus] = useState(0)
  const move = (index: number, delta: number) => {
    const next = index + delta
    if (next < 0 || next >= days.length) return
    setFocus(next)
    document.getElementById(`cal-day-${dayKey(days[next])}`)?.focus()
  }

  return (
    <div
      role="grid"
      tabIndex={0}
      aria-label="Month"
      onKeyDown={(event) => {
        const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]
        if (delta === undefined) return
        event.preventDefault()
        move(focus, delta)
      }}
    >
      <div role="row" className="grid grid-cols-7">
        {WEEKDAYS.map((label) => (
          <div key={label} role="columnheader" className="px-1 py-2 text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-border">
        {days.map((day, index) => (
          <div key={dayKey(day)} role="presentation">
            <DayCell
              day={day}
              cellId={`cal-day-${dayKey(day)}`}
              inMonth={isSameMonth(day, month)}
              items={itemsByDay.get(dayKey(day)) ?? []}
              leadName={leadName}
              focused={focus === index}
              tabIndex={focus === index ? 0 : -1}
              onFocus={() => setFocus(index)}
              onCreate={onCreate}
              onOpen={onOpen}
              now={now}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
