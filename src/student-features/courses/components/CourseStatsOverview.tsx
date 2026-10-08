import { Award, BookOpen, CheckCircle2, Clock, GraduationCap } from 'lucide-react'
import { Card } from '@/components/ui'
import type { CourseStats } from '../data/coursesData'

interface CourseStatsOverviewProps {
  stats: CourseStats
}

export function CourseStatsOverview({ stats }: CourseStatsOverviewProps) {
  const statItems = [
    {
      label: 'Enrolled Courses',
      value: stats.totalEnrolled,
      subtext: 'Active learning path',
      icon: BookOpen,
      iconColor: 'text-primary',
      bgColor: 'bg-primary-subtle/50',
    },
    {
      label: 'In Progress',
      value: stats.inProgressCount,
      subtext: 'Active modules',
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Completed Courses',
      value: stats.completedCount,
      subtext: 'Certificates earned',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Total Learning Time',
      value: `${stats.totalHoursLearned}h`,
      subtext: 'Video & lab hours',
      icon: Award,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Avg Progress Rate',
      value: `${stats.overallCompletionRate}%`,
      subtext: 'Completion rate',
      icon: GraduationCap,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
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
