import { Search, X } from 'lucide-react'

interface StudentSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function StudentSearch({
  searchQuery,
  onSearchChange,
}: StudentSearchProps) {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center bg-surface border border-border rounded-2xl shadow-sm px-3.5 py-2.5 sm:py-3 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all">
        <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search students..."
          className="w-full bg-transparent text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
          aria-label="Search students"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-1"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
