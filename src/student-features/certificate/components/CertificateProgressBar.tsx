import { ProgressBar } from '@/components/ui'

interface CertificateProgressBarProps {
  overallProgress: number
  completedCourses: number
  totalCourses: number
  completedAssignments: number
  totalAssignments: number
  completedProjects: number
  totalProjects: number
}

export function CertificateProgressBar({
  overallProgress,
  completedCourses,
  totalCourses,
  completedAssignments,
  totalAssignments,
  completedProjects,
  totalProjects,
}: CertificateProgressBarProps) {
  const tone =
    overallProgress >= 100 ? 'success'
    : overallProgress >= 70 ? 'primary'
    : overallProgress >= 40 ? 'warning'
    : 'destructive'

  const pillItems = [
    {
      label: 'Courses',
      done: completedCourses,
      total: totalCourses,
      color: 'bg-primary',
    },
    {
      label: 'Assignments',
      done: completedAssignments,
      total: totalAssignments,
      color: 'bg-amber-500',
    },
    {
      label: 'Projects',
      done: completedProjects,
      total: totalProjects,
      color: 'bg-violet-500',
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Overall Completion</span>
        <span className="text-sm font-bold tabular-nums text-foreground">{overallProgress}%</span>
      </div>

      <ProgressBar value={overallProgress} tone={tone} size="lg" />

      {/* Segment breakdown pills */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {pillItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-center"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`h-2 w-2 rounded-full ${item.color} inline-block`} />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {item.done}
              <span className="text-muted-foreground font-normal">/{item.total}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
