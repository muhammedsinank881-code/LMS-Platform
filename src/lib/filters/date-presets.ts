import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns'
import type { DatePreset } from '@/types'

export interface DateWindow {
  start: Date
  end: Date
}

/** Weeks start on Monday, matching how Indian sales teams plan the week. */
const WEEK_OPTIONS = { weekStartsOn: 1 } as const

/**
 * Inclusive window for a preset, relative to `now`.
 * `last_30_days` runs from the start of the day 30 days ago through the end of today.
 */
export function dateWindowForPreset(preset: DatePreset, now: Date): DateWindow {
  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'this_week':
      return { start: startOfWeek(now, WEEK_OPTIONS), end: endOfWeek(now, WEEK_OPTIONS) }
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last_30_days':
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) }
  }
}
