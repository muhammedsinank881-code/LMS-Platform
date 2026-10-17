interface AttendanceStatusFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  totalCount: number
  presentCount: number
  lateCount: number
  partialCount?: number
  absentCount: number
  pendingCount?: number
}

export function AttendanceStatusFilters({
  activeFilter,
  onFilterChange,
  totalCount,
  presentCount,
  lateCount,
  partialCount = 0,
  absentCount,
  pendingCount = 0,
}: AttendanceStatusFiltersProps) {
  const filters = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'present', label: `Present (${presentCount})`, count: presentCount },
    { id: 'late', label: `Late (${lateCount})`, count: lateCount },
    { id: 'partial', label: `Partial (${partialCount})`, count: partialCount },
    { id: 'absent', label: `Absent (${absentCount})`, count: absentCount },
    ...(pendingCount > 0
      ? [{ id: 'pending', label: `Pending (${pendingCount})`, count: pendingCount }]
      : []),
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none select-none -mx-1 px-1">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500'
                : 'bg-surface text-muted-foreground hover:text-foreground border border-border hover:bg-muted/40'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
