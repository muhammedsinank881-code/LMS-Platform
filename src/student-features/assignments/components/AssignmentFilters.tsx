import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input, Select, Tabs, TabsList, TabsTrigger, type SelectOption } from '@/components/ui'
import type { TaskStatus, TaskType } from '../data/assignmentsData'

interface AssignmentFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  typeTab: 'all' | TaskType
  onTypeTabChange: (val: 'all' | TaskType) => void
  statusFilter: 'all' | TaskStatus
  onStatusFilterChange: (val: 'all' | TaskStatus) => void
  courseFilter: string
  onCourseFilterChange: (val: string) => void
  availableCourses: string[]
  totalCount: number
}

const STATUS_PILLS: { label: string; value: 'all' | TaskStatus }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Graded', value: 'graded' },
]

export function AssignmentFilters({
  searchQuery,
  onSearchChange,
  typeTab,
  onTypeTabChange,
  statusFilter,
  onStatusFilterChange,
  courseFilter,
  onCourseFilterChange,
  availableCourses,
  totalCount,
}: AssignmentFiltersProps) {
  const courseOptions: SelectOption[] = availableCourses.map((c) => ({
    value: c,
    label: c === 'All' ? 'All Courses' : c,
  }))

  return (
    <div className="space-y-4">
      {/* Top Row: Type Tabs & Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={typeTab}
          onValueChange={(val) => onTypeTabChange(val as 'all' | TaskType)}
          className="w-full lg:w-auto"
        >
          <TabsList className="w-full justify-start overflow-x-auto lg:w-auto">
            <TabsTrigger value="all" className="gap-1.5 text-xs">
              All Tasks
            </TabsTrigger>
            <TabsTrigger value="assignment" className="gap-1.5 text-xs">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-1.5 text-xs">
              Quizzes
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assignments or quizzes..."
            className="pl-9 pr-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Pills & Course Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-medium mr-1 text-[11px] flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Status:
          </span>
          {STATUS_PILLS.map((pill) => (
            <button
              type="button"
              key={pill.value}
              onClick={() => onStatusFilterChange(pill.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === pill.value
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'bg-surface-hover text-muted-foreground hover:bg-border/60 hover:text-foreground'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-medium">
            Showing <strong className="text-foreground">{totalCount}</strong> task{totalCount === 1 ? '' : 's'}
          </span>
          <Select
            options={courseOptions}
            value={courseFilter}
            onValueChange={onCourseFilterChange}
            className="w-48 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
