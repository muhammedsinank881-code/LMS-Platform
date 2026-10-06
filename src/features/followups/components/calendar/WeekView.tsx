import { useDroppable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { cn } from '@/lib/cn'
import {
  DAY_START_HOUR,
  SLOT_COUNT,
  SLOT_MINUTES,
  dayKey,
  dueAtFromSlotDrop,
  slotIndex,
} from '@/lib/calendar-grid'
import type { FollowUp } from '@/types'
import { CalendarChip } from './CalendarChip'

const SLOT_PX = 28

function SlotRow({
  day,
  index,
  onCreate,
}: {
  day: Date
  index: number
  onCreate: (dueAt: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${dayKey(day)}:${index}` })
  return (
    <button
      type="button"
      ref={setNodeRef}
      aria-label={`${format(day, 'EEE d')} ${format(dueAtFromSlotDrop(day, index), 'h:mm a')}`}
      className={cn('w-full border-b border-border/70', isOver && 'bg-primary/10')}
      style={{ height: SLOT_PX }}
      onClick={() => onCreate(dueAtFromSlotDrop(day, index).toISOString())}
    />
  )
}

export function WeekView({
  days,
  itemsByDay,
  leadName,
  now,
  onCreate,
  onOpen,
}: {
  days: Date[]
  itemsByDay: Map<string, FollowUp[]>
  leadName: (id: string) => string
  now: Date
  onCreate: (dueAt: string) => void
  onOpen: (followUp: FollowUp) => void
}) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
        <div />
        {days.map((day) => (
          <div key={dayKey(day)} className="px-1 pb-2 text-center text-xs font-medium">
            {format(day, 'EEE d')}
          </div>
        ))}
        <div className="relative">
          {Array.from({ length: SLOT_COUNT }, (_, index) =>
            index % 2 === 0 ? (
              <div key={index} className="text-[10px] text-muted-foreground" style={{ height: SLOT_PX * 2 }}>
                {DAY_START_HOUR + index / 2}:00
              </div>
            ) : null,
          )}
        </div>
        {days.map((day) => {
          const items = itemsByDay.get(dayKey(day)) ?? []
          const outside = items.filter((item) => slotIndex(new Date(item.dueAt)) === null)
          const inside = items.filter((item) => slotIndex(new Date(item.dueAt)) !== null)
          return (
            <div key={dayKey(day)} className="border-l border-border">
              {outside.length > 0 ? (
                <div className="space-y-1 border-b border-border p-1">
                  {outside.map((item) => (
                    <CalendarChip
                      key={item.id}
                      followUp={item}
                      leadName={leadName(item.leadId)}
                      overdue={new Date(item.dueAt) < now}
                      onOpen={onOpen}
                    />
                  ))}
                </div>
              ) : null}
              <div className="relative">
                {Array.from({ length: SLOT_COUNT }, (_, index) => (
                  <SlotRow key={index} day={day} index={index} onCreate={onCreate} />
                ))}
                {inside.map((item) => {
                  const index = slotIndex(new Date(item.dueAt)) ?? 0
                  return (
                    <div
                      key={item.id}
                      className="absolute inset-x-0.5 z-10"
                      style={{ top: index * SLOT_PX + 2 }}
                    >
                      <CalendarChip
                        followUp={item}
                        leadName={leadName(item.leadId)}
                        overdue={new Date(item.dueAt) < now}
                        onOpen={onOpen}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <p className="sr-only">Each row is {SLOT_MINUTES} minutes, from {DAY_START_HOUR}:00.</p>
    </div>
  )
}
