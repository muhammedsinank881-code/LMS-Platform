import { ArrowRight } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import type { AssignedStudent } from '../types'

interface MyStudentRowProps {
  student: AssignedStudent
  onSelectStudent: (student: AssignedStudent) => void
}

export function MyStudentRow({ student, onSelectStudent }: MyStudentRowProps) {
  const isPresent = student.statusToday === 'present'
  const isAbsent = student.statusToday === 'absent'

  const statusText =
    student.statusToday === 'present'
      ? 'Present today'
      : student.statusToday === 'absent'
      ? 'Absent today'
      : 'Late today'

  return (
    <tr className="hover:bg-muted/50 transition-colors border-b border-border last:border-b-0">
      {/* STUDENT */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-subtle text-primary font-semibold text-xs flex items-center justify-center shrink-0">
            {student.avatarInitials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">
              {student.name}
            </div>
            <div className="text-xs text-muted-foreground truncate sm:hidden">
              {student.rollNumber}
            </div>
          </div>
        </div>
      </td>

      {/* STUDENT ID */}
      <td className="py-3 px-4 text-xs font-mono font-semibold text-muted-foreground">
        {student.rollNumber}
      </td>

      {/* CLASS / BATCH */}
      <td className="py-3 px-4 text-xs font-medium text-foreground">
        {student.classBatch}
      </td>

      {/* EMAIL */}
      <td className="py-3 px-4 text-xs text-muted-foreground truncate max-w-[180px]">
        {student.email}
      </td>

      {/* ATTENDANCE */}
      <td className="py-3 px-4 text-xs font-semibold text-foreground">
        <span
          className={
            student.attendancePercentage >= 90
              ? 'text-success'
              : student.attendancePercentage >= 75
              ? 'text-foreground'
              : 'text-destructive'
          }
        >
          {student.attendancePercentage}%
        </span>
      </td>

      {/* STATUS */}
      <td className="py-3 px-4">
        <Badge
          tone={isPresent ? 'success' : isAbsent ? 'destructive' : 'warning'}
          size="sm"
          dot={isPresent}
        >
          {statusText}
        </Badge>
      </td>

      {/* ACTION */}
      <td className="py-3 px-4 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSelectStudent(student)}
          className="text-xs text-primary"
        >
          <span>View</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  )
}

