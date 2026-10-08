import { Search } from 'lucide-react'
import { Input, Badge } from '@/components/ui'
import type { DayStatus } from '../data/attendanceData'

type StatusOption = { value: 'all' | DayStatus; label: string; tone: 'neutral' | 'success' | 'warning' | 'destructive' | 'primary' }

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'all', label: 'All Days', tone: 'neutral' },
  { value: 'present', label: 'Present', tone: 'success' },
  { value: 'late', label: 'Late', tone: 'warning' },
  { value: 'absent', label: 'Absent', tone: 'destructive' },
  { value: 'weekend', label: 'Weekend', tone: 'neutral' },
]

interface AttendanceFiltersProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  statusFilter: 'all' | DayStatus
  onStatusFilterChange: (v: 'all' | DayStatus) => void
  totalCount: number
}

export function AttendanceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="attendance-search"
          placeholder="Search by date or day..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground shrink-0">{totalCount} records</span>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`attendance-filter-${opt.value}`}
              onClick={() => onStatusFilterChange(opt.value)}
              className="focus:outline-none"
            >
              <Badge
                tone={statusFilter === opt.value ? opt.tone : 'neutral'}
                appearance={statusFilter === opt.value ? 'solid' : 'soft'}
                size="sm"
                className={`cursor-pointer transition-all text-xs ${statusFilter === opt.value ? 'font-bold' : 'font-medium opacity-70 hover:opacity-100'}`}
              >
                {opt.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
