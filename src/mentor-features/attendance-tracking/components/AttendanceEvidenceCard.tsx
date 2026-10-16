import { useState } from 'react'
import { Video, RotateCw } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AttendanceEvidenceCardProps {
  evidenceSource?: string
  verificationState?: string
  attendanceRate: number
  onRefresh?: () => void
}

export function AttendanceEvidenceCard({
  evidenceSource = 'Live Session',
  verificationState = 'Verified',
  attendanceRate,
  onRefresh,
}: AttendanceEvidenceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (onRefresh) onRefresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const isVerified = verificationState.toLowerCase() === 'verified'

  return (
    <Card className="p-3.5 sm:p-5 bg-surface border-border shadow-sm rounded-2xl space-y-3 sm:space-y-3.5">
      {/* Top Row: Evidence Source & Verification State */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground">
          <Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Evidence: {evidenceSource}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span
              className={`h-2 w-2 rounded-full ${
                isVerified ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{verificationState}</span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
            aria-label="Refresh telemetry"
          >
            <RotateCw
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Middle Row: Label + Percentage */}
      <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
        <span className="font-medium text-muted-foreground">
          Session Attendance Rate
        </span>
        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
          {attendanceRate}%
        </span>
      </div>

      {/* Bottom: Progress Bar */}
      <div className="w-full h-2 sm:h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(Math.max(attendanceRate, 0), 100)}%` }}
        />
      </div>
    </Card>
  )
}
