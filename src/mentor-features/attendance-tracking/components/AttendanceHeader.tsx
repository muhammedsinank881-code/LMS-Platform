import { ArrowLeft, Check, FileCheck, FileText } from 'lucide-react'
import { Button } from '@/components/ui'

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
    <div className="flex items-center justify-between py-1 px-0.5">
      {/* Left: Back Arrow + Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="p-1.5 -ml-1.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
          Attendance
        </h1>
      </div>

      {/* Right: Save / Report Action Button */}
      <div className="relative flex items-center">
        {/* Mobile: Compact Icon Button matching Screenshot 1 */}
        <button
          type="button"
          onClick={onSave}
          className={`sm:hidden p-2 rounded-lg transition-all cursor-pointer border ${
            savedSuccess
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border-transparent'
          }`}
          aria-label={savedSuccess ? 'Attendance Saved' : 'Save Attendance'}
        >
          {savedSuccess ? (
            <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          )}
        </button>

        {/* Desktop: Text + Icon Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSave}
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold h-8 sm:h-9 px-3 transition-colors ${
            savedSuccess
              ? 'text-emerald-600 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'text-foreground hover:text-primary hover:border-primary/40'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Save Attendance</span>
            </>
          )}
        </Button>

        {/* Saved confirmation toast bubble on mobile */}
        {savedSuccess && (
          <div className="sm:hidden absolute -bottom-8 right-0 bg-foreground text-background text-[11px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap z-20 animate-in fade-in slide-in-from-top-1">
            Attendance Saved!
          </div>
        )}
      </div>
    </div>
  )
}
