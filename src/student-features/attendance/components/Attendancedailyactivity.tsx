import { cn } from '@/lib/cn'
import type { ActivityType, DailyActivity } from '../data/attendanceData'


interface AttendanceDailyActivityProps {
  /** Heading date, e.g. "8 Oct 2026" (use record.displayDate) */
  displayDate?: string
  activities: DailyActivity[]
}

const TYPE_CONFIG: Record<ActivityType, { label: string; glyph: string; tone: string }> = {
  live: { label: 'Live class', glyph: '●', tone: 'bg-rose-500/10 text-rose-600' },
  video: { label: 'Video', glyph: '▶', tone: 'bg-primary/10 text-primary' },
  quiz: { label: 'Quiz', glyph: '?', tone: 'bg-amber-500/15 text-amber-600' },
  assignment: { label: 'Assignment', glyph: '✎', tone: 'bg-violet-500/10 text-violet-600' },
  practice: { label: 'Practice', glyph: '</>', tone: 'bg-emerald-500/10 text-emerald-600' },
  other: { label: 'Activity', glyph: '•', tone: 'bg-muted text-muted-foreground' },
}

function formatDuration(minutes?: number): string | null {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function AttendanceDailyActivity({ displayDate, activities }: AttendanceDailyActivityProps) {
  return (
    <div className="rounded-md border border-border bg-surface shadow-sm overflow-hidden">
      <div className="border-b border-border px-5 py-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">Daily Activity</h3>
        <span className="text-xs text-muted-foreground">
          {displayDate ? `${displayDate} · ` : ''}
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="p-10 text-center text-xs text-muted-foreground">
          No activity recorded for this day.
        </div>
      ) : (
        <ol className="p-5">
          {activities.map((activity, index) => {
            const cfg = TYPE_CONFIG[activity.type]
            const duration = formatDuration(activity.durationMinutes)
            const isLast = index === activities.length - 1

            return (
              <li key={activity.id} className="relative flex gap-4 pb-5 last:pb-0">
                {/* Timeline line */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
                  />
                )}

                {/* Type icon */}
                <div
                  className={cn(
                    'relative z-10 h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold',
                    cfg.tone,
                  )}
                  title={cfg.label}
                >
                  {cfg.glyph}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold text-foreground">{activity.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{activity.time}</span>
                  </div>
                  {(activity.detail || duration) && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {[activity.detail, duration].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}