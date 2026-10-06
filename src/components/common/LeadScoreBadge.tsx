import { Badge, type BadgeTone } from '@/components/ui'
import type { ScoreCategory } from '@/types'

const TONE: Record<ScoreCategory, BadgeTone> = {
  hot: 'hot',
  warm: 'warm',
  cold: 'cold',
}

const LABEL: Record<ScoreCategory, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
}

export interface LeadScoreBadgeProps {
  score: number
  category: ScoreCategory
  className?: string
}

export function LeadScoreBadge({ score, category, className }: LeadScoreBadgeProps) {
  return (
    <Badge tone={TONE[category]} dot className={className}>
      {LABEL[category]} {score}
    </Badge>
  )
}
