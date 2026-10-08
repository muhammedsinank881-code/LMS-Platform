import { Badge } from '@/components/ui/badge'
import type { ExamStatus } from '../types'

interface ExamStatusBadgeProps {
  status: ExamStatus
  className?: string
}

export function ExamStatusBadge({ status, className }: ExamStatusBadgeProps) {
  switch (status) {
    case 'ongoing':
      return (
        <Badge tone="success" size="sm" dot className={className}>
          Ongoing
        </Badge>
      )
    case 'upcoming':
      return (
        <Badge tone="primary" size="sm" className={className}>
          Upcoming
        </Badge>
      )
    case 'results_pending':
      return (
        <Badge tone="warning" size="sm" className={className}>
          Results Pending
        </Badge>
      )
    case 'completed':
    default:
      return (
        <Badge tone="neutral" size="sm" className={className}>
          Completed
        </Badge>
      )
  }
}

