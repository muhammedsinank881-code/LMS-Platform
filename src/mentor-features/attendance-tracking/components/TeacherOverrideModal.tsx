import { useState } from 'react'
import { X, Check } from 'lucide-react'
import type { AttendanceStatus, StudentAttendanceRecord } from '../types'

interface TeacherOverrideModalProps {
  isOpen: boolean
  onClose: () => void
  student: StudentAttendanceRecord
  onSaveOverride: (
    studentId: string,
    newStatus: AttendanceStatus,
    reason: string,
  ) => void
}

export function TeacherOverrideModal({
  isOpen,
  onClose,
  student,
  onSaveOverride,
}: TeacherOverrideModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(
    student.status,
  )
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const statuses: { id: AttendanceStatus; label: string; desc: string }[] = [
    {
      id: 'present',
      label: 'Present',
      desc: 'Mark student as fully attended',
    },
    {
      id: 'late',
      label: 'Late',
      desc: 'Joined after grace threshold',
    },
    {
      id: 'partial',
      label: 'Partial',
      desc: 'Left session early or low duration',
    },
    {
      id: 'absent',
      label: 'Absent',
      desc: 'No attendance credit',
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveOverride(student.id, selectedStatus, reason)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Adjust Record (Teacher Override)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {student.name} ({student.rollNumber})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Select New Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((s) => {
                const isSelected = selectedStatus === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStatus(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-border bg-surface text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs sm:text-sm">
                        {s.label}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {s.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="override-reason"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground block"
            >
              Reason / Justification (Optional)
            </label>
            <textarea
              id="override-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Approved medical exemption, audio issue verified..."
              className="w-full bg-surface border border-input rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
