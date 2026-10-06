import { useMemo, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { LiveStatus } from '@/components/common/LiveStatus'
import { addDays, addMonths, format, parseISO } from 'date-fns'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  buildMonthGrid,
  buildWeekDays,
  dayKey,
  dueAtFromDayDrop,
  dueAtFromSlotDrop,
  parseDayKey,
} from '@/lib/calendar-grid'
import type { FollowUp } from '@/types'
import { FollowUpQuickActions } from '../FollowUpQuickActions'
import { AgendaList } from './AgendaList'
import { MonthGrid } from './MonthGrid'
import { WeekView } from './WeekView'

function byDay(items: readonly FollowUp[]): Map<string, FollowUp[]> {
  const map = new Map<string, FollowUp[]>()
  for (const item of items) {
    if (item.status === 'done') continue
    const key = dayKey(new Date(item.dueAt))
    map.set(key, [...(map.get(key) ?? []), item])
  }
  return map
}

export function FollowUpCalendar({
  items,
  period,
  span,
  leadName,
  leadContact,
  now,
  onPeriodChange,
  onSpanChange,
  onCreateAt,
  onReschedule,
  onAskReschedule,
  onComplete,
  onSnooze,
}: {
  items: readonly FollowUp[]
  period: string
  span: 'month' | 'week'
  leadName: (id: string) => string
  leadContact: (id: string) => { phone?: string | null; email?: string | null; whatsapp?: string | null }
  now: Date
  onPeriodChange: (period: string) => void
  onSpanChange: (span: 'month' | 'week') => void
  onCreateAt: (dueAt: string) => void
  onReschedule: (id: string, dueAt: string) => void
  onAskReschedule: (followUp: FollowUp) => void
  onComplete: (followUp: FollowUp) => void
  onSnooze: (id: string, minutes: number) => void
}) {
  const mobile = useMediaQuery('(max-width: 1023px)')
  const anchor = parseISO(period)
  const safeAnchor = Number.isNaN(anchor.getTime()) ? now : anchor
  const days = span === 'week' ? buildWeekDays(safeAnchor) : buildMonthGrid(safeAnchor)
  const itemsByDay = useMemo(() => byDay(items), [items])
  const [openId, setOpenId] = useState<string | null>(null)
  const [dragStatus, setDragStatus] = useState('')
  const openItem = items.find((item) => item.id === openId) ?? null
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const shift = (direction: -1 | 1) => {
    const next = span === 'week' ? addDays(safeAnchor, direction * 7) : addMonths(safeAnchor, direction)
    onPeriodChange(format(next, 'yyyy-MM-dd'))
  }

  const onDragStart = (event: DragStartEvent) => {
    const followUp = items.find((item) => item.id === String(event.active.id))
    if (followUp) setDragStatus(`Picked up follow-up with ${leadName(followUp.leadId)}. Drop it on a day, or press Escape to cancel.`)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const overId = String(event.over?.id ?? '')
    const followUp = items.find((item) => item.id === String(event.active.id))
    if (!followUp || !overId) {
      setDragStatus('Drop cancelled.')
      return
    }
    setDragStatus(`Moved follow-up with ${leadName(followUp.leadId)}.`)
    if (overId.startsWith('day:')) {
      onReschedule(followUp.id, dueAtFromDayDrop(new Date(followUp.dueAt), parseDayKey(overId.slice(4))).toISOString())
    } else if (overId.startsWith('slot:')) {
      const [, key, index] = overId.split(':')
      onReschedule(followUp.id, dueAtFromSlotDrop(parseDayKey(key ?? period), Number(index)).toISOString())
    }
  }

  const selectedDay = days.find((day) => dayKey(day) === dayKey(safeAnchor)) ?? safeAnchor

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <LiveStatus message={dragStatus} />
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => shift(-1)} aria-label="Previous period">
          Prev
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onPeriodChange(format(now, 'yyyy-MM-dd'))}>
          Today
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => shift(1)} aria-label="Next period">
          Next
        </Button>
        <p className="text-sm font-medium">{format(safeAnchor, span === 'week' ? 'd MMM yyyy' : 'MMMM yyyy')}</p>
        <div className="ml-auto flex gap-1">
          <Button type="button" size="sm" variant={span === 'month' ? 'primary' : 'outline'} onClick={() => onSpanChange('month')}>
            Month
          </Button>
          <Button type="button" size="sm" variant={span === 'week' ? 'primary' : 'outline'} onClick={() => onSpanChange('week')}>
            Week
          </Button>
        </div>
      </div>
      {mobile ? (
        <div className="space-y-3">
          <div className="flex gap-1 overflow-x-auto">
            {(span === 'week' ? days : buildWeekDays(safeAnchor)).map((day) => (
              <Button
                key={dayKey(day)}
                type="button"
                size="sm"
                className="min-h-11"
                variant={dayKey(day) === dayKey(selectedDay) ? 'primary' : 'outline'}
                onClick={() => onPeriodChange(format(day, 'yyyy-MM-dd'))}
              >
                {format(day, 'EEE d')}
              </Button>
            ))}
          </div>
          <AgendaList
            day={selectedDay}
            items={itemsByDay.get(dayKey(selectedDay)) ?? []}
            leadName={leadName}
            now={now}
            onCreate={(day) => onCreateAt(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 11).toISOString())}
            onOpen={(item) => setOpenId(item.id)}
          />
        </div>
      ) : span === 'week' ? (
        <WeekView
          days={days}
          itemsByDay={itemsByDay}
          leadName={leadName}
          now={now}
          onCreate={onCreateAt}
          onOpen={(item) => setOpenId(item.id)}
        />
      ) : (
        <MonthGrid
          days={days}
          month={safeAnchor}
          itemsByDay={itemsByDay}
          leadName={leadName}
          now={now}
          onCreate={(day) => onCreateAt(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 11).toISOString())}
          onOpen={(item) => setOpenId(item.id)}
        />
      )}
      <Popover open={openItem !== null} onOpenChange={(next) => !next && setOpenId(null)}>
        <PopoverTrigger asChild>
          <span className="sr-only">Follow-up details</span>
        </PopoverTrigger>
        <PopoverContent>
          {openItem ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{leadName(openItem.leadId)}</p>
              <p className="text-xs text-muted-foreground">Keyboard: choose Reschedule. Dragging is the pointer shortcut.</p>
              <FollowUpQuickActions
                leadId={openItem.leadId}
                {...leadContact(openItem.leadId)}
                onComplete={() => {
                  onComplete(openItem)
                  setOpenId(null)
                }}
                onReschedule={() => {
                  onAskReschedule(openItem)
                  setOpenId(null)
                }}
                onSnooze={(minutes) => onSnooze(openItem.id, minutes)}
              />
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </DndContext>
  )
}
