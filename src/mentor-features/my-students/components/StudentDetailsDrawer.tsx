import { Award, BookOpen, Calendar, Mail, Phone, UserCheck, X } from 'lucide-react'
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

  const statusBadgeClass = isPresent
    ? 'bg-emerald-50 text-[#059669] border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400'
    : isAbsent
    ? 'bg-rose-50 text-[#DC2626] border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400'
    : 'bg-amber-50 text-[#D97706] border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400'

  const statusText = isPresent
    ? 'Present today'
    : isAbsent
    ? 'Absent today'
    : 'Late today'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white dark:bg-card h-full shadow-2xl overflow-y-auto flex flex-col border-l border-[#E2E8F0] dark:border-border animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-[#E2E8F0] dark:border-border p-4 flex items-center justify-between z-10">
          <h3 className="text-base font-bold text-[#17324D] dark:text-foreground">
            Student Profile Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17324D] dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1 text-[#17324D] dark:text-foreground">
          {/* Main Info Box */}
          <div className="flex items-start gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-full bg-primary-subtle text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
              {student.avatarInitials}
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-bold text-foreground truncate">
                {student.name}
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                {student.rollNumber} • {student.classBatch}
              </p>
              <div className="pt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusBadgeClass}`}
                >
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-1">
              <div className="text-xs text-muted-foreground font-medium">
                Attendance Rate
              </div>
              <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {student.attendancePercentage}%
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-1">
              <div className="text-xs text-muted-foreground font-medium">
                GPA Score
              </div>
              <div className="text-xl font-bold tracking-tight text-primary">
                {student.academicSummary.gpa}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Contact Details
            </h4>
            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-foreground">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground pt-1 border-t border-border">
                <UserCheck className="size-4 shrink-0" />
                <span>Assigned Mentor: <strong className="text-foreground">{student.assignedMentorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Academic & Capstone Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Academic Progress
            </h4>
            <div className="bg-muted/50 border border-border rounded-md p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="size-4" /> Assignments
                </span>
                <span className="font-semibold text-foreground">
                  {student.academicSummary.assignmentsCompleted} / {student.academicSummary.totalAssignments} Completed
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Capstone Project</span>
                  <Award className="size-3.5 text-primary" />
                </div>
                <div className="font-semibold text-[#17324D] dark:text-foreground leading-snug">
                  {student.academicSummary.capstoneProject}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              Recent Attendance History
            </h4>
            <div className="bg-[#F8FAFC] dark:bg-slate-900/40 border border-[#E2E8F0] dark:border-border rounded-xl divide-y divide-[#E2E8F0] dark:divide-border overflow-hidden">
              {student.recentAttendance.map((rec, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#64748B] font-medium">
                    <Calendar className="size-3.5 text-[#94A3B8]" />
                    {rec.date}
                  </span>
                  <span
                    className={`font-bold capitalize ${
                      rec.status === 'present'
                        ? 'text-[#059669]'
                        : rec.status === 'absent'
                        ? 'text-[#DC2626]'
                        : 'text-[#D97706]'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-slate-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border text-[#17324D] dark:text-foreground font-semibold text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
