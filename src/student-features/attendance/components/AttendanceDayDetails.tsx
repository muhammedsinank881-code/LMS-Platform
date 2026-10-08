import { CalendarDays, Clock, Layers } from 'lucide-react'
import { Badge } from '@/components/ui'
import { AttendanceSessionCard } from './AttendanceSessionCard'
import type { AttendanceDayRecord } from '../data/attendanceData'

interface AttendanceDayDetailsProps {
  record: AttendanceDayRecord | null
}

function formatTotalDuration(totalMinutes: number): string {
  if (totalMinutes === 0) return '0 min'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h 0m`
  return `${h}h ${m}m`
}

export function AttendanceDayDetails({ record }: AttendanceDayDetailsProps) {
  if (!record) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Select a date to view session details</p>
      </div>
    )
  }

  const isWeekendOrHoliday = record.status === 'weekend' || record.status === 'holiday'
  const hasActiveSessions = record.sessions.some((s) => s.status === 'active')
  const completedMinutes = record.sessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0)

  const statusTone =
    record.status === 'present' ? 'success'
    : record.status === 'late' ? 'warning'
    : record.status === 'absent' ? 'destructive'
    : 'neutral'

  return (
    <div className="rounded-md border border-border bg-surface shadow-sm overflow-hidden">
      {/* Day Header */}
      <div className="border-b border-border bg-surface px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">{record.displayDate}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{record.dayOfWeek}</p>
          </div>
          <Badge tone={statusTone} dot size="sm" className="font-semibold text-xs capitalize mt-0.5">
            {record.status === 'present' ? 'Present' : record.status === 'late' ? 'Late Arrival' : record.status === 'absent' ? 'Absent' : record.status}
          </Badge>
        </div>

        {/* Summary Row */}
        {!isWeekendOrHoliday && record.sessionCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold text-foreground">{record.sessionCount}</span>
              <span className="text-muted-foreground">session{record.sessionCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold text-foreground">{formatTotalDuration(record.totalMinutes)}</span>
              <span className="text-muted-foreground">total platform time</span>
            </div>

            {hasActiveSessions && (
              <Badge tone="success" dot size="sm" className="text-[10px] font-semibold">
                Active Session Running
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="p-5 space-y-4">
        {isWeekendOrHoliday ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground font-medium capitalize">{record.status} — No platform sessions</p>
            <p className="text-xs text-muted-foreground mt-1">Rest & recharge! 🎉</p>
          </div>
        ) : record.sessions.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">No sessions recorded for this day</p>
            <p className="text-xs text-muted-foreground mt-1">The student did not log in to the platform.</p>
          </div>
        ) : (
          <>
            {record.sessions.map((session, idx) => (
              <AttendanceSessionCard
                key={session.id}
                session={session}
                sessionNumber={idx + 1}
              />
            ))}

            {/* Total Summary Row at Bottom */}
            {record.sessionCount > 1 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Combined Total ({record.sessionCount} sessions)
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {completedMinutes > 0 ? formatTotalDuration(completedMinutes) : '—'}
                  {hasActiveSessions && ' + ongoing'}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
