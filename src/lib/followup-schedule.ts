import { addDays, startOfDay } from 'date-fns'

export const QUICK_PICKS = [
  { id: 'today-5pm', label: 'Today 5 PM' },
  { id: 'tomorrow-11am', label: 'Tomorrow 11 AM' },
  { id: 'in-3-days', label: 'In 3 days' },
  { id: 'next-monday', label: 'Next Monday' },
] as const

export type QuickPickId = (typeof QUICK_PICKS)[number]['id']

function atTime(day: Date, hour: number, minute = 0): Date {
  const next = new Date(day)
  next.setHours(hour, minute, 0, 0)
  return next
}

/** Days until the following Monday. Today being Monday yields 7. */
export function daysUntilNextMonday(now: Date): number {
  const day = now.getDay()
  const delta = (8 - day) % 7
  return delta === 0 ? 7 : delta
}

export function quickPickDate(id: QuickPickId, now: Date): Date {
  const today = startOfDay(now)
  switch (id) {
    case 'today-5pm':
      return atTime(today, 17)
    case 'tomorrow-11am':
      return atTime(addDays(today, 1), 11)
    case 'in-3-days':
      return atTime(addDays(today, 3), 11)
    case 'next-monday':
      return atTime(addDays(today, daysUntilNextMonday(now)), 11)
  }
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/** Local calendar date `YYYY-MM-DD` and time `HH:mm` from an instant. */
export function splitDueAt(value: Date | string): { date: string; time: string } {
  const date = typeof value === 'string' ? new Date(value) : value
  return {
    date: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
    time: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`,
  }
}

/** Combines a date input and a time input into an ISO timestamp in local time. */
export function combineDateAndTime(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, (month ?? 1) - 1, day, hour, minute, 0, 0).toISOString()
}

/** Minutes from now until 9:00 tomorrow, for the snooze "tomorrow" choice. */
export function minutesUntilTomorrowMorning(now: Date): number {
  const target = atTime(addDays(startOfDay(now), 1), 9)
  return Math.max(1, Math.round((target.getTime() - now.getTime()) / 60_000))
}
