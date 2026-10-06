import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

/** Monday, matching the workspace week. */
export const WEEK_STARTS_ON = 1 as const

export const DAY_START_HOUR = 8
export const DAY_END_HOUR = 20
export const SLOT_MINUTES = 30

export const SLOT_COUNT = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Every day cell in the month grid, including the leading and trailing days. */
export function buildMonthGrid(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: WEEK_STARTS_ON })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: WEEK_STARTS_ON })
  return eachDayOfInterval({ start, end })
}

export function buildWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON })
  return eachDayOfInterval({
    start,
    end: endOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON }),
  })
}

/** Slot index inside 08:00–20:00, or null when the time sits outside that window. */
export function slotIndex(due: Date): number | null {
  const minutes = due.getHours() * 60 + due.getMinutes()
  const start = DAY_START_HOUR * 60
  const end = DAY_END_HOUR * 60
  if (minutes < start || minutes >= end) return null
  return Math.floor((minutes - start) / SLOT_MINUTES)
}

/** Keeps the clock time and moves the follow-up onto another day. */
export function dueAtFromDayDrop(current: Date, day: Date): Date {
  const next = new Date(day)
  next.setHours(current.getHours(), current.getMinutes(), 0, 0)
  return next
}

/** Places a follow-up at the start of a week-view slot. */
export function dueAtFromSlotDrop(day: Date, index: number): Date {
  const minutes = DAY_START_HOUR * 60 + index * SLOT_MINUTES
  const next = new Date(day)
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return next
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day)
}
