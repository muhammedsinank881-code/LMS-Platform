import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  UserCheck,
} from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'

interface MobileNeedsAttentionProps {
  pendingSubmissionsCount?: number
  unverifiedAttendanceCount?: number
  draftResultsCount?: number
}

export function MobileNeedsAttention({
  pendingSubmissionsCount = 18,
  unverifiedAttendanceCount = 1,
  draftResultsCount = 2,
}: MobileNeedsAttentionProps) {
  const navigate = useNavigate()

  const attentionItems = [
    {
      id: 'submissions',
      title: 'Submissions to review',
      subtitle: 'React Custom Hooks & Problem Set',
      badgeText: `${pendingSubmissionsCount} Submissions`,
      badgeTone: 'warning' as const,
      icon: FileCheck2,
      iconColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      path: '/mentor/assignments',
    },
    {
      id: 'attendance',
      title: 'Attendance to verify',
      subtitle: 'Advanced Data Structures · Live Session',
      badgeText: `${unverifiedAttendanceCount} Today`,
      badgeTone: 'primary' as const,
      icon: UserCheck,
      iconColor: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      path: '/mentor/attendance',
    },
    {
      id: 'results',
      title: 'Results to publish',
      subtitle: 'Mid-Term Exam Evaluation Scorecards',
      badgeText: `${draftResultsCount} Drafts`,
      badgeTone: 'info' as const,
      icon: GraduationCap,
      iconColor: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      path: '/mentor/results',
    },
  ]

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Needs Attention
        </h2>
        <Link
          to="/mentor/assignments"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>See All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Actionable Cards List */}
      <div className="space-y-2">
        {attentionItems.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.id}
              onClick={() => navigate(item.path)}
              className="bg-surface border-border shadow-sm rounded-xl hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer select-none group"
            >
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-8 w-8 rounded-lg ${item.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge tone={item.badgeTone} size="sm" className="text-[10px] font-semibold">
                    {item.badgeText}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
