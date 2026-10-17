import { CheckCheck, RotateCcw, Search } from 'lucide-react'
import { Button, Input } from '@/components/ui'

interface RosterSearchActionsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filteredCount: number
  onMarkAllPresent: () => void
  onReset: () => void
}

export function RosterSearchActions({
  searchQuery,
  onSearchChange,
  filteredCount,
  onMarkAllPresent,
  onReset,
}: RosterSearchActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
      <div className="flex-1">
        <Input
          type="search"
          size="sm"
          leftAdornment={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          placeholder="Search student by name or roll number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        <span className="text-[11px] sm:text-xs font-semibold text-foreground sm:hidden">
          Roster ({filteredCount})
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onMarkAllPresent}
            className="text-success border-success/30 hover:bg-success/10 h-8 sm:h-9 text-xs px-2.5 sm:px-3"
          >
            <CheckCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            Mark all Present
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 sm:h-9 text-xs px-2 sm:px-3"
          >
            <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

