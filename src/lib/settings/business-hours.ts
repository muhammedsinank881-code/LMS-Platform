import type { AssignmentRule, BusinessHours } from '@/types'

/** True when `now` falls on a working day and inside the start/end window. */
export function isWithinBusinessHours(
  now: Date,
  hours: BusinessHours | undefined,
  timeZone: string,
): boolean {
  if (!hours || hours.days.length === 0) return true
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? ''
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')
  const clock = hour * 60 + minute
  const [startH, startM] = hours.start.split(':').map(Number)
  const [endH, endM] = hours.end.split(':').map(Number)
  const inside = hours.days.includes(day) && clock >= startH * 60 + startM && clock < endH * 60 + endM
  return inside
}

/** Drops rules whose working-hours flag does not match the current clock. */
export function rulesForClock(
  rules: readonly AssignmentRule[],
  open: boolean,
): AssignmentRule[] {
  return rules.filter((rule) => rule.withinWorkingHours == null || rule.withinWorkingHours === open)
}
