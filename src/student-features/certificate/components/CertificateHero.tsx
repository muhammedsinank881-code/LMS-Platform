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
  const isEarned = status === 'earned'
  const isInProgress = status === 'in_progress'

  return (
    <div
      className={cn(
        'relative rounded-2xl border overflow-hidden p-6 sm:p-8',
        isEarned
          ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-card'
          : 'border-border bg-gradient-to-br from-primary/8 via-primary/4 to-card',
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={cn(
            'absolute -top-8 -right-8 h-40 w-40 rounded-full blur-3xl opacity-20',
            isEarned ? 'bg-amber-400' : 'bg-primary',
          )}
        />
        <div
          className={cn(
            'absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-3xl opacity-10',
            isEarned ? 'bg-amber-500' : 'bg-primary',
          )}
        />
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
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
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={cn(
                'text-[11px] font-bold uppercase tracking-widest',
                isEarned ? 'text-amber-500' : 'text-primary',
              )}
            >
              {isEarned ? '✓ Certificate Earned' : isInProgress ? 'In Progress' : 'Locked'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug truncate">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {courseName} &mdash; issued to <span className="font-semibold text-foreground">{studentName}</span>
          </p>
        </div>

        {/* Progress ring (right side on sm+) */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-muted" strokeWidth="2.5" />
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
