import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MaterialFilterTab, MaterialFiltersState, MaterialSortOption } from '../types'

interface MaterialFiltersProps {
  filters: MaterialFiltersState
  onFiltersChange: (updated: Partial<MaterialFiltersState>) => void
  availableCourses: string[]
  availableModules: string[]
  totalCount: number
}

export function MaterialFilters({
  filters,
  onFiltersChange,
  availableCourses,
  availableModules,
  totalCount,
}: MaterialFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and Primary Type Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Filter Tabs */}
        <Tabs
          value={filters.type}
          onValueChange={(val) => onFiltersChange({ type: val as MaterialFilterTab })}
          variant="pill"
        >
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2">
              <span>PDF / Notes</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <span>Video Classes</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            type="search"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search materials..."
            leftAdornment={<Search className="size-4" />}
          />
        </div>
      </div>

      {/* Dropdown Filters & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Course Select */}
          <select
            value={filters.course}
            onChange={(e) => onFiltersChange({ course: e.target.value })}
            className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer shadow-2xs"
            aria-label="Filter by Course / Class"
          >
            <option value="all">All Courses / Classes</option>
            {availableCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Module Select */}
          <select
            value={filters.module}
            onChange={(e) => onFiltersChange({ module: e.target.value })}
            className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer shadow-2xs"
            aria-label="Filter by Module"
          >
            <option value="all">All Modules</option>
            {availableModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value as MaterialFiltersState['status'] })}
            className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer shadow-2xs"
            aria-label="Filter by Visibility Status"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort Select */}
          <select
            value={filters.sort}
            onChange={(e) => onFiltersChange({ sort: e.target.value as MaterialSortOption })}
            className="h-9 px-3 bg-surface border border-input rounded-md text-xs sm:text-sm font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none cursor-pointer shadow-2xs"
            aria-label="Sort materials"
          >
            <option value="recent">Sort: Recently uploaded</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="az">Sort: A-Z</option>
          </select>
        </div>

        {/* Count Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
          <span>Showing</span>
          <Badge tone="primary" size="sm">
            {totalCount}
          </Badge>
          <span>{totalCount === 1 ? 'Material' : 'Materials'}</span>
        </div>
      </div>
    </div>
  )
}
