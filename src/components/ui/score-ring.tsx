import { cn } from '@/lib/cn'
import type { ScoreCategory } from '@/types'

const TONE: Record<ScoreCategory, string> = {
  hot: 'stroke-score-hot',
  warm: 'stroke-score-warm',
  cold: 'stroke-score-cold',
}

export interface ScoreRingProps {
  score: number
  category: ScoreCategory
  size?: number
  className?: string
}

/** Circular 0–100 score. The number is the accessible name. */
export function ScoreRing({ score, category, size = 88, className }: ScoreRingProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)))
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="img"
      aria-label={`${category} score ${clamped} out of 100`}
    >
      <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-muted" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15.915"
          fill="none"
          className={TONE[category]}
          strokeWidth="3"
          strokeDasharray={`${clamped} 100`}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="absolute text-lg font-semibold tabular-nums text-foreground">{clamped}</span>
    </div>
  )
}
