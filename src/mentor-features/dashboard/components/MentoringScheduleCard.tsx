import { Calendar, Clock, Video } from 'lucide-react'
import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { MentoringSessionItem } from '../types'

interface MentoringScheduleCardProps {
  sessions: MentoringSessionItem[]
}

export function MentoringScheduleCard({ sessions }: MentoringScheduleCardProps) {
  return (
    <Card className="border-border bg-surface shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Schedule &amp; 1-on-1 Sessions</CardTitle>
        </div>
        <Badge tone="info" appearance="soft" size="sm">
          Today
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <Avatar name={session.studentName} size="md" className="shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground truncate">{session.studentName}</span>
                    <Badge tone="neutral" size="sm" className="shrink-0">
                      {session.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/90 font-medium line-clamp-1">{session.topic}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3 text-primary shrink-0" />
                    <span>{session.time} ({session.duration})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0 self-end sm:self-center">
                {session.status === 'upcoming' ? (
                  <Button variant="primary" size="sm" className="w-full sm:w-auto">
                    <Video className="size-3.5" />
                    Join Call
                  </Button>
                ) : session.status === 'in-progress' ? (
                  <Badge tone="success" appearance="solid">
                    Live Now
                  </Badge>
                ) : (
                  <Badge tone="neutral">Completed</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
