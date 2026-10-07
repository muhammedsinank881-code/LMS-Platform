import { CheckCheck, RotateCcw, Search } from 'lucide-react'

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search student by name or roll number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-card border border-[#E5E7EB] dark:border-border rounded-lg text-xs sm:text-sm text-[#172033] dark:text-foreground placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] h-10 transition-colors"
        />
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        <span className="text-xs font-bold text-[#172033] dark:text-foreground sm:hidden">
          Roster ({filteredCount})
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#059669] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <CheckCheck className="size-4" />
            Mark all Present
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#64748B] hover:text-[#172033] dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
