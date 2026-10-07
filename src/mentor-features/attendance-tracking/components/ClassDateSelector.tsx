import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ClassCohortOption } from '../types'

interface ClassDateSelectorProps {
  selectedClass: string
  onClassChange: (classId: string) => void
  classes: ClassCohortOption[]
  getStudentCountForClass: (classId: string) => number
  currentDate: Date
  onPrevDay: () => void
  onNextDay: () => void
  formatDateDisplay: (date: Date) => string
}

export function ClassDateSelector({
  selectedClass,
  onClassChange,
  classes,
  getStudentCountForClass,
  currentDate,
  onPrevDay,
  onNextDay,
  formatDateDisplay,
}: ClassDateSelectorProps) {
  return (
    <div className="bg-white dark:bg-card border border-[#E5E7EB] dark:border-border rounded-xl p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
        {/* Class Selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="class-select"
            className="text-xs font-semibold text-[#64748B] dark:text-slate-400 block"
          >
            Class
          </label>
          <div className="relative">
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5E7EB] dark:border-border rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium text-[#172033] dark:text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] pr-9 transition-colors h-10"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({getStudentCountForClass(cls.id)} Students)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#64748B] pointer-events-none" />
          </div>
        </div>

        {/* Date Navigator */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 block">
            Date
          </span>
          <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5E7EB] dark:border-border rounded-lg px-2.5 py-1.5 text-xs sm:text-sm h-10">
            <button
              type="button"
              onClick={onPrevDay}
              className="p-1 rounded-md text-[#64748B] hover:text-[#172033] dark:hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2 font-semibold text-[#172033] dark:text-foreground text-xs sm:text-sm">
              <CalendarIcon className="size-4 text-[#4F46E5]" />
              <span>{formatDateDisplay(currentDate)}</span>
            </div>
            <button
              type="button"
              onClick={onNextDay}
              className="p-1 rounded-md text-[#64748B] hover:text-[#172033] dark:hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
