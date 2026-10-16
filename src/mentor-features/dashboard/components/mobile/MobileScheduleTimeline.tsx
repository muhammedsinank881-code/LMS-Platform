import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import type { ScheduleItem } from '../../types'

interface MobileScheduleTimelineProps {
  schedule: ScheduleItem[]
}

export function MobileScheduleTimeline({ schedule }: MobileScheduleTimelineProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Today's Schedule
        </h2>
        <Link
          to="/mentor/schedule"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Timeline items */}
      {schedule.length === 0 ? (
        <Card className="p-4 text-center bg-surface border-border text-xs text-muted-foreground rounded-xl">
          No classes scheduled for today.
        </Card>
      ) : (
        <div className="space-y-3 pt-1">
          {schedule.map((item, idx) => {
            const isLast = idx === schedule.length - 1
            const isOngoing = item.status === 'ongoing'

            return (
              <div key={item.id} className="flex gap-3">
                {/* 1. Time Column */}
                <div className="w-14 shrink-0 text-right space-y-0.5 pt-1">
                  <div className="text-[11px] font-bold text-foreground leading-tight">
                    {item.startTime}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.endTime}
                  </div>
                </div>

                {/* 2. Timeline Line & Node */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`h-3 w-3 rounded-full mt-1.5 border-2 ${
                      isOngoing
                        ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-800 animate-pulse'
                        : 'bg-primary border-primary/20'
                    }`}
                  />
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-border/80 my-1 min-h-[36px]" />
                  )}
                </div>

                {/* 3. Class Card */}
                <div className="flex-1 min-w-0 pb-1">
                  <Card
                    onClick={() =>
                      navigate(
                        item.classId
                          ? `/mentor/classes/${item.classId}`
                          : `/mentor/schedule?classId=${item.id}`,
                      )
                    }
                    className="bg-surface border-border shadow-2xs rounded-xl hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer select-none group"
                  >
                    <CardContent className="p-3 flex items-center justify-between gap-2.5">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.course} · {item.location}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isOngoing ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Ongoing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-primary hover:underline">
                            <span>Join</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
