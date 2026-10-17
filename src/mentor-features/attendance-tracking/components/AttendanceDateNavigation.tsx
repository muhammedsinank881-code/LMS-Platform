import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface AttendanceDateNavigationProps {
  currentDate: Date
  onPrevDay: () => void
  onNextDay: () => void
  formatDateDisplay: (date: Date) => string
}

export function AttendanceDateNavigation({
  currentDate,
  onPrevDay,
  onNextDay,
  formatDateDisplay,
}: AttendanceDateNavigationProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-t border-border/70 select-none">
      {/* Previous Day Button */}
      <button
        type="button"
        onClick={onPrevDay}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
        aria-label="Previous date"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Date Display with Calendar Icon */}
      <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-foreground">
        <CalendarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>{formatDateDisplay(currentDate)}</span>
      </div>

      {/* Next Day Button */}
      <button
        type="button"
        onClick={onNextDay}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
        aria-label="Next date"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
