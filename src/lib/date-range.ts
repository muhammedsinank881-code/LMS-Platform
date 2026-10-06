import type { DateRange } from '@/types'

export const RANGE_PRESETS = ['today', '7d', '30d', 'this_month', 'last_month', 'this_quarter', 'custom'] as const
export type RangePreset = (typeof RANGE_PRESETS)[number]

export const REPORT_TIME_ZONE = 'Asia/Kolkata'

const LABELS: Record<RangePreset, string> = {
  today: 'Today',
  '7d': '7 days',
  '30d': '30 days',
  this_month: 'This month',
  last_month: 'Last month',
  this_quarter: 'This quarter',
  custom: 'Custom',
}

export function presetLabel(preset: RangePreset): string {
  return LABELS[preset]
}

export function compareCaption(preset: RangePreset): string {
  return preset === '30d' ? 'vs last 30 days' : 'vs previous period'
}

export function isRangePreset(value: string | null): value is RangePreset {
  return value !== null && (RANGE_PRESETS as readonly string[]).includes(value)
}

export interface CalendarDate {
  year: number
  month: number
  day: number
}

function part(parts: Intl.DateTimeFormatPart[], type: string): number {
  return Number(parts.find((item) => item.type === type)?.value ?? '0')
}

export function calendarDate(instant: Date, timeZone: string): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant)
  return { year: part(parts, 'year'), month: part(parts, 'month'), day: part(parts, 'day') }
}

function zoneOffsetMs(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  }).formatToParts(instant)
  let hour = part(parts, 'hour')
  let day = part(parts, 'day')
  if (hour === 24) {
    hour = 0
    day += 1
  }
  const fraction = parts.find((item) => item.type === 'fractionalSecond')?.value ?? '0'
  const ms = Number(fraction.padEnd(3, '0').slice(0, 3))
  const asUtc = Date.UTC(
    part(parts, 'year'),
    part(parts, 'month') - 1,
    day,
    hour,
    part(parts, 'minute'),
    part(parts, 'second'),
    ms,
  )
  return asUtc - instant.getTime()
}

/** Wall-clock time in `timeZone`, as a UTC instant. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second, ms)
  const corrected = guess - zoneOffsetMs(timeZone, new Date(guess - zoneOffsetMs(timeZone, new Date(guess))))
  return new Date(corrected)
}

export function formatCalendarDate(date: CalendarDate): string {
  const month = String(date.month).padStart(2, '0')
  const day = String(date.day).padStart(2, '0')
  return `${date.year}-${month}-${day}`
}

export function calendarDayKey(iso: string, timeZone = REPORT_TIME_ZONE): string | null {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return null
  return formatCalendarDate(calendarDate(new Date(time), timeZone))
}

function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() }
}

function dayRange(from: CalendarDate, to: CalendarDate, timeZone: string): DateRange {
  return {
    from: zonedTimeToUtc(from.year, from.month, from.day, 0, 0, 0, 0, timeZone).toISOString(),
    to: zonedTimeToUtc(to.year, to.month, to.day, 23, 59, 59, 999, timeZone).toISOString(),
  }
}

export function rangeForPreset(
  preset: Exclude<RangePreset, 'custom'>,
  now: Date,
  timeZone = REPORT_TIME_ZONE,
): DateRange {
  const today = calendarDate(now, timeZone)
  if (preset === 'today') return dayRange(today, today, timeZone)
  if (preset === '7d') return dayRange(addCalendarDays(today, -6), today, timeZone)
  if (preset === '30d') return dayRange(addCalendarDays(today, -29), today, timeZone)
  if (preset === 'this_month') return dayRange({ ...today, day: 1 }, today, timeZone)
  if (preset === 'last_month') {
    const last = addCalendarDays({ ...today, day: 1 }, -1)
    return dayRange({ ...last, day: 1 }, last, timeZone)
  }
  const quarterMonth = Math.floor((today.month - 1) / 3) * 3 + 1
  return dayRange({ year: today.year, month: quarterMonth, day: 1 }, today, timeZone)
}

/** `YYYY-MM-DD` inputs from the custom picker, interpreted in the report timezone. */
export function rangeFromDays(fromDay: string, toDay: string, timeZone = REPORT_TIME_ZONE): DateRange | null {
  const from = parseDay(fromDay)
  const to = parseDay(toDay)
  if (!from || !to) return null
  const range = dayRange(from, to, timeZone)
  if (Date.parse(range.from) > Date.parse(range.to)) return null
  return range
}

function parseDay(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

/** Every `yyyy-MM-dd` from `from` through `to` in `timeZone`. Null when the range is invalid. */
export function eachCalendarDay(range: DateRange, timeZone = REPORT_TIME_ZONE): string[] | null {
  const start = calendarDayKey(range.from, timeZone)
  const end = calendarDayKey(range.to, timeZone)
  if (!start || !end || start > end) return null
  const days: string[] = []
  let cursor = start
  while (cursor <= end && days.length < 800) {
    days.push(cursor)
    cursor = nextDayKey(cursor)
  }
  return days
}

function nextDayKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number)
  const next = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + 1))
  return next.toISOString().slice(0, 10)
}

/** Minutes since midnight in `timeZone`, for quiet-hours checks. */
export function minutesOfDay(now: Date, timeZone = REPORT_TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  let hour = part(parts, 'hour')
  if (hour === 24) hour = 0
  return hour * 60 + part(parts, 'minute')
}

export function isQuietNow(
  quiet: { enabled: boolean; start: string; end: string },
  now: Date,
  timeZone = REPORT_TIME_ZONE,
): boolean {
  if (!quiet.enabled) return false
  const start = clockMinutes(quiet.start)
  const end = clockMinutes(quiet.end)
  if (start === null || end === null || start === end) return false
  const current = minutesOfDay(now, timeZone)
  if (start < end) return current >= start && current < end
  return current >= start || current < end
}

function clockMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}
