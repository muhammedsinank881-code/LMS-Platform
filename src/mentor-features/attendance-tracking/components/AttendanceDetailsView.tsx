import { useState } from 'react'
import {
  ArrowLeft,
  BarChart2,
  Video,
  LogIn,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type {
  AttendanceStatus,
  ClassCohortOption,
  SessionInfo,
  StudentAttendanceRecord,
} from '../types'
import { TeacherOverrideModal } from './TeacherOverrideModal'

interface AttendanceDetailsViewProps {
  student: StudentAttendanceRecord
  session: SessionInfo
  currentClass: ClassCohortOption
  onBack: () => void
  onUpdateStatus: (id: string, status: AttendanceStatus, reason?: string) => void
}

export function AttendanceDetailsView({
  student,
  session,
  currentClass,
  onBack,
  onUpdateStatus,
}: AttendanceDetailsViewProps) {
  const [isOverrideOpen, setIsOverrideOpen] = useState(false)

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return {
          label: 'Present',
          className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        }
      case 'late':
        return {
          label: 'Late',
          className:
            'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        }
      case 'partial':
        return {
          label: 'Partial',
          className:
            'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
        }
      case 'absent':
        return {
          label: 'Absent',
          className:
            'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        }
      case 'pending':
      default:
        return {
          label: 'Pending',
          className:
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        }
    }
  }

  const badgeInfo = getStatusBadge(student.status)

  // Dynamic calculation rule text if not provided on student
  const calculationRule =
    student.calculationRuleText ||
    (student.status === 'present'
      ? `Present — ${student.durationMinutes ?? 55} of ${
          student.totalMinutes ?? 60
        } minutes verified; minimum required: 45 minutes.`
      : student.status === 'late'
      ? `Late — ${student.durationMinutes ?? 48} of ${
          student.totalMinutes ?? 60
        } minutes verified; joined after grace threshold.`
      : student.status === 'partial'
      ? `Partial — ${student.durationMinutes ?? 30} of ${
          student.totalMinutes ?? 60
        } minutes verified; minimum required: 45 minutes.`
      : 'Absent — No telemetry event or session attendance recorded.')

  const telemetryEvents = student.telemetryEvents || [
    {
      id: 'default-1',
      type: 'join' as const,
      label: 'Joined Live Session',
      time: student.firstEntry || '10:00 AM',
      description: 'Joined live session',
    },
    {
      id: 'default-2',
      type: 'leave' as const,
      label: 'Left Live Session',
      time: student.lastExit || '10:55 AM',
      description: 'Session ended',
    },
  ]

  const handleOverrideSave = (
    studentId: string,
    newStatus: AttendanceStatus,
    reason: string,
  ) => {
    onUpdateStatus(studentId, newStatus, reason)
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-foreground pb-8 animate-in fade-in duration-200">
      {/* 1. Header with Back Arrow */}
      <div className="flex items-center gap-3 py-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to attendance list"
          className="p-1.5 -ml-1.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Attendance Details
        </h1>
      </div>

      {/* 2. Student Information Card (Screenshot 2 Card 1) */}
      <Card className="p-4 sm:p-5 bg-surface border-border shadow-sm rounded-2xl">
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-base flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
            {student.avatarInitials ||
              student.name.substring(0, 2).toUpperCase()}
          </div>

          {/* Student Info */}
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
              {student.name}
            </h2>
            <p className="text-xs text-muted-foreground truncate font-medium">
              {student.rollNumber} · {currentClass.name}
            </p>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate pt-0.5">
              {session.lecture} ({session.timeRange})
            </p>

            <div className="pt-2">
              <span
                className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${badgeInfo.className}`}
              >
                {badgeInfo.label}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Calculation Rule & Transparency (Screenshot 2 Card 2) */}
      <Card className="p-4 sm:p-5 bg-surface border-border shadow-sm rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground">
          <BarChart2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Calculation Rule & Transparency</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/70 dark:bg-emerald-950/30 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm font-semibold leading-relaxed">
          {calculationRule}
        </div>
      </Card>

      {/* 4. Evidence Breakdown (Screenshot 2 Card 3) */}
      <Card className="p-4 sm:p-5 bg-surface border-border shadow-sm rounded-2xl space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-foreground">
          Evidence Breakdown
        </h3>

        <div className="divide-y divide-border/60 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2 sm:py-2.5">
            <span className="text-muted-foreground font-medium">
              Session Subject
            </span>
            <span className="font-bold text-foreground">{session.subject}</span>
          </div>

          <div className="flex items-center justify-between py-2 sm:py-2.5">
            <span className="text-muted-foreground font-medium">
              Evidence Source
            </span>
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-foreground" />
              <span>{student.evidenceSource || session.evidenceSource}</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-2 sm:py-2.5">
            <span className="text-muted-foreground font-medium">
              Verification State
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {student.verificationState || session.verificationState}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 sm:py-2.5">
            <span className="text-muted-foreground font-medium">
              Verified Duration
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {student.durationMinutes ?? 55} min of{' '}
              {student.totalMinutes ?? 60} min
            </span>
          </div>

          <div className="flex items-center justify-between py-2 sm:py-2.5">
            <span className="text-muted-foreground font-medium">
              First Entry / Join
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {student.firstEntry || '10:00 AM'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 sm:py-2.5">
            <span className="text-muted-foreground font-medium">
              Last Exit / Leave
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {student.lastExit || '10:55 AM'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 sm:py-2.5">
            <span className="text-muted-foreground font-medium">
              Last Telemetry Update
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {student.lastTelemetry || '10:55 AM'}
            </span>
          </div>
        </div>
      </Card>

      {/* 5. Activity Telemetry Timeline (Screenshot 2 Card 4) */}
      <Card className="p-4 sm:p-5 bg-surface border-border shadow-sm rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            Activity Telemetry Timeline
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">
            {telemetryEvents.length} Events
          </span>
        </div>

        {telemetryEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No telemetry events recorded for this session.
          </p>
        ) : (
          <div className="space-y-3">
            {telemetryEvents.map((evt) => {
              const isJoin = evt.type === 'join'
              return (
                <div
                  key={evt.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                      {isJoin ? (
                        <LogIn className="h-4 w-4" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                        {evt.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums shrink-0">
                    {evt.time}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* 6. Bottom Button: Adjust Record (Teacher Override) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsOverrideOpen(true)}
          className="w-full py-3 px-4 rounded-2xl border-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Adjust Record (Teacher Override)</span>
        </button>
      </div>

      {/* Teacher Override Dialog */}
      <TeacherOverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        student={student}
        onSaveOverride={handleOverrideSave}
      />
    </div>
  )
}
