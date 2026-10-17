import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  UserCheck,
} from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'

interface NeedsAttentionSectionProps {
  pendingSubmissionsCount?: number
  unverifiedAttendanceCount?: number
  draftResultsCount?: number
}

export function NeedsAttentionSection({
  pendingSubmissionsCount = 18,
  unverifiedAttendanceCount = 1,
  draftResultsCount = 2,
}: NeedsAttentionSectionProps) {
  const navigate = useNavigate()

  const attentionItems = [
    {
      id: 'submissions',
      title: 'Submissions to review',
      subtitle: 'React Hooks & Problem Set',
      badgeText: `${pendingSubmissionsCount} Pending`,
      badgeTone: 'warning' as const,
      icon: FileCheck2,
      iconColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      path: '/mentor/assignments',
    },
    {
      id: 'attendance',
      title: 'Attendance to verify',
      subtitle: 'Data Structures · Live Class',
      badgeText: `${unverifiedAttendanceCount} Today`,
      badgeTone: 'primary' as const,
      icon: UserCheck,
      iconColor: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      path: '/mentor/attendance',
    },
    {
      id: 'results',
      title: 'Results to publish',
      subtitle: 'Mid-Term Scorecards',
      badgeText: `${draftResultsCount} Drafts`,
      badgeTone: 'info' as const,
      icon: GraduationCap,
      iconColor: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      path: '/mentor/results',
    },
  ]

  return (
    <div className="space-y-2 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
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

      {/* Actionable Cards Grid: 1 col on mobile, 3 cols on sm/tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 flex-1 items-stretch">
        {attentionItems.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.id}
              onClick={() => navigate(item.path)}
              className="bg-surface border-border shadow-2xs rounded-xl hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer select-none group flex flex-col justify-between"
            >
              <CardContent className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 h-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-lg ${item.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                  >
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
