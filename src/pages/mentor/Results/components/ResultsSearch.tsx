import { Search, X } from 'lucide-react'

interface ResultsSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ResultsSearch({ searchQuery, onSearchChange }: ResultsSearchProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
        <Search className="size-4" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search student, exam, subject, or ID..."
        className="w-full h-10 pl-10 pr-10 bg-surface text-sm text-foreground placeholder:text-muted-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
