import { Award, BookOpen, Calendar, Mail, Phone, UserCheck, X } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import type { AssignedStudent } from '../types'

interface StudentDetailsDrawerProps {
  student: AssignedStudent | null
  onClose: () => void
}

export function StudentDetailsDrawer({
  student,
  onClose,
}: StudentDetailsDrawerProps) {
  if (!student) return null

  const isPresent = student.statusToday === 'present'
  const isAbsent = student.statusToday === 'absent'

  const statusText = isPresent
    ? 'Present today'
    : isAbsent
    ? 'Absent today'
    : 'Late today'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-surface h-full shadow-modal overflow-y-auto flex flex-col border-l border-border animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <h3 className="text-base font-semibold text-foreground">
            Student Profile Details
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1 text-foreground">
          {/* Main Info Box */}
          <div className="flex items-start gap-4 pb-4 border-b border-border">
            <div className="h-14 w-14 rounded-full bg-primary-subtle text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
              {student.avatarInitials}
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-semibold text-foreground truncate">
                {student.name}
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                {student.rollNumber} • {student.classBatch}
              </p>
              <div className="pt-1">
                <Badge
                  tone={isPresent ? 'success' : isAbsent ? 'destructive' : 'warning'}
                  size="sm"
                  dot={isPresent}
                >
                  {statusText}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-1">
              <div className="text-xs text-muted-foreground font-medium">
                Attendance Rate
              </div>
              <div className="text-xl font-semibold tracking-tight text-success">
                {student.attendancePercentage}%
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-1">
              <div className="text-xs text-muted-foreground font-medium">
                GPA Score
              </div>
              <div className="text-xl font-semibold tracking-tight text-primary">
                {student.academicSummary.gpa}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Details
            </h4>
            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground pt-1 border-t border-border">
                <UserCheck className="h-4 w-4 shrink-0" />
                <span>Assigned Mentor: <strong className="text-foreground">{student.assignedMentorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Academic & Capstone Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Academic Progress
            </h4>
            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> Assignments
                </span>
                <span className="font-semibold text-foreground">
                  {student.academicSummary.assignmentsCompleted} / {student.academicSummary.totalAssignments} Completed
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Capstone Project</span>
                  <Award className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="font-semibold text-foreground leading-snug">
                  {student.academicSummary.capstoneProject}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Attendance History
            </h4>
            <div className="bg-muted/30 border border-border rounded-md divide-y divide-border overflow-hidden">
              {student.recentAttendance.map((rec, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {rec.date}
                  </span>
                  <Badge
                    tone={rec.status === 'present' ? 'success' : rec.status === 'absent' ? 'destructive' : 'warning'}
                    size="sm"
                  >
                    {rec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

