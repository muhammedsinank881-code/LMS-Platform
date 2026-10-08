import { Bookmark, Search, SlidersHorizontal, X } from 'lucide-react'
import { Input, Select, Tabs, TabsList, TabsTrigger, type SelectOption } from '@/components/ui'
import type { CourseCategory, CourseStatusFilter } from '../data/coursesData'
import type { SortOption } from '../hooks/useStudentCourses'

interface CourseFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedTab: CourseStatusFilter
  onTabChange: (tab: CourseStatusFilter) => void
  selectedCategory: CourseCategory
  onCategoryChange: (category: CourseCategory) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  totalCount: number
}

const CATEGORIES: CourseCategory[] = ['All', 'Full-Stack', 'Frontend', 'Backend', 'UI/UX']

const SORT_OPTIONS: SelectOption[] = [
  { value: 'recently_accessed', label: 'Recently Accessed' },
  { value: 'progress_desc', label: 'Highest Progress' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'title', label: 'Alphabetical' },
]

export function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalCount,
}: CourseFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Top row: Status Tabs & Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={selectedTab}
          onValueChange={(val) => onTabChange(val as CourseStatusFilter)}
          className="w-full lg:w-auto"
        >
          <TabsList className="w-full justify-start overflow-x-auto lg:w-auto">
            <TabsTrigger value="all" className="gap-1.5 text-xs">
              All Courses
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1.5 text-xs">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5 text-xs">
              Completed
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="gap-1.5 text-xs">
              <Bookmark className="h-3.5 w-3.5" /> Bookmarked
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses or mentors..."
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

      {/* Bottom row: Topic Pills & Sort Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-medium mr-1 text-[11px] flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Topic:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'bg-surface-hover text-muted-foreground hover:bg-border/60 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-medium">
            Showing <strong className="text-foreground">{totalCount}</strong> course{totalCount === 1 ? '' : 's'}
          </span>
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onValueChange={(val) => onSortChange(val as SortOption)}
            className="w-44 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
