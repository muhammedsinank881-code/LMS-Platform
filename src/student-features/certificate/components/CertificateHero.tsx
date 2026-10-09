import { Award, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { CertificateStatus } from '../data/certificateData'

interface CertificateHeroProps {
  status: CertificateStatus
  overallProgress: number
  title: string
  courseName: string
  studentName: string
}

export function CertificateHero({
  status,
  overallProgress,
  title,
  courseName,
  studentName,
}: CertificateHeroProps) {
  const isEarned = status === 'in_progress'
  const isInProgress = status === 'in_progress'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all duration-300 sm:p-8',

        // Completed course — premium gold finish
        isEarned
          ? [
              'border-amber-400/60',
              'bg-gradient-to-br from-amber-100/90 via-yellow-500/15 to-amber-700/10',
              'dark:from-amber-400/15 dark:via-yellow-500/10 dark:to-amber-700/20',
              'shadow-[0_4px_24px_-8px_rgba(217,119,6,0.30)]',
              'ring-1 ring-inset ring-amber-400/20',
            ].join(' ')
          : [
              // Incomplete course — subtle premium surface
              'border-border/80',
              'to-card bg-gradient-to-br from-primary/[0.06] via-surface',
              'shadow-sm',
            ].join(' '),
      )}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            'absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20 blur-3xl',
            isEarned ? 'bg-amber-400' : 'bg-primary',
          )}
        />
        <div
          className={cn(
            'absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-10 blur-3xl',
            isEarned ? 'bg-amber-500' : 'bg-primary',
          )}
        />
      </div>

      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {/* Icon */}
        <div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
            isEarned
              ? 'bg-amber-500/20 ring-2 ring-amber-400/40'
              : 'bg-primary/15 ring-2 ring-primary/20',
          )}
        >
          {isEarned ? (
            <CheckCircle2 className="h-7 w-7 text-amber-500" />
          ) : isInProgress ? (
            <Clock className="h-7 w-7 text-primary" />
          ) : (
            <Award className="h-7 w-7 text-muted-foreground" />
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-[11px] font-bold uppercase tracking-widest',
                isEarned ? 'text-amber-500' : 'text-primary',
              )}
            >
              {isEarned ? '✓ Certificate Earned' : isInProgress ? 'In Progress' : 'Locked'}
            </span>
          </div>
          <h2 className="truncate text-lg font-bold leading-snug text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {courseName} &mdash; issued to{' '}
            <span className="font-semibold text-foreground">{studentName}</span>
          </p>
        </div>

        {/* Progress ring (right side on sm+) */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                className="stroke-muted"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                className={isEarned ? 'stroke-amber-400' : 'stroke-primary'}
                strokeWidth="2.5"
                strokeDasharray={`${overallProgress} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold tabular-nums text-foreground">
              {overallProgress}%
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Overall</span>
          </div>
        </div>
      </div>
    </div>
  )
}
