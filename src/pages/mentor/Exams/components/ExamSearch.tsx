import { Search, X } from 'lucide-react'

interface ExamSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ExamSearch({ searchQuery, onSearchChange }: ExamSearchProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
        <Search className="size-4" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search exams, subjects or classes..."
        className="w-full h-11 pl-10 pr-10 bg-white dark:bg-card text-sm text-[#17324D] dark:text-foreground placeholder:text-[#64748B] dark:placeholder:text-slate-500 border border-[#E2E8F0] dark:border-border rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F9F83] focus:border-transparent transition-all"
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#17324D] dark:hover:text-foreground cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
