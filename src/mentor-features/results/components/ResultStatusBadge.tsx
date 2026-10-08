import { Badge } from '@/components/ui/badge'
import type { ResultStatus } from '../types'

interface ResultStatusBadgeProps {
  status: ResultStatus
  className?: string
}

export function ResultStatusBadge({ status, className }: ResultStatusBadgeProps) {
  switch (status) {
    case 'published':
      return (
        <Badge tone="success" appearance="soft" dot className={className}>
          Published
        </Badge>
      )
    case 'pending':
      return (
        <Badge tone="warning" appearance="soft" dot className={className}>
          Pending
        </Badge>
      )
    case 'draft':
      return (
        <Badge tone="neutral" appearance="soft" dot className={className}>
          Draft
        </Badge>
      )
    case 'failed':
      return (
        <Badge tone="destructive" appearance="soft" dot className={className}>
          Failed
        </Badge>
      )
  }
}
