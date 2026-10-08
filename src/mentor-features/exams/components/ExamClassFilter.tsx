interface ExamClassFilterProps {
  availableClasses: string[]
  selectedClass: string
  onClassChange: (cls: string) => void
  totalExamsCount: number
}

export function ExamClassFilter({
  availableClasses,
  selectedClass,
  onClassChange,
  totalExamsCount,
}: ExamClassFilterProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      {/* Class Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="exam-class-select" className="sr-only">
          Filter by Class
        </label>
        <select
          id="exam-class-select"
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer shadow-xs"
        >
          <option value="all">All Classes</option>
          {availableClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Count Summary */}
      <div className="text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
        <span className="font-bold text-foreground">{totalExamsCount}</span> {totalExamsCount === 1 ? 'Exam' : 'Exams'}
      </div>
    </div>
  )
}
