import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import type { AttendanceDayRecord, DayStatus } from '../data/attendanceData'

interface AttendanceCalendarProps {
  records: AttendanceDayRecord[]
  selectedDate: string // 'YYYY-MM-DD'
  onSelectDate: (date: string) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Cell colours per status
const CELL_STYLE: Record<DayStatus, string> = {
  present: 'bg-muted/40 text-black border-2 border-primary font-bold hover:bg-slate-200 ',
  late: 'bg-muted/40 text-black border-2 border-amber-400 font-bold hover:bg-slate-200',
  absent: 'bg-muted/40 border-2 border-rose-500 font-bold hover:bg-slate-200 ',
  weekend: 'bg-muted/40 text-muted-foreground hover:bg-slate-200',
  holiday: 'bg-violet-500/15 text-violet-600 font-semibold',
}

const LEGEND: { label: string; swatch: string }[] = [
  { label: 'Present', swatch: 'bg-primary' },
  { label: 'Late', swatch: 'bg-amber-400' },
  { label: 'Absent', swatch: 'bg-rose-500' },
]

function parseYmd(date: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return null
  return { y, m: m - 1, d }
}

function toYmd(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const selectClass =
  'h-8 rounded-md border border-border bg-surface px-2.5 text-xs font-semibold text-foreground ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

export function AttendanceCalendar({ records, selectedDate, onSelectDate }: AttendanceCalendarProps) {
  const initial = parseYmd(selectedDate) ?? parseYmd(records[0]?.date ?? '') ?? {
    y: new Date().getFullYear(),
    m: new Date().getMonth(),
    d: 1,
  }
  const [year, setYear] = useState(initial.y)
  const [month, setMonth] = useState(initial.m)

  // date -> record lookup
  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceDayRecord>()
    records.forEach((r) => map.set(r.date, r))
    return map
  }, [records])

  // Year dropdown: every year found in the data + the one currently shown
  const years = useMemo(() => {
    const set = new Set<number>([year, new Date().getFullYear()])
    records.forEach((r) => {
      const p = parseYmd(r.date)
      if (p) set.add(p.y)
    })
    return Array.from(set).sort((a, b) => a - b)
  }, [records, year])

  // Build the month grid (Monday first)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const goToMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  return (
    <div className="rounded-md border border-border bg-surface shadow-sm overflow-hidden">
      {/* Header: title + month / year filter */}
      <div className="border-b border-border px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">Attendance Calendar</h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="h-8 w-8 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            ‹
          </button>

          <select
            aria-label="Month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={selectClass}
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>{name}</option>
            ))}
          </select>

          <select
            aria-label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={selectClass}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className="h-8 w-8 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-[11px] font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} aria-hidden="true" />

            const date = toYmd(year, month, day)
            const record = recordMap.get(date)
            const isSelected = date === selectedDate

            const base =
              'aspect-square rounded-md flex items-center justify-center text-xs sm:text-sm transition-all ' +
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'

            // No record for this day: plain, non-clickable cell
            if (!record) {
              return (
                <div
                  key={date}
                  className={cn(base, 'text-muted-foreground/50')}
                >
                  {day}
                </div>
              )
            }

            return (
              <button
                key={date}
                id={`attendance-day-${date}`}
                type="button"
                onClick={() => onSelectDate(date)}
                aria-label={`${date}, ${record.status}`}
                aria-pressed={isSelected}
                className={cn(
                  base,
                  CELL_STYLE[record.status],
                  isSelected && 'bg-slate-200',
                )}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          {LEGEND.map(({ label, swatch }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-sm', swatch)} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}