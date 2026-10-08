import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { ScheduleFiltersState } from '../types'
import { AVAILABLE_COURSES, AVAILABLE_MODULES } from '../mockData'

interface ScheduleFiltersProps {
  filters: ScheduleFiltersState
  onFiltersChange: (updated: Partial<ScheduleFiltersState>) => void
  totalCount: number
}

export function ScheduleFilters({
  filters,
  onFiltersChange,
  totalCount,
}: ScheduleFiltersProps) {
  return (
    <div className="space-y-3 p-3.5 rounded-lg border border-border bg-surface shadow-2xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="w-full sm:w-80">
          <Input
            type="search"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search classes, room or subject..."
            leftAdornment={<Search className="size-4" />}
          />
        </div>

        {/* Dynamic Result Count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0 justify-end">
          <span>Found</span>
          <Badge tone="primary" size="sm">
            {totalCount}
          </Badge>
          <span>{totalCount === 1 ? 'Class' : 'Classes'}</span>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
        {/* Course Filter */}
        <select
          value={filters.course}
          onChange={(e) => onFiltersChange({ course: e.target.value })}
          className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer"
          aria-label="Filter by Course"
        >
          <option value="all">All Courses</option>
          {AVAILABLE_COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Semester Filter */}
        <select
          value={filters.semester}
          onChange={(e) => onFiltersChange({ semester: e.target.value })}
          className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer"
          aria-label="Filter by Semester"
        >
          <option value="all">All Semesters</option>
          <option value="3rd Semester">3rd Semester</option>
          <option value="4th Semester">4th Semester</option>
          <option value="5th Semester">5th Semester</option>
        </select>

        {/* Module Filter */}
        <select
          value={filters.module}
          onChange={(e) => onFiltersChange({ module: e.target.value })}
          className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer"
          aria-label="Filter by Module"
        >
          <option value="all">All Modules</option>
          {AVAILABLE_MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Class Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => onFiltersChange({ type: e.target.value as ScheduleFiltersState['type'] })}
          className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer"
          aria-label="Filter by Class Type"
        >
          <option value="all">All Types</option>
          <option value="in-person">In-Person</option>
          <option value="online">Online</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value as ScheduleFiltersState['status'] })}
          className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer"
          aria-label="Filter by Status"
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) => onFiltersChange({ date: e.target.value })}
          className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer"
          aria-label="Filter by Specific Date"
        />

        {/* Reset Filter Button if active */}
        {filters.search || filters.course !== 'all' || filters.semester !== 'all' || filters.module !== 'all' || filters.type !== 'all' || filters.status !== 'all' || filters.date ? (
          <button
            type="button"
            onClick={() =>
              onFiltersChange({
                search: '',
                course: 'all',
                semester: 'all',
                module: 'all',
                type: 'all',
                status: 'all',
                date: '',
              })
            }
            className="text-xs text-primary font-semibold hover:underline px-2 cursor-pointer"
          >
            Clear Filters
          </button>
        ) : null}
      </div>
    </div>
  )
}
