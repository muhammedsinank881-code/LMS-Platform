import { Clock, BookCheck } from 'lucide-react'
import { Card, CardContent, Badge, ProgressBar } from '@/components/ui'
import type { ClassSyllabusRecord } from '../types'

interface OverallCompletionCardProps {
  record: ClassSyllabusRecord | null
}

export function OverallCompletionCard({ record }: OverallCompletionCardProps) {
  if (!record) {
    return (
      <Card className="bg-surface border-border shadow-sm p-6 text-center text-muted-foreground">
        No syllabus data available for this class.
      </Card>
    )
  }

  const {
    completionPercentage,
    completedTopics,
    totalTopics,
    status,
    phaseText,
    completedModules,
    totalModules,
    className,
    courseCode,
    semester,
  } = record

  const getStatusBadgeTone = (s: typeof status) => {
    switch (s) {
      case 'Completed':
        return 'success' as const
      case 'On Track':
        return 'success' as const
      case 'In Progress':
        return 'primary' as const
      case 'Behind':
        return 'warning' as const
      default:
        return 'neutral' as const
    }
  }

  return (
    <Card className="bg-gradient-to-br from-surface to-muted/20 border-border shadow-2xs rounded-2xl p-4 sm:p-6 transition-all">
      <CardContent className="p-0 space-y-4 sm:space-y-5">
        {/* Top: Card Header + Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Class Curriculum Performance
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Overall Syllabus Completion
            </h2>
            <p className="text-xs text-muted-foreground">
              {className} ({courseCode}) • {semester}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge tone={getStatusBadgeTone(status)} size="md" className="font-semibold text-xs px-2.5 py-0.5">
              {status}
            </Badge>
          </div>
        </div>

        {/* Big Percentage + Visual Progress Bar */}
        <div className="space-y-2.5 bg-muted/40 p-4 sm:p-5 rounded-xl border border-border/50">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {completionPercentage}%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
              {completedTopics} of {totalTopics} Topics Finished
            </div>
          </div>

          <ProgressBar
            value={completionPercentage}
            size="md"
            tone="primary"
            aria-label="Overall Syllabus Completion"
          />

          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2 pt-1 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Phase: <strong className="text-foreground font-semibold">{phaseText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Modules: <strong className="text-foreground font-semibold">{completedModules} / {totalModules} Completed</strong></span>
            </div>
          </div>
        </div>

        {/* Detailed Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Topics Completed</span>
            <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {completedTopics}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Topics In Progress</span>
            <div className="text-base sm:text-lg font-bold text-primary">
              {record.inProgressTopics}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Topics Not Started</span>
            <div className="text-base sm:text-lg font-bold text-muted-foreground">
              {record.notStartedTopics}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Curriculum Status</span>
            <div className="text-base sm:text-lg font-bold text-foreground">
              {status}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
