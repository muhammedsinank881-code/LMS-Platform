import { formatDistanceStrict, isValid } from 'date-fns'
import { EMPTY_VALUE } from './shared'

export type DateInput = Date | string | number

export interface DateFormatOptions {
  /** Defaults to the user's browser locale. */
  locale?: string
  timeZone?: string
}

function toValidDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return isValid(date) ? date : null
}

/** e.g. "3 Oct 2026" (en-IN) */
export function formatDate(value: DateInput, options: DateFormatOptions = {}): string {
  const date = toValidDate(value)
  if (!date) return EMPTY_VALUE
  return new Intl.DateTimeFormat(options.locale, {
    dateStyle: 'medium',
    timeZone: options.timeZone,
  }).format(date)
}

/** e.g. "3 Oct 2026, 10:55 pm" (en-IN) */
export function formatDateTime(value: DateInput, options: DateFormatOptions = {}): string {
  const date = toValidDate(value)
  if (!date) return EMPTY_VALUE
  return new Intl.DateTimeFormat(options.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: options.timeZone,
  }).format(date)
}

/** e.g. "2 hours ago", "in 3 days" */
export function formatRelative(value: DateInput, now: DateInput = new Date()): string {
  const date = toValidDate(value)
  const base = toValidDate(now)
  if (!date || !base) return EMPTY_VALUE
  return formatDistanceStrict(date, base, { addSuffix: true })
}

/** e.g. "10:55 pm" */
export function formatTime(value: DateInput, options: DateFormatOptions = {}): string {
  const date = toValidDate(value)
  if (!date) return EMPTY_VALUE
  return new Intl.DateTimeFormat(options.locale, { timeStyle: 'short', timeZone: options.timeZone }).format(date)
}

/** "Today", "Yesterday", otherwise the date. For chat date separators. */
export function formatDayLabel(value: DateInput, now: DateInput = new Date()): string {
  const date = toValidDate(value)
  const base = toValidDate(now)
  if (!date || !base) return EMPTY_VALUE
  const days = Math.round((startOfDay(base) - startOfDay(date)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return formatDate(date)
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Compact for list rows: "now", "5m", "3h", "2d", then the date. */
export function formatRelativeShort(value: DateInput, now: DateInput = new Date()): string {
  const date = toValidDate(value)
  const base = toValidDate(now)
  if (!date || !base) return EMPTY_VALUE
  const minutes = Math.floor((base.getTime() - date.getTime()) / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d`
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(date)
}
