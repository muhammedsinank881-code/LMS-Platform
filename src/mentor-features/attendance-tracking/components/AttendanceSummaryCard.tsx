import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from './StatCard'

interface AttendanceSummaryCardProps {
  totalStudents: number
  presentCount: number
  absentCount: number
  lateCount: number
  attendanceRate: number
}

export function AttendanceSummaryCard({
  totalStudents,
  presentCount,
  absentCount,
  lateCount,
  attendanceRate,
}: AttendanceSummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* Total & Progress Bar Card */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {totalStudents} Students
          </h2>
          <Badge tone="success" size="md">
            {attendanceRate}% Attendance
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Progress</span>
            <span className="font-semibold text-success">
              {attendanceRate}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </Card>

      {/* 3 Individual Stat Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Present"
          value={presentCount}
          tone="success"
        />
        <StatCard
          label="Absent"
          value={absentCount}
          tone="destructive"
        />
        <StatCard
          label="Late"
          value={lateCount}
          tone="warning"
        />
      </div>
    </div>
  )
}

