import {
  CheckSquare,
  Clock,
  Code2,
  FolderGit2,
  HelpCircle,
  Users,
} from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'
import type { MentorKpiData } from '../types'

interface MentorKpiGridProps {
  data: MentorKpiData
}

export function MentorKpiGrid({ data }: MentorKpiGridProps) {
  const metrics = [
    {
      title: 'Active Students',
      value: data.activeStudents,
      subtext: `${data.attendanceRate}% Attendance Rate`,
      icon: Users,
      badgeText: '+2 this week',
      badgeTone: 'info' as const,
    },
    {
      title: 'Pending Reviews',
      value: data.pendingReviews,
      subtext: 'Submissions waiting review',
      icon: Clock,
      badgeText: 'Action needed',
      badgeTone: 'warning' as const,
    },
    {
      title: 'Avg Code Score',
      value: `${data.avgCodeScore}/100`,
      subtext: 'Cohort average evaluation',
      icon: Code2,
      badgeText: 'Top 10%',
      badgeTone: 'success' as const,
    },
    {
      title: 'Active Capstones',
      value: data.activeCapstones,
      subtext: 'Ongoing team projects',
      icon: FolderGit2,
      badgeText: '12 Teams',
      badgeTone: 'neutral' as const,
    },
    {
      title: '1-on-1 Sessions',
      value: data.scheduledSessions,
      subtext: 'Scheduled for today',
      icon: CheckSquare,
      badgeText: 'Today',
      badgeTone: 'info' as const,
    },
    {
      title: 'Helpdesk Tickets',
      value: data.openTickets,
      subtext: 'Unresolved student queries',
      icon: HelpCircle,
      badgeText: 'Open',
      badgeTone: 'destructive' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title} className="border-border bg-surface shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="rounded-md bg-muted p-2 text-foreground shrink-0">
                  <Icon className="size-4 text-primary" />
                </div>
                <Badge tone={item.badgeTone} size="sm" className="truncate">
                  {item.badgeText}
                </Badge>
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{item.value}</p>
                <p className="text-xs font-semibold text-foreground/80 mt-0.5">{item.title}</p>
              </div>

              <p className="text-xs text-muted-foreground truncate">{item.subtext}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
