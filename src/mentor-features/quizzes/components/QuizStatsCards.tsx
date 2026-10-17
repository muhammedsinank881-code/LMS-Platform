import { Award, Clock, FileCheck, HelpCircle } from 'lucide-react'
import { Card } from '@/components/ui'
import type { QuizKpiStats } from '../types'

interface QuizStatsCardsProps {
  stats: QuizKpiStats
}

export function QuizStatsCards({ stats }: QuizStatsCardsProps) {
  const cards = [
    {
      label: 'Active Quizzes',
      value: stats.activeCount,
      description: 'Currently available',
      icon: HelpCircle,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Draft Quizzes',
      value: stats.draftCount,
      description: 'Not published',
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Submissions',
      value: stats.totalSubmissions,
      description: 'Total attempts',
      icon: FileCheck,
      iconBg: 'bg-primary-subtle text-primary',
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      description: 'Across published quizzes',
      icon: Award,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5 hover:border-primary/40 transition-colors"
          >
            <div
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold text-foreground leading-tight truncate">
                {card.value}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">
                {card.label}
              </div>
              <div className="text-[10px] text-muted-foreground/80 hidden sm:block truncate">
                {card.description}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
