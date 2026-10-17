interface ResultsDropdownFiltersProps {
  availableClasses: string[]
  selectedClass: string
  onClassChange: (cls: string) => void
  availableExams: string[]
  selectedExam: string
  onExamChange: (ex: string) => void
  totalCount: number
}

export function ResultsDropdownFilters({
  availableClasses,
  selectedClass,
  onClassChange,
  availableExams,
  selectedExam,
  onExamChange,
  totalCount,
}: ResultsDropdownFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
      {/* Dropdown Filters */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
        <div>
          <label htmlFor="results-class-select" className="sr-only">
            Filter by Class
          </label>
          <select
            id="results-class-select"
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full sm:w-auto h-8 sm:h-9 px-2 sm:px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="all">All Classes</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="results-exam-select" className="sr-only">
            Filter by Exam / Subject
          </label>
          <select
            id="results-exam-select"
            value={selectedExam}
            onChange={(e) => onExamChange(e.target.value)}
            className="w-full sm:w-auto h-8 sm:h-9 px-2 sm:px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="all">All Exams</option>
            {availableExams.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Count Summary */}
      <div className="text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
        <span className="font-bold text-foreground">{totalCount}</span> {totalCount === 1 ? 'Result' : 'Results'}
      </div>
    </div>
  )
}
