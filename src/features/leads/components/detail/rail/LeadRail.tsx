import { useScoringThresholds } from '@/features/settings/hooks/use-settings'
import type { Lead } from '@/types'
import { useRecalculateLeadScore } from '../../../hooks/use-lead-mutations'
import type { LeadLookups } from '../../../types'
import { AssignmentCard } from './AssignmentCard'
import { ContactCard } from './ContactCard'
import { KeyDatesCard } from './KeyDatesCard'
import { RelatedCard } from './RelatedCard'
import { ScoreCard } from './ScoreCard'
import { SourceCard } from './SourceCard'
import { TagsCard } from './TagsCard'

export function LeadRail({ lead, lookups, canEdit }: { lead: Lead; lookups: LeadLookups; canEdit: boolean }) {
  const thresholds = useScoringThresholds()
  const recalculate = useRecalculateLeadScore()
  return (
    <div className="space-y-3">
      <ContactCard lead={lead} />
      <SourceCard lead={lead} lookups={lookups} />
      <TagsCard lead={lead} lookups={lookups} canEdit={canEdit} />
      <AssignmentCard lead={lead} lookups={lookups} />
      <RelatedCard lead={lead} />
      <KeyDatesCard lead={lead} />
      <ScoreCard
        lead={lead}
        thresholds={thresholds.data}
        canEdit={canEdit}
        pending={recalculate.isPending}
        onRecalculate={() => recalculate.mutate(lead.id)}
      />
    </div>
  )
}
