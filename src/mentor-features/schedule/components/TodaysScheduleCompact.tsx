import { ChevronRight, MapPin, Video } from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'
import type { ScheduledClass } from '../types'

interface TodaysScheduleCompactProps {
  classes: ScheduledClass[]
  onSelectClass: (c: ScheduledClass) => void
}

export function TodaysScheduleCompact({ classes, onSelectClass }: TodaysScheduleCompactProps) {
  if (classes.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Today's Classes (Oct 8, 2026)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {classes.map((cls) => {
          const isOngoing = cls.status === 'ongoing'
          const isOnline = cls.type === 'online'

          return (
            <Card
              key={cls.id}
              onClick={() => onSelectClass(cls)}
              className={`border-border bg-surface shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs cursor-pointer ${
                isOngoing ? 'border-emerald-500/50 bg-emerald-500/5' : ''
              }`}
            >
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground font-mono">
                    {cls.startTime} - {cls.endTime}
                  </span>

                  <Badge
                    tone={isOngoing ? 'success' : cls.status === 'completed' ? 'neutral' : 'info'}
                    appearance={isOngoing ? 'solid' : 'soft'}
                    size="sm"
                    dot={isOngoing}
                    className="text-[10px] h-5"
                  >
                    {isOngoing ? 'Ongoing' : cls.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{cls.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{cls.courseClass}</p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    {isOnline ? (
                      <>
                        <Video className="size-3 text-primary" /> Online
                      </>
                    ) : (
                      <>
                        <MapPin className="size-3 text-muted-foreground" /> {cls.room}
                      </>
                    )}
                  </span>

                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
