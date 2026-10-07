import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui'
import { MOCK_STUDENT_DATA } from '../../mock/student-data'

export function AttendanceAnalyticsCard() {
  const { attendance } = MOCK_STUDENT_DATA

  return (
    <Card className="p-5">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Attendance & Learning Hours Analytics</h2>
          <p className="text-xs text-muted-foreground">
            Weekly check-in, check-out details and total daily platform engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="rounded-lg bg-surface-hover px-3 py-1.5 border border-border">
            <span className="text-muted-foreground">Total Classes: </span>
            <span className="font-semibold text-foreground">{attendance.totalClasses}</span>
          </div>
          <div className="rounded-lg bg-rose-500/10 px-3 py-1.5 border border-rose-500/20 text-rose-600 dark:text-rose-400">
            <span>Absents: </span>
            <span className="font-semibold">{attendance.absents}</span>
          </div>
          <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <span>Attendance Score: </span>
            <span className="font-semibold">{attendance.percentage}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Hours Spent This Week</span>
            <span>Check-in & Check-out details on hover</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} unit="h" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md text-xs space-y-1">
                          <p className="font-semibold">{data.day}</p>
                          <p className="text-muted-foreground">Hours Spent: <span className="font-medium text-foreground">{data.hours} hrs</span></p>
                          <p className="text-muted-foreground">Check-in: <span className="font-medium text-foreground">{data.checkIn}</span></p>
                          <p className="text-muted-foreground">Check-out: <span className="font-medium text-foreground">{data.checkOut}</span></p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today Check-in / Out Summary */}
        <div className="flex flex-col justify-center rounded-lg border border-border bg-surface-hover p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Session</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Check-in Time</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{attendance.todayCheckIn}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Check-out Time</span>
              <span className="font-semibold text-rose-500">{attendance.todayCheckOut}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-medium text-foreground">Total Active Time</span>
              <span className="font-bold text-primary">{attendance.todayHours} Hours</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
