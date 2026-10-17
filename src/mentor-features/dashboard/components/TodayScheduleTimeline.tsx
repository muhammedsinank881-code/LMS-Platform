import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Code2, Globe, ListTodo, MapPin, Video } from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'
import type { ScheduleItem } from '../types'

interface TodayScheduleTimelineProps {
  schedule: ScheduleItem[]
}

export function TodayScheduleTimeline({ schedule }: TodayScheduleTimelineProps) {
  const navigate = useNavigate()

  const getIcon = (type: ScheduleItem['iconType']) => {
    switch (type) {
      case 'code':
        return { icon: Code2, bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' }
      case 'web':
        return { icon: Globe, bg: 'bg-primary-subtle text-primary' }
      case 'list':
        return { icon: ListTodo, bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' }
      default:
        return { icon: Code2, bg: 'bg-primary-subtle text-primary' }
    }
  }

  const handleNavigateClass = (item: ScheduleItem) => {
    if (item.status === 'ongoing') {
      // “Ongoing” -> open the active class/session view
      navigate(item.classId ? `/mentor/classes/${item.classId}` : `/mentor/schedule?classId=${item.id}`)
    } else {
      // “Upcoming” -> open scheduled class/session details
      navigate(`/mentor/schedule?classId=${item.id}`)
    }
  }

  return (
    <div className="space-y-2 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Today's Schedule
        </h2>
        <Link
          to="/mentor/schedule"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          View All <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        {schedule.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-lg bg-surface">
            <p className="text-xs font-semibold text-foreground">No sessions scheduled for today</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Check upcoming classes or create a new session in Schedule.
            </p>
          </div>
        ) : (
          schedule.map((item, idx) => {
            const iconConfig = getIcon(item.iconType)
            const Icon = iconConfig.icon
            const isOngoing = item.status === 'ongoing'

            return (
              <div key={item.id} className="relative flex items-center gap-1.5 sm:gap-2.5 group flex-1">
                {/* Timeline Indicator (Left) */}
                <div className="w-14 sm:w-20 md:w-24 shrink-0 text-right space-y-0.5">
                  <span className="block text-[11px] sm:text-xs font-bold text-foreground tracking-tight leading-tight">
                    {item.startTime}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-medium leading-tight">
                    {item.endTime}
                  </span>
                </div>

                {/* Timeline Connector Line & Dot */}
                <div className="relative flex flex-col items-center self-stretch justify-center shrink-0">
                  <div
                    className={`size-2 sm:size-2.5 rounded-full border-2 bg-surface transition-colors ${
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
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigateClass(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleNavigateClass(item)
                    }
                  }}
                  aria-label={`Open ${isOngoing ? 'active' : 'scheduled'} class: ${item.title}`}
                  className={`flex-1 border-border bg-surface shadow-2xs transition-all hover:border-primary/50 hover:shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none ${
                    isOngoing ? 'border-emerald-500/40 bg-emerald-500/5' : ''
                  }`}
                >
                  <CardContent className="p-2 sm:p-3 flex items-center justify-between gap-1.5 sm:gap-2.5 h-full">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${iconConfig.bg} shrink-0 transition-transform group-hover:scale-105`}>
                        <Icon className="size-3.5 sm:size-4" />
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate flex items-center gap-1 sm:gap-1.5">
                          <span className="font-medium text-foreground/80 truncate">{item.course}</span>
                          <span>•</span>
                          {item.location.toLowerCase().includes('online') && item.meetingLink ? (
                            <a
                              href={item.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline flex items-center gap-1 text-primary cursor-pointer font-medium truncate"
                              title="Join Meeting directly"
                            >
                              <Video className="size-3 text-primary shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </a>
                          ) : (
                            <span className="flex items-center gap-1 truncate">
                              {item.location.toLowerCase().includes('online') ? (
                                <Video className="size-3 text-primary shrink-0" />
                              ) : (
                                <MapPin className="size-3 text-muted-foreground shrink-0" />
                              )}
                              <span className="truncate">{item.location}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigateClass(item)
                        }}
                        aria-label={`View ${item.status} session`}
                        className="cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                      >
                        <Badge
                          tone={isOngoing ? 'success' : 'neutral'}
                          appearance={isOngoing ? 'solid' : 'soft'}
                          size="sm"
                          dot={isOngoing}
                          className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 h-4.5 sm:h-5 cursor-pointer"
                        >
                          {isOngoing ? 'Ongoing' : 'Upcoming'}
                        </Badge>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigateClass(item)
                        }}
                        aria-label={`View details for ${item.title}`}
                        className="p-0.5 rounded-md text-muted-foreground/70 group-hover:text-foreground transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <ChevronRight className="size-3 sm:size-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
