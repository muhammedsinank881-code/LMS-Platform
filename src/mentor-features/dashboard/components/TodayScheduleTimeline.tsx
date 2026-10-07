import { ArrowRight, ChevronRight, Code2, Globe, ListTodo, MapPin, Video } from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'
import type { ScheduleItem } from '../types'

interface TodayScheduleTimelineProps {
  schedule: ScheduleItem[]
}

export function TodayScheduleTimeline({ schedule }: TodayScheduleTimelineProps) {
  const getIcon = (type: ScheduleItem['iconType']) => {
    switch (type) {
      case 'code':
        return { icon: Code2, bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' }
      case 'web':
        return { icon: Globe, bg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' }
      case 'list':
        return { icon: ListTodo, bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' }
    }
  }

  return (
    <div className="space-y-2 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">Today's Schedule</h2>
        <button
          type="button"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          View All <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        {schedule.map((item, idx) => {
          const iconConfig = getIcon(item.iconType)
          const Icon = iconConfig.icon
          const isOngoing = item.status === 'ongoing'

          return (
            <div key={item.id} className="relative flex items-center gap-2.5  group flex-1">
              {/* Timeline Indicator (Left) */}
              <div className="w-20 sm:w-24 shrink-0 text-right space-y-0.5">
                <span className="block text-xs font-bold text-foreground tracking-tight">
                  {item.startTime}
                </span>
                <span className="block text-[10px] text-muted-foreground font-medium">{item.endTime}</span>
              </div>

              {/* Timeline Connector Line & Dot */}
              <div className="relative flex flex-col items-center self-stretch justify-center shrink-0">
                <div
                  className={`size-2.5 rounded-full border-2 bg-surface transition-colors ${
                    isOngoing
                      ? 'border-emerald-500 bg-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-border group-hover:border-primary'
                  }`}
                />
                {idx < schedule.length - 1 ? (
                  <div className="w-0.5 flex-1 bg-border/60 my-0.5 group-hover:bg-border transition-colors" />
                ) : null}
              </div>

              {/* Class Card */}
              <Card
                className={`flex-1 border-border bg-surface shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs ${
                  isOngoing ? 'border-emerald-500/40 bg-emerald-500/5' : ''
                }`}
              >
                <CardContent className="p-3 flex items-center justify-between gap-2.5 h-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg ${iconConfig.bg} shrink-0`}>
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                        <span className="font-medium text-foreground/80">{item.course}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {item.location.toLowerCase().includes('online') ? (
                            <Video className="size-3 text-primary" />
                          ) : (
                            <MapPin className="size-3 text-muted-foreground" />
                          )}
                          {item.location}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      tone={isOngoing ? 'success' : 'neutral'}
                      appearance={isOngoing ? 'solid' : 'soft'}
                      size="sm"
                      dot={isOngoing}
                      className="text-[10px] px-2 h-5"
                    >
                      {isOngoing ? 'Ongoing' : 'Upcoming'}
                    </Badge>
                    <ChevronRight className="size-3.5 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
