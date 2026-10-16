import { AttendanceOverview } from './AttendanceOverview'

interface AttendanceSummaryCardProps {
  totalStudents: number
  presentCount: number
  absentCount: number
  lateCount: number
  attendanceRate: number
  partialCount?: number
  pendingCount?: number
  onStatusClick?: (status: string) => void
}

export function AttendanceSummaryCard({
  totalStudents,
  presentCount,
  absentCount,
  lateCount,
  partialCount = 0,
  pendingCount = 0,
  onStatusClick,
}: AttendanceSummaryCardProps) {
  return (
    <AttendanceOverview
      totalStudents={totalStudents}
      presentCount={presentCount}
      absentCount={absentCount}
      lateCount={lateCount}
      partialCount={partialCount}
      pendingCount={pendingCount}
      onStatusClick={onStatusClick}
    />
  )
}
