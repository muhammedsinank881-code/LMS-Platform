import { useCampaigns } from '@/features/campaigns/hooks/use-campaigns'
import { useStatuses, useSources } from '@/features/settings/hooks/use-lead-config'
import { useCustomFields, useLostReasons, useTags } from '@/features/settings/hooks/use-settings'
import { useDirectory } from '@/features/team/hooks/use-team'
import type { CustomFieldDefinition, LostReason } from '@/types'
import type { LeadLookups } from '../types'

export function useLeadLookups(): {
  lookups: LeadLookups
  customFields: CustomFieldDefinition[]
  lostReasons: LostReason[]
} {
  const statuses = useStatuses()
  const sources = useSources()
  const tags = useTags()
  const directory = useDirectory()
  const campaigns = useCampaigns({ pageSize: 100 })
  const customFields = useCustomFields()
  const lostReasons = useLostReasons()

  return {
    lookups: {
      statuses: statuses.data ?? [],
      sources: sources.data ?? [],
      tags: tags.data ?? [],
      users: directory.data ?? [],
      campaigns: campaigns.data?.items ?? [],
    },
    customFields: customFields.data ?? [],
    lostReasons: lostReasons.data ?? [],
  }
}
