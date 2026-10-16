import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

interface AttendanceAndPendingTasksProps {
  attendanceRate: number
  pendingAssignmentsCount?: number
  pendingAttendanceCount?: number
}

export function AttendanceAndPendingTasks({
  attendanceRate,
  pendingAssignmentsCount = 2,
  pendingAttendanceCount = 1,
}: AttendanceAndPendingTasksProps) {
  const navigate = useNavigate()
  const totalPending = pendingAssignmentsCount + pendingAttendanceCount

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 h-full">
      {/* Left: Attendance Rate Card */}
      <Card
        onClick={() => navigate('/mentor/attendance')}
        className="bg-surface border-border shadow-2xs rounded-2xl cursor-pointer hover:border-emerald-500/40 hover:shadow-xs transition-all select-none group flex flex-col justify-between"
      >
        <CardContent className="p-3 sm:p-3.5 space-y-2 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
              Attendance Rate
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-3 w-3" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {attendanceRate}%
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground leading-tight truncate">
              Overall Attendance
            </p>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
            <ArrowUpRight className="h-3 w-3 shrink-0" />
            <span className="truncate">+5% from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Right: Pending Tasks Card */}
      <Card
        onClick={() => navigate('/mentor/assignments')}
        className="bg-surface border-border shadow-2xs rounded-2xl cursor-pointer hover:border-amber-500/40 hover:shadow-xs transition-all select-none group flex flex-col justify-between"
      >
        <CardContent className="p-3 sm:p-3.5 space-y-2 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
              Pending Tasks
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="h-3 w-3" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {totalPending}
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground leading-tight truncate">
              {pendingAssignmentsCount} to review · {pendingAttendanceCount} to update
            </p>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 pt-0.5">
            <span className="truncate">Requires Action →</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
