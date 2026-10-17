import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, Video } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import type { ScheduleItem } from '../types'

interface NextClassCardProps {
  nextClass?: ScheduleItem
}

export function NextClassCard({ nextClass }: NextClassCardProps) {
  const navigate = useNavigate()

  if (!nextClass) return null

  const handleJoinClass = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (nextClass.meetingLink) {
      window.open(nextClass.meetingLink, '_blank', 'noreferrer')
    } else {
      navigate(
        nextClass.classId
          ? `/mentor/classes/${nextClass.classId}`
          : `/mentor/schedule?classId=${nextClass.id}`,
      )
    }
  }

  const isOngoing = nextClass.status === 'ongoing'

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
            Next Class
          </h2>
          {isOngoing && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
        <Link
          to="/mentor/timetable"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View Timetable</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Responsive Next Class Card */}
      <Card
        onClick={() =>
          navigate(
            nextClass.classId
              ? `/mentor/classes/${nextClass.classId}`
              : `/mentor/schedule?classId=${nextClass.id}`,
          )
        }
        className={`bg-surface border-border shadow-2xs rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer select-none group ${
          isOngoing ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : ''
        }`}
      >
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Left: Icon + Class Info */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                <Video className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {nextClass.title}
                  </h3>
                  <Badge
                    tone={isOngoing ? 'success' : 'primary'}
                    size="sm"
                    className="text-[10px] font-bold"
                  >
                    {isOngoing ? '● Live Now' : 'Upcoming'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="font-semibold text-foreground/80">
                    {nextClass.course}
                  </span>
                  <span>•</span>
                  <span>{nextClass.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-foreground/90 font-medium">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      Today, {nextClass.startTime} - {nextClass.endTime}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Join Button */}
            <div className="shrink-0 flex items-center gap-2 sm:self-center">
              <Button
                variant={isOngoing ? 'primary' : 'outline'}
                size="sm"
                onClick={handleJoinClass}
                className="w-full sm:w-auto h-9 px-4 text-xs font-bold shadow-xs cursor-pointer"
              >
                <Video className="h-3.5 w-3.5 mr-1.5" />
                <span>Join Class</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
