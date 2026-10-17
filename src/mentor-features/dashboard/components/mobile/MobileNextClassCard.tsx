import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Video, Clock } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import type { ScheduleItem } from '../../types'

interface MobileNextClassCardProps {
  nextClass?: ScheduleItem
}

export function MobileNextClassCard({ nextClass }: MobileNextClassCardProps) {
  const navigate = useNavigate()

  if (!nextClass) return null

  const handleJoinClass = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (nextClass.meetingLink) {
      window.open(nextClass.meetingLink, '_blank')
    } else if (nextClass.classId) {
      navigate(`/mentor/classes/${nextClass.classId}`)
    } else {
      navigate('/mentor/schedule')
    }
  }

  const isOngoing = nextClass.status === 'ongoing'

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Next Class
        </h2>
        <Link
          to="/mentor/timetable"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View Timetable</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Card */}
      <Card
        onClick={() =>
          nextClass.classId
            ? navigate(`/mentor/classes/${nextClass.classId}`)
            : navigate('/mentor/schedule')
        }
        className="bg-surface border-border shadow-sm rounded-2xl cursor-pointer hover:border-primary/40 transition-all select-none"
      >
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Icon in green/blue container */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                <Video className="h-5 w-5" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {nextClass.title}
                  </h3>
                  {isOngoing && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Now
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate font-medium">
                  {nextClass.course} · {nextClass.location}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground/80 pt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>Today, {nextClass.startTime} - {nextClass.endTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action: Join Class Button */}
          <div className="pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleJoinClass}
              className="w-full h-8 sm:h-9 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Join Class</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
