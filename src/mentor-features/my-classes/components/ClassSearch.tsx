import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui'

interface ClassSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ClassSearch({ searchQuery, onSearchChange }: ClassSearchProps) {
  return (
    <Input
      type="search"
      leftAdornment={<Search className="h-4 w-4" />}
      rightAdornment={
        searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null
      }
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search classes, courses, or codes..."
    />
  )
}

