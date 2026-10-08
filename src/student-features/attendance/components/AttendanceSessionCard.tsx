import { LogIn, LogOut, Clock, Wifi, Activity } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { AttendanceSession } from '../data/attendanceData'

interface AttendanceSessionCardProps {
  session: AttendanceSession
  sessionNumber: number
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'Active'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function AttendanceSessionCard({ session, sessionNumber }: AttendanceSessionCardProps) {
  const isActive = session.status === 'active'

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isActive
          ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20'
          : 'border-border bg-muted/20'
      }`}
    >
      {/* Active pulse indicator */}
      {isActive && (
        <span className="absolute right-3 top-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
              isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'
            }`}
          >
            {sessionNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Session {sessionNumber}</span>
              <Badge
                tone={isActive ? 'success' : 'neutral'}
                size="sm"
                dot={isActive}
                className="text-[10px]"
              >
                {isActive ? 'Active Now' : 'Completed'}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Wifi className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{session.platform}</span>
            </div>
          </div>
        </div>

        {/* Duration chip */}
        <div
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold shrink-0 ${
            isActive
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-muted text-foreground'
          }`}
        >
          <Clock className="h-3 w-3" />
          {formatDuration(session.durationMinutes)}
        </div>
      </div>

      {/* Check-in / Check-out row */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-background/60 border border-border/60 px-3 py-2">
          <LogIn className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div>
            <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Check In</span>
            <span className="text-xs font-bold text-foreground tabular-nums">{session.checkIn}</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isActive ? 'border-emerald-500/20 bg-emerald-500/5' : 'bg-background/60 border-border/60'}`}>
          {isActive ? (
            <Activity className="h-3.5 w-3.5 text-emerald-500 shrink-0 animate-pulse" />
          ) : (
            <LogOut className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          )}
          <div>
            <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Check Out</span>
            <span className={`text-xs font-bold tabular-nums ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
              {isActive ? 'Active Session' : session.checkOut ?? '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
