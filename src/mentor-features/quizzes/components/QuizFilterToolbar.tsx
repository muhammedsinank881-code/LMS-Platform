import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { QuizStatus } from '../types'

interface QuizFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedStatus: 'all' | QuizStatus
  onStatusChange: (status: 'all' | QuizStatus) => void
  counts?: {
    all: number
    active: number
    draft: number
    completed: number
    scheduled: number
  }
}

export function QuizFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  counts,
}: QuizFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-between items-stretch sm:items-center">
      {/* Search Input */}
      <div className="w-full sm:w-80 relative">
        <Input
          type="search"
          size="sm"
          leftAdornment={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />}
          placeholder="Search quizzes or classes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-8"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Status Tabs */}
      <div className="overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
        <Tabs
          value={selectedStatus}
          onValueChange={(v) => onStatusChange(v as 'all' | QuizStatus)}
          variant="pill"
        >
          <TabsList className="w-auto inline-flex flex-nowrap">
            <TabsTrigger value="all" className="text-xs whitespace-nowrap">
              All {counts ? `(${counts.all})` : ''}
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs whitespace-nowrap">
              Active {counts ? `(${counts.active})` : ''}
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs whitespace-nowrap">
              Draft {counts ? `(${counts.draft})` : ''}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs whitespace-nowrap">
              Completed {counts ? `(${counts.completed})` : ''}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs whitespace-nowrap">
              Scheduled {counts ? `(${counts.scheduled})` : ''}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
