import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui'
import type { SyllabusFilterTab } from '../types'

interface SyllabusFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeFilter: SyllabusFilterTab
  onFilterChange: (filter: SyllabusFilterTab) => void
  counts: {
    all: number
    completed: number
    in_progress: number
    not_started: number
  }
}

export function SyllabusFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
}: SyllabusFiltersProps) {
  const tabs: { id: SyllabusFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Topics', count: counts.all },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { id: 'not_started', label: 'Not Started', count: counts.not_started },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search modules or topics..."
          className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-surface border-border rounded-xl"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              aria-label={`Filter by ${tab.label}`}
              onClick={() => onFilterChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-surface text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
