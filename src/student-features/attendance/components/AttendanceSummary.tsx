import { TrendingUp, Clock, CalendarCheck2, CalendarX2, Activity, Timer } from 'lucide-react'
import { Card } from '@/components/ui'
import { ProgressBar } from '@/components/ui'
import type { AttendanceSummaryStats } from '../data/attendanceData'

interface AttendanceSummaryProps {
  summary: AttendanceSummaryStats
}

export function AttendanceSummary({ summary }: AttendanceSummaryProps) {
  const statItems = [
    {
      label: 'Attendance Rate',
      value: `${summary.attendancePercentage}%`,
      subtext: `${summary.presentDays} of ${summary.totalDays} days`,
      icon: TrendingUp,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Present Days',
      value: summary.presentDays,
      subtext: 'Full & late arrivals',
      icon: CalendarCheck2,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Absent Days',
      value: summary.absentDays,
      subtext: `${summary.lateDays} late arrival days`,
      icon: CalendarX2,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      label: 'Current Streak',
      value: `${summary.currentStreakDays} days`,
      subtext: 'Consecutive present days',
      icon: Activity,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Hours This Month',
      value: `${summary.totalHoursThisMonth}h`,
      subtext: `~${summary.avgDailyHours}h/day avg`,
      icon: Clock,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Avg Session Time',
      value: `${summary.avgDailyHours}h`,
      subtext: 'Per active platform day',
      icon: Timer,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <Card key={idx} className="p-4 transition-all hover:shadow-sm hover:border-primary/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                <div className={`rounded-lg p-2 ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold tracking-tight text-foreground">{item.value}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.subtext}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Attendance Rate Progress Bar Row */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Overall Attendance Rate</span>
          <span className="text-xs font-bold tabular-nums text-foreground">{summary.attendancePercentage}%</span>
        </div>
        <ProgressBar
          value={summary.attendancePercentage}
          tone={summary.attendancePercentage >= 85 ? 'primary' : summary.attendancePercentage >= 75 ? 'warning' : 'destructive'}
          size="md"
        />
        <div className="mt-2 flex items-center gap-6 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success inline-block" /> Present: {summary.presentDays}d
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning inline-block" /> Late: {summary.lateDays}d
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive inline-block" /> Absent: {summary.absentDays}d
          </span>
        </div>
      </div>
    </div>
  )
}
