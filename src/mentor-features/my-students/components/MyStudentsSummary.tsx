import { GraduationCap, Layers, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MyStudentsSummaryProps {
  totalAssigned: number
  classesCount: number
  avgAttendance: number
}

export function MyStudentsSummary({
  totalAssigned,
  classesCount,
  avgAttendance,
}: MyStudentsSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge tone="primary" size="md" className="gap-1.5 font-semibold">
        <GraduationCap className="h-3.5 w-3.5" />
        <span>{totalAssigned} Assigned Students</span>
      </Badge>

      <Badge tone="neutral" size="md" className="gap-1.5 font-semibold">
        <Layers className="h-3.5 w-3.5" />
        <span>{classesCount} Classes</span>
      </Badge>

      <Badge tone="success" size="md" className="gap-1.5 font-semibold">
        <UserCheck className="h-3.5 w-3.5" />
        <span>{avgAttendance}% Attendance</span>
      </Badge>
    </div>
  )
}

