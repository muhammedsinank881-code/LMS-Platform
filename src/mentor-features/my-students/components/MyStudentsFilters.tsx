import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui'

interface MyStudentsFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  availableClasses: string[]
  selectedClass: string
  onClassChange: (className: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  selectedAttendanceRange: string
  onAttendanceRangeChange: (range: string) => void
}

export function MyStudentsFilters({
  searchQuery,
  onSearchChange,
  availableClasses,
  selectedClass,
  onClassChange,
  selectedStatus,
  onStatusChange,
  selectedAttendanceRange,
  onAttendanceRangeChange,
}: MyStudentsFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search Input & Dropdowns */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Prominent Search Input */}
        <div className="flex-1">
          <Input
            type="search"
            leftAdornment={<Search className="h-4 w-4" />}
            placeholder="Search by name, student ID, class, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="bg-surface border border-input rounded-md pl-3 pr-8 py-2 text-xs font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring h-10"
              aria-label="Filter by class"
            >
              <option value="all">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Attendance Filter */}
          <div className="relative">
            <select
              value={selectedAttendanceRange}
              onChange={(e) => onAttendanceRangeChange(e.target.value)}
              className="bg-surface border border-input rounded-md pl-3 pr-8 py-2 text-xs font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring h-10"
              aria-label="Filter by attendance"
            >
              <option value="all">All Attendance</option>
              <option value="high">High (≥90%)</option>
              <option value="medium">Medium (75% - 89%)</option>
              <option value="low">Low (&lt;75%)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-surface border border-input rounded-md pl-3 pr-8 py-2 text-xs font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring h-10"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Filter Chips */}
      <div className="sm:hidden overflow-x-auto pb-1 flex items-center gap-2 no-scrollbar">
        <button
          type="button"
          onClick={() => onClassChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
            selectedClass === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface border border-border text-muted-foreground'
          }`}
        >
          All Classes
        </button>
        {availableClasses.map((cls) => (
          <button
            key={cls}
            type="button"
            onClick={() => onClassChange(cls)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              selectedClass === cls
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface border border-border text-muted-foreground'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>
    </div>
  )
}

