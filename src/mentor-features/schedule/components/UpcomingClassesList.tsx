import { useState } from 'react'
import {
  Calendar,
  Clock,
  Edit3,
  MapPin,
  MoreVertical,
  RefreshCw,
  Trash2,
  Video,
} from 'lucide-react'
import { Badge, Card, CardContent } from '@/components/ui'
import type { ScheduledClass } from '../types'

interface UpcomingClassesListProps {
  classes: ScheduledClass[]
  onSelectClass: (c: ScheduledClass) => void
  onEditClass: (c: ScheduledClass) => void
  onRescheduleClass: (c: ScheduledClass) => void
  onCancelClass: (c: ScheduledClass) => void
}

export function UpcomingClassesList({
  classes,
  onSelectClass,
  onEditClass,
  onRescheduleClass,
  onCancelClass,
}: UpcomingClassesListProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Upcoming Classes
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
        </span>
      </div>

      {classes.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground bg-surface border-border">
          No upcoming scheduled classes. Click "+ Schedule Class" to create one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {classes.map((cls) => {
            const isOngoing = cls.status === 'ongoing'
            const isOnline = cls.type === 'online'

            return (
              <Card
                key={cls.id}
                className="border-border bg-surface shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs group relative flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top: Header, Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${
                          isOnline
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                        }`}
                      >
                        {isOnline ? <Video className="size-5" /> : <MapPin className="size-5" />}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => onSelectClass(cls)}
                          className="text-left text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug truncate"
                        >
                          {cls.title}
                        </button>
                        <p className="text-xs text-muted-foreground font-semibold truncate">
                          {cls.courseClass} · <span className="text-foreground/80">{cls.module}</span>
                        </p>
                      </div>
                    </div>

                    <Badge
                      tone={isOngoing ? 'success' : 'primary'}
                      appearance="soft"
                      dot={isOngoing}
                      size="sm"
                      className="shrink-0"
                    >
                      {isOngoing ? 'Ongoing' : 'Upcoming'}
                    </Badge>
                  </div>

                  {/* Middle: Date, Time, Duration, Location */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-md border border-border/60">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span>{cls.date === '2026-10-08' ? 'Today' : cls.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-foreground font-semibold">
                      <Clock className="size-3.5 text-primary shrink-0" />
                      <span>{cls.startTime} - {cls.endTime}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-semibold text-foreground">Location:</span>
                      <span className="truncate">{isOnline ? 'Online Class' : cls.room}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-semibold text-foreground">Duration:</span>
                      <span>{cls.duration}</span>
                    </div>
                  </div>

                  {/* Footer: Actions */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectClass(cls)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      View Details
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId((prev) => (prev === cls.id ? null : cls.id))}
                        className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Actions"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {activeMenuId === cls.id ? (
                        <div
                          onMouseLeave={() => setActiveMenuId(null)}
                          className="absolute right-0 bottom-full mb-1 w-44 bg-surface border border-border rounded-md shadow-lg py-1 z-30 space-y-0.5 text-xs font-semibold text-foreground"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onEditClass(cls)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
                          >
                            <Edit3 className="size-3.5 text-primary" />
                            <span>Edit Class</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onRescheduleClass(cls)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
                          >
                            <RefreshCw className="size-3.5 text-info" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onCancelClass(cls)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-destructive/10 text-destructive flex items-center gap-2 border-t border-border/50"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Cancel Class</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
