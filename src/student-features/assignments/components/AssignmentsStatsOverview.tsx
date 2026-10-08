import { AlertCircle, Award, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { Card } from '@/components/ui'
import type { AssignmentStats } from '../data/assignmentsData'

interface AssignmentsStatsOverviewProps {
  stats: AssignmentStats
}

export function AssignmentsStatsOverview({ stats }: AssignmentsStatsOverviewProps) {
  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      subtext: 'Assignments & quizzes',
      icon: ClipboardList,
      iconColor: 'text-primary',
      bgColor: 'bg-primary-subtle/50',
    },
    {
      label: 'Pending Tasks',
      value: stats.pendingCount,
      subtext: 'Awaiting submission',
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Due Today',
      value: stats.dueTodayCount,
      subtext: stats.dueTodayCount > 0 ? 'Urgent action required' : 'All clear for today',
      icon: AlertCircle,
      iconColor: stats.dueTodayCount > 0 ? 'text-rose-500' : 'text-emerald-500',
      bgColor: stats.dueTodayCount > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Submitted Tasks',
      value: stats.submittedCount,
      subtext: 'Under mentor review',
      icon: CheckCircle2,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      subtext: `${stats.gradedCount} graded tasks`,
      icon: Award,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
  )
}
