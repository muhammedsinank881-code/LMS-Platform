import { BookOpen, CheckCircle2, Clock, CircleDot } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import type { ClassSyllabusRecord } from '../types'

interface SyllabusStatsProps {
  record: ClassSyllabusRecord | null
}

export function SyllabusStats({ record }: SyllabusStatsProps) {
  const totalModules = record?.totalModules ?? 0
  const completedModules = record?.completedModules ?? 0
  const inProgressModules = record?.inProgressModules ?? 0
  const notStartedModules = record?.notStartedModules ?? 0

  const statItems = [
    {
      id: 'total-modules',
      label: 'Total Modules',
      value: totalModules,
      subtext: `${record?.totalTopics ?? 0} curriculum topics`,
      icon: BookOpen,
      iconColor: 'text-primary',
      bgColor: 'bg-primary-subtle',
      borderColor: 'border-border',
    },
    {
      id: 'completed-modules',
      label: 'Completed Modules',
      value: completedModules,
      subtext: `${record?.completedTopics ?? 0} topics marked done`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-500/20',
    },
    {
      id: 'in-progress-modules',
      label: 'In Progress',
      value: inProgressModules,
      subtext: `${record?.inProgressTopics ?? 0} active topics`,
      icon: Clock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/20',
    },
    {
      id: 'not-started-modules',
      label: 'Not Started',
      value: notStartedModules,
      subtext: `${record?.notStartedTopics ?? 0} upcoming topics`,
      icon: CircleDot,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card
            key={item.id}
            className="bg-surface border-border shadow-2xs rounded-2xl p-3 sm:p-4 transition-all hover:shadow-xs"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground truncate">
                  {item.label}
                </span>
                <div className={`h-7 w-7 rounded-lg ${item.bgColor} ${item.iconColor} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {item.value}
                </div>
                <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {item.subtext}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
