import { ProgressBar } from '@/components/ui'

interface CourseProgressProps {
  value: number
  completedModules?: number
  totalModules?: number
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  showModules?: boolean
  className?: string
}

export function CourseProgress({
  value,
  completedModules,
  totalModules,
  size = 'md',
  showPercentage = true,
  showModules = true,
  className = '',
}: CourseProgressProps) {
  const isCompleted = value >= 100

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          {isCompleted ? 'Completed' : 'Course Completion'}
        </span>
        {showPercentage && (
          <span className={`font-semibold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
            {value}%
          </span>
        )}
      </div>

      <ProgressBar
        value={value}
        size={size}
      />

      {showModules && completedModules !== undefined && totalModules !== undefined && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span>
            {completedModules} of {totalModules} modules finished
          </span>
          {isCompleted && (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              ✓ 100% Done
            </span>
          )}
        </div>
      )}
    </div>
  )
}
