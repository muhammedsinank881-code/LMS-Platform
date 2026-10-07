import { Award, CalendarCheck, CheckCircle2, Flame, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui'
import { MOCK_STUDENT_DATA } from '../../mock/student-data'

export function StudentStatsCards() {
  const { stats } = MOCK_STUDENT_DATA

  const cards = [
    {
      label: 'Attendance Rate',
      mainValue: `${stats.attendancePercentage}%`,
      subtext: `${stats.attendedClasses} / ${stats.totalClasses} classes attended`,
      icon: CalendarCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: `${stats.absentClasses} absents`,
    },
    {
      label: 'Current Streak',
      mainValue: `${stats.streakDays} Days`,
      subtext: 'Active learning streak 🔥',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badge: 'On Fire',
    },
    {
      label: 'Track Progress',
      mainValue: `${stats.progressPercentage}%`,
      subtext: '14 of 18 Modules completed',
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badge: 'On Track',
    },
    {
      label: 'Pending Tasks',
      mainValue: `${stats.pendingTasksTodayCount}`,
      subtext: 'Tasks due today',
      icon: CheckCircle2,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badge: 'Action Needed',
    },
    {
      label: 'Latest Certificate',
      mainValue: 'React & TS',
      subtext: stats.lastCertificateTitle,
      icon: Award,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      badge: 'Earned',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="relative overflow-hidden p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <div className={`rounded-lg border p-2 ${card.color}`}>
                <Icon className="h-4 w-4 shrink-0" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground">{card.mainValue}</div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{card.subtext}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
