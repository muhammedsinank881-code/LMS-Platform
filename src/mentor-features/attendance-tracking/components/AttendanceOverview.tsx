import { Card } from '@/components/ui/card'

interface AttendanceOverviewProps {
  totalStudents: number
  presentCount: number
  lateCount: number
  partialCount?: number
  absentCount: number
  pendingCount?: number
  onStatusClick?: (status: string) => void
}

export function AttendanceOverview({
  totalStudents,
  presentCount,
  lateCount,
  partialCount = 0,
  absentCount,
  pendingCount = 0,
  onStatusClick,
}: AttendanceOverviewProps) {
  const stats = [
    {
      id: 'present',
      label: 'Present',
      value: presentCount,
      bgClass:
        'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-100/80 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      labelClass: 'text-emerald-700/80 dark:text-emerald-400/90',
    },
    {
      id: 'late',
      label: 'Late',
      value: lateCount,
      bgClass:
        'bg-amber-50/80 dark:bg-amber-950/40 border-amber-100/80 dark:border-amber-900/40 text-amber-600 dark:text-amber-400',
      labelClass: 'text-amber-700/80 dark:text-amber-400/90',
    },
    {
      id: 'partial',
      label: 'Partial',
      value: partialCount,
      bgClass:
        'bg-sky-50/80 dark:bg-sky-950/40 border-sky-100/80 dark:border-sky-900/40 text-sky-600 dark:text-sky-400',
      labelClass: 'text-sky-700/80 dark:text-sky-400/90',
    },
    {
      id: 'absent',
      label: 'Absent',
      value: absentCount,
      bgClass:
        'bg-rose-50/80 dark:bg-rose-950/40 border-rose-100/80 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
      labelClass: 'text-rose-700/80 dark:text-rose-400/90',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pendingCount,
      bgClass:
        'bg-slate-50/80 dark:bg-slate-900/40 border-slate-100/80 dark:border-slate-800 text-slate-500 dark:text-slate-400',
      labelClass: 'text-slate-600/80 dark:text-slate-400/90',
    },
  ]

  return (
    <Card className="p-3.5 sm:p-5 bg-surface border-border shadow-sm rounded-2xl space-y-3 sm:space-y-4">
      {/* Title */}
      <h3 className="text-xs sm:text-sm font-bold text-foreground">
        Attendance Overview · {totalStudents} Students
      </h3>

      {/* 5 Equal-Width Compact Status Cards across available width */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 md:gap-4">
        {stats.map((stat) => {
          const content = (
            <>
              <span className="text-base sm:text-2xl font-extrabold leading-none tracking-tight">
                {stat.value}
              </span>
              <span
                className={`text-[10px] sm:text-xs font-semibold mt-1 sm:mt-1.5 tracking-tight ${stat.labelClass}`}
              >
                {stat.label}
              </span>
            </>
          )

          const baseClassName = `flex flex-col items-center justify-center py-2.5 sm:py-4 px-1 sm:px-2 rounded-xl sm:rounded-2xl border transition-all active:scale-95 ${
            stat.bgClass
          } ${onStatusClick ? 'cursor-pointer hover:opacity-90 hover:shadow-xs' : ''}`

          return onStatusClick ? (
            <button
              key={stat.id}
              type="button"
              onClick={() => onStatusClick(stat.id)}
              className={baseClassName}
            >
              {content}
            </button>
          ) : (
            <div key={stat.id} className={baseClassName}>
              {content}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
