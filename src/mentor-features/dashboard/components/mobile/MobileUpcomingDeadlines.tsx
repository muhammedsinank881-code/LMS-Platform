import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'
import { getAssignments } from '@/mentor-features/assignments/mockData'

export function MobileUpcomingDeadlines() {
  const navigate = useNavigate()
  const assignments = getAssignments()

  const deadlineItems = assignments.slice(0, 3).map((asg, idx) => {
    const isDueSoon = idx === 0
    return {
      id: asg.id,
      title: asg.title,
      course: asg.classBatch,
      dueDate: asg.dueDate,
      dueTime: '11:59 PM',
      status: isDueSoon ? ('Due Soon' as const) : ('Upcoming' as const),
      badgeTone: isDueSoon ? ('warning' as const) : ('neutral' as const),
      path: '/mentor/assignments',
    }
  })

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Upcoming Deadlines
        </h2>
        <Link
          to="/mentor/assignments"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Deadlines List */}
      <div className="space-y-2">
        {deadlineItems.map((item) => (
          <Card
            key={item.id}
            onClick={() => navigate(item.path)}
            className="bg-surface border-border shadow-2xs rounded-xl hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer select-none group"
          >
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="font-semibold text-foreground/80">
                    {item.course}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{item.dueDate}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.dueTime}</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <Badge tone={item.badgeTone} size="sm" className="text-[10px] font-semibold">
                  {item.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
