import { ChevronRight } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import type { AssignedStudent } from '../types'

interface MyStudentCardProps {
  student: AssignedStudent
  onSelectStudent: (student: AssignedStudent) => void
}

export function MyStudentCard({ student, onSelectStudent }: MyStudentCardProps) {
  const isPresent = student.statusToday === 'present'
  const isAbsent = student.statusToday === 'absent'

  const statusText = isPresent
    ? 'Present today'
    : isAbsent
    ? 'Absent today'
    : 'Late today'

  return (
    <Card
      variant="interactive"
      onClick={() => onSelectStudent(student)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelectStudent(student)
        }
      }}
      className="p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer min-h-[64px] sm:min-h-[72px]"
    >
      <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-subtle text-primary font-semibold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
          {student.avatarInitials}
        </div>
        <div className="min-w-0 space-y-0.5 sm:space-y-1">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate leading-tight">
            {student.name}
          </h4>
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
            <span>{student.rollNumber}</span>
            <span className="mx-1">·</span>
            <span>{student.classBatch}</span>
          </p>
          <div className="pt-0.5">
            <Badge
              tone={isPresent ? 'success' : isAbsent ? 'destructive' : 'warning'}
              size="sm"
              dot={isPresent}
              className="text-[10px] sm:text-xs"
            >
              {statusText}
            </Badge>
          </div>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
    </Card>
  )
}

