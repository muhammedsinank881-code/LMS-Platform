import { useState, useRef, useEffect } from 'react'
import { Video, ChevronRight, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { AttendanceStatus, StudentAttendanceRecord } from '../types'

interface AttendanceStudentCardProps {
  student: StudentAttendanceRecord
  onClick: (student: StudentAttendanceRecord) => void
  onStatusChange: (id: string, status: AttendanceStatus) => void
}

export function AttendanceStudentCard({
  student,
  onClick,
  onStatusChange,
}: AttendanceStudentCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const durationDisplay =
    student.durationMinutes !== undefined && student.totalMinutes !== undefined
      ? `${student.durationMinutes}m / ${student.totalMinutes}m`
      : student.status === 'absent'
      ? '0m / 60m'
      : null

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking menu, don't trigger card navigation
    if (menuRef.current && menuRef.current.contains(e.target as Node)) {
      return
    }
    onClick(student)
  }

  const handleStatusBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowStatusMenu((prev) => !prev)
  }

  const handleSelectStatus = (
    newStatus: AttendanceStatus,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation()
    onStatusChange(student.id, newStatus)
    setShowStatusMenu(false)
  }

  const statusOptions: AttendanceStatus[] = [
    'present',
    'late',
    'partial',
    'absent',
  ]

  return (
    <Card
      onClick={handleCardClick}
      className="p-3 sm:p-4 bg-surface border-border shadow-sm rounded-2xl hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer select-none group"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar + Student info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
            {student.avatarInitials ||
              student.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {student.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{student.rollNumber}</span>
              {student.hasLiveVideo && (
                <Video className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Badge + Duration + Chevron */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="flex flex-col items-end space-y-1 relative"
            ref={menuRef}
          >
            {/* Interactive Status Badge Pill */}
            <button
              type="button"
              onClick={handleStatusBadgeClick}
              title="Click to change status"
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold cursor-pointer transition-transform hover:scale-105 active:scale-95 ${badgeInfo.className}`}
            >
              {badgeInfo.label}
            </button>

            {/* Quick Status Dropdown Menu */}
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-30 bg-surface border border-border rounded-xl shadow-xl py-1 w-32 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  Set Status
                </div>
                {statusOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={(e) => handleSelectStatus(st, e)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer hover:bg-muted ${
                      student.status === st
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-foreground'
                    }`}
                  >
                    <span className="capitalize">{st}</span>
                    {student.status === st && (
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Attended Duration */}
            {durationDisplay && (
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium tabular-nums">
                {durationDisplay}
              </span>
            )}
          </div>

          {/* Right Chevron */}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Card>
  )
}
