import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
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
    <Card className="p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
        {/* Class Selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="class-select"
            className="text-xs font-semibold text-muted-foreground block"
          >
            Class
          </label>
          <div className="relative">
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full bg-surface border border-input rounded-md px-3.5 py-2 text-sm font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring pr-9 transition-colors h-10"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({getStudentCountForClass(cls.id)} Students)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Date Navigator */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground block">
            Date
          </span>
          <div className="flex items-center justify-between bg-surface border border-input rounded-md px-2.5 py-1.5 text-sm h-10">
            <button
              type="button"
              onClick={onPrevDay}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>{formatDateDisplay(currentDate)}</span>
            </div>
            <button
              type="button"
              onClick={onNextDay}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

