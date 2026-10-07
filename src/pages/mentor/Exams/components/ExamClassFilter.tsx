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
          className="h-9 px-3 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl text-xs sm:text-sm font-semibold text-[#17324D] dark:text-foreground focus:ring-2 focus:ring-[#0F9F83] focus:outline-none cursor-pointer shadow-2xs"
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
      <div className="text-xs sm:text-sm font-bold text-[#64748B] dark:text-slate-400 shrink-0">
        <span className="text-[#17324D] dark:text-foreground">{totalExamsCount}</span> {totalExamsCount === 1 ? 'Exam' : 'Exams'}
      </div>
    </div>
  )
}
