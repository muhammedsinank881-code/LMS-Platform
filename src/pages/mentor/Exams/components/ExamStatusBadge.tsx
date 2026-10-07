import { cn } from '@/lib/cn'
import type { ExamStatus } from '../types'

interface ExamStatusBadgeProps {
  status: ExamStatus
  className?: string
}

export function ExamStatusBadge({ status, className }: ExamStatusBadgeProps) {
  switch (status) {
    case 'ongoing':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
            className,
          )}
        >
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Ongoing
        </span>
      )
    case 'upcoming':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-primary-subtle text-primary border border-primary/30',
            className,
          )}
        >
          Upcoming
        </span>
      )
    case 'results_pending':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border border-amber-200 dark:border-amber-900',
            className,
          )}
        >
          Results Pending
        </span>
      )
    case 'completed':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300 border border-[#E2E8F0] dark:border-border',
            className,
          )}
        >
          Completed
        </span>
      )
  }
}
