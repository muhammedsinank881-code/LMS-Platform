import type { BadgeTone } from '@/components/ui'
import type { TemplateStatus } from '@/types'

export const TEMPLATE_STATUS_TONE: Record<TemplateStatus, BadgeTone> = {
  draft: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

export const TEMPLATE_STATUS_LABEL: Record<TemplateStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}
