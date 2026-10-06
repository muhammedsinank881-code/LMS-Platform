import { RefreshCw } from 'lucide-react'
import { DateRangePicker, Button } from '@/components/ui'
import { useInvalidate } from '@/hooks/use-workspace'
import type { DateRangeState } from '@/hooks/use-date-range-state'
import { formatDate } from '@/lib/format'

export function DashboardHeader({
  name,
  rangeState,
}: {
  name: string
  rangeState: DateRangeState
}) {
  const invalidate = useInvalidate()
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return (
    <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold">
          {hello}, {name}
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
      </div>
      <div className="flex items-center gap-2 print:hidden">
        <DateRangePicker
          preset={rangeState.preset}
          fromDay={rangeState.fromDay}
          toDay={rangeState.toDay}
          compare={rangeState.compare}
          onPreset={rangeState.setPreset}
          onCustom={rangeState.setCustom}
          onCompare={rangeState.setCompare}
        />
        <Button variant="outline" size="sm" onClick={() => void invalidate('reports')} aria-label="Refresh dashboard">
          <RefreshCw aria-hidden="true" />
          Refresh
        </Button>
      </div>
    </header>
  )
}
