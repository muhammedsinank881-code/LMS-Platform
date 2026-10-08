import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ResultsSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ResultsSearch({ searchQuery, onSearchChange }: ResultsSearchProps) {
  return (
    <div className="w-full">
      <Input
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search student, exam, subject, or ID..."
        leftAdornment={<Search className="size-4" />}
      />
    </div>
  )
}

