import { ArrowLeft, Check } from 'lucide-react'

interface AttendanceHeaderProps {
  onBack: () => void
  onSave: () => void
  savedSuccess: boolean
}

export function AttendanceHeader({
  onBack,
  onSave,
  savedSuccess,
}: AttendanceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back to dashboard"
          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-[#E5E7EB] dark:border-border bg-white dark:bg-card text-[#64748B] hover:text-[#172033] dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#172033] dark:text-foreground tracking-tight truncate">
            Attendance Marking
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
            Select class, set date, and log student attendance
          </p>
        </div>
      </div>

      {/* Primary Save Button */}
      <button
        type="button"
        onClick={onSave}
        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold h-9 px-4 text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
      >
        {savedSuccess ? (
          <>
            <Check className="size-4" /> Saved!
          </>
        ) : (
          <>
            <Check className="size-4" /> Save Attendance
          </>
        )}
      </button>
    </div>
  )
}
