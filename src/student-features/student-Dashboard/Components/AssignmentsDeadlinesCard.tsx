import { Calendar, CheckCircle2 } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { MOCK_STUDENT_DATA } from '../../mock/student-data'

export function AssignmentsDeadlinesCard() {
  const { assignments } = MOCK_STUDENT_DATA

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Top Assignments & Upcoming Deadlines</h3>
          <p className="text-[11px] text-muted-foreground">Track quizzes, submissions, and due dates</p>
        </div>
        <Badge tone="neutral" size="sm">
          {assignments.filter((a) => a.isDueToday).length} Due Today
        </Badge>
      </div>

      <div className="mt-3 space-y-2.5">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between gap-2 rounded-lg border border-border/60 bg-surface-hover p-3 sm:flex-row sm:items-center"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-foreground truncate">{item.title}</span>
                {item.isDueToday ? (
                  <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-500">Due Today</span>
                ) : null}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {item.dueDate}
                </span>
                <span>•</span>
                <span>{item.course}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 shrink-0">
              {item.status === 'pending' ? (
                <Button size="sm" variant="primary" className="h-7 text-xs px-3">
                  Submit Task
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{item.score || 'Submitted'}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
