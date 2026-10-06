import type { FilterFieldConfig } from '@/components/common/filter-builder'
import { activeFields } from '@/lib/settings/custom-field'
import type { CustomFieldDefinition } from '@/types'
import {
  LEAD_TYPES,
  PRIORITIES,
  QUALIFICATION_STATUSES,
  SCORE_CATEGORIES,
  type LeadFilterField,
} from '@/types'
import type { LeadLookups } from '../types'

const SCORE_LABELS: Record<(typeof SCORE_CATEGORIES)[number], string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
}

const TYPE_LABELS: Record<(typeof LEAD_TYPES)[number], string> = {
  b2b: 'B2B',
  b2c: 'B2C',
}

const QUAL_LABELS: Record<(typeof QUALIFICATION_STATUSES)[number], string> = {
  qualified: 'Qualified',
  not_qualified: 'Not qualified',
  needs_info: 'Needs info',
}

const PRIORITY_LABELS: Record<(typeof PRIORITIES)[number], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export function customLeadFilterFields(
  fields: readonly CustomFieldDefinition[],
): FilterFieldConfig<string>[] {
  return activeFields(fields, 'lead').map((field) => ({
    id: `cf:${field.key}`,
    label: field.label,
    type: field.type === 'dropdown' || field.type === 'multiselect' ? 'select' : field.type === 'boolean' ? 'boolean' : field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : 'text',
    options: field.options.map((option) => ({ value: option, label: option })),
  }))
}

export function buildLeadFilterFields(lookups: LeadLookups): FilterFieldConfig<LeadFilterField>[] {
  const users = lookups.users.map((user) => ({ value: user.id, label: user.name }))
  return [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'phone', label: 'Phone', type: 'text' },
    { id: 'email', label: 'Email', type: 'text' },
    { id: 'company', label: 'Company', type: 'text' },
    { id: 'location', label: 'Location', type: 'text' },
    {
      id: 'sourceId',
      label: 'Source',
      type: 'select',
      options: lookups.sources.map((item) => ({ value: item.id, label: item.name })),
    },
    {
      id: 'campaignId',
      label: 'Campaign',
      type: 'select',
      options: lookups.campaigns.map((item) => ({ value: item.id, label: item.name })),
    },
    {
      id: 'statusId',
      label: 'Status',
      type: 'select',
      options: lookups.statuses.map((item) => ({ value: item.id, label: item.name })),
    },
    { id: 'assignedTo', label: 'Assigned to', type: 'user', options: users },
    { id: 'score', label: 'Score', type: 'number' },
    {
      id: 'scoreCategory',
      label: 'Score category',
      type: 'select',
      options: SCORE_CATEGORIES.map((value) => ({ value, label: SCORE_LABELS[value] })),
    },
    { id: 'budget', label: 'Budget', type: 'currency' },
    {
      id: 'priority',
      label: 'Priority',
      type: 'select',
      options: PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] })),
    },
    {
      id: 'tags',
      label: 'Tags',
      type: 'multi-select',
      options: lookups.tags.map((tag) => ({ value: tag.name, label: tag.name })),
    },
    {
      id: 'qualificationStatus',
      label: 'Qualification',
      type: 'select',
      options: QUALIFICATION_STATUSES.map((value) => ({ value, label: QUAL_LABELS[value] })),
    },
    {
      id: 'leadType',
      label: 'Lead type',
      type: 'select',
      options: LEAD_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
    },
    { id: 'createdAt', label: 'Created', type: 'date' },
    { id: 'lastContactedAt', label: 'Last contacted', type: 'date' },
    { id: 'nextFollowUpAt', label: 'Next follow-up', type: 'date' },
    {
      id: 'followUpBucket',
      label: 'Follow-up bucket',
      type: 'select',
      options: [
        { value: 'overdue', label: 'Overdue' },
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      id: 'isDuplicate',
      label: 'Duplicate',
      type: 'boolean',
    },
  ]
}
