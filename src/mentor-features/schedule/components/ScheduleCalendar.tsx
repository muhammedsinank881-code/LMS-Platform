import { ChevronLeft, ChevronRight, MapPin, Video } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CalendarViewMode, ScheduledClass } from '../types'

interface ScheduleCalendarProps {
  classes: ScheduledClass[]
  viewMode: CalendarViewMode
  onViewModeChange: (mode: CalendarViewMode) => void
  currentDate?: string
  onDateChange: (date: string) => void
  onSelectClass: (c: ScheduledClass) => void
}

export function ScheduleCalendar({
  classes,
  viewMode,
  onViewModeChange,
  onDateChange,
  onSelectClass,
}: ScheduleCalendarProps) {
  // Calendar days array for Week view (Oct 5, 2026 - Oct 11, 2026)
  const weekDays = [
    { dayName: 'Mon', dateNum: '05', fullDate: '2026-10-05' },
    { dayName: 'Tue', dateNum: '06', fullDate: '2026-10-06' },
    { dayName: 'Wed', dateNum: '07', fullDate: '2026-10-07' },
    { dayName: 'Thu', dateNum: '08', fullDate: '2026-10-08', isToday: true },
    { dayName: 'Fri', dateNum: '09', fullDate: '2026-10-09' },
    { dayName: 'Sat', dateNum: '10', fullDate: '2026-10-10' },
    { dayName: 'Sun', dateNum: '11', fullDate: '2026-10-11' },
  ]

  const getStatusBadgeTone = (status: ScheduledClass['status']) => {
    switch (status) {
      case 'ongoing':
        return 'success'
      case 'scheduled':
        return 'primary'
      case 'completed':
        return 'neutral'
      case 'cancelled':
        return 'destructive'
    }
  }

  const getEventBgStyle = (status: ScheduledClass['status']) => {
    switch (status) {
      case 'ongoing':
        return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20'
      case 'scheduled':
        return 'bg-primary-subtle border-primary/30 text-primary'
      case 'completed':
        return 'bg-muted/70 border-border text-muted-foreground'
      case 'cancelled':
        return 'bg-destructive/10 border-destructive/20 text-destructive/80 line-through'
    }
  }

  return (
    <Card className="p-4 space-y-4 border-border bg-surface shadow-2xs">
      {/* Calendar Header Navigation & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        {/* Previous / Next Month/Week Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onDateChange('2026-10-08')}
            className="p-1.5 rounded-md border border-border bg-surface hover:bg-muted text-foreground transition-colors cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </button>

          <h3 className="text-base font-bold text-foreground tracking-tight">
            October 2026
          </h3>

          <button
            type="button"
            onClick={() => onDateChange('2026-10-08')}
            className="p-1.5 rounded-md border border-border bg-surface hover:bg-muted text-foreground transition-colors cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Month / Week / Day View Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={(val) => onViewModeChange(val as CalendarViewMode)}
          variant="pill"
        >
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* WEEK VIEW GRID */}
      {viewMode === 'week' ? (
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[700px] grid grid-cols-7 divide-x divide-border border border-border rounded-lg overflow-hidden bg-surface">
            {weekDays.map((wd) => {
              const dayClasses = classes.filter((c) => c.date === wd.fullDate)

              return (
                <div key={wd.fullDate} className="min-h-[380px] flex flex-col">
                  {/* Day Header Column */}
                  <div
                    className={`p-2.5 text-center border-b border-border font-semibold select-none ${
                      wd.isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider opacity-90">{wd.dayName}</div>
                    <div className="text-base font-bold tracking-tight">{wd.dateNum}</div>
                  </div>

                  {/* Day Events Container */}
                  <div className="p-1.5 space-y-2 flex-1 bg-surface">
                    {dayClasses.length === 0 ? (
                      <div className="h-full min-h-[120px] flex items-center justify-center text-[11px] text-muted-foreground/60 italic">
                        No classes
                      </div>
                    ) : (
                      dayClasses.map((cls) => (
                        <div
                          key={cls.id}
                          onClick={() => onSelectClass(cls)}
                          className={`p-2 rounded-md border text-xs cursor-pointer transition-all hover:scale-[1.02] space-y-1 ${getEventBgStyle(
                            cls.status,
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                            <span>{cls.startTime}</span>
                            <Badge
                              tone={getStatusBadgeTone(cls.status)}
                              appearance="soft"
                              size="sm"
                              className="text-[9px] px-1 py-0 h-4"
                            >
                              {cls.status}
                            </Badge>
                          </div>

                          <h5 className="font-bold leading-tight truncate">{cls.title}</h5>

                          <p className="text-[10px] opacity-90 truncate">{cls.courseClass}</p>

                          <div className="flex items-center gap-1 text-[10px] opacity-80 pt-0.5">
                            {cls.type === 'online' ? (
                              <>
                                <Video className="size-3 shrink-0" /> Online
                              </>
                            ) : (
                              <>
                                <MapPin className="size-3 shrink-0" /> {cls.room}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-7 gap-1 border border-border rounded-lg p-2 bg-muted/20">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-bold text-muted-foreground uppercase">
              {d}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => {
            const dateNum = (i + 1).toString().padStart(2, '0')
            const dateStr = `2026-10-${dateNum}`
            const dateClasses = classes.filter((c) => c.date === dateStr)
            const isToday = dateStr === '2026-10-08'

            return (
              <div
                key={dateStr}
                className={`min-h-[70px] p-1.5 rounded-md border bg-surface transition-colors flex flex-col justify-between ${
                  isToday ? 'border-primary ring-1 ring-primary/30' : 'border-border/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                  <span className={isToday ? 'text-primary font-bold' : ''}>{dateNum}</span>
                  {dateClasses.length > 0 ? (
                    <Badge tone="primary" size="sm" className="text-[9px] h-4 px-1">
                      {dateClasses.length}
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-0.5">
                  {dateClasses.slice(0, 2).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectClass(c)}
                      className="text-[10px] font-semibold text-primary truncate bg-primary-subtle px-1 py-0.5 rounded cursor-pointer"
                    >
                      {c.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {/* DAY VIEW GRID */}
      {viewMode === 'day' ? (
        <div className="space-y-2 border border-border rounded-lg p-4 bg-surface">
          <div className="text-sm font-bold text-foreground border-b border-border pb-2">
            Schedule for Thursday, Oct 8, 2026
          </div>
          <div className="space-y-2">
            {classes
              .filter((c) => c.date === '2026-10-08')
              .map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => onSelectClass(cls)}
                  className={`p-3 rounded-md border flex items-center justify-between gap-3 cursor-pointer ${getEventBgStyle(
                    cls.status,
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs font-bold text-foreground">
                      {cls.startTime} - {cls.endTime}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{cls.title}</h4>
                      <p className="text-xs opacity-90">{cls.courseClass} · {cls.module}</p>
                    </div>
                  </div>
                  <Badge tone={getStatusBadgeTone(cls.status)} size="sm">
                    {cls.status}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
