import { ACTIVITY_TYPES, type ActivityType } from '@/types'

export const ACTIVITY_CHIPS = [
  { id: 'notes', label: 'Notes', types: ['note'] },
  { id: 'calls', label: 'Calls', types: ['call'] },
  {
    id: 'messages',
    label: 'Messages',
    types: ['whatsapp_sent', 'whatsapp_received', 'email_sent', 'email_received'],
  },
  { id: 'status', label: 'Status changes', types: ['status_changed', 'stage_changed'] },
] as const

export type ActivityChipId = (typeof ACTIVITY_CHIPS)[number]['id']

export const SYSTEM_ACTIVITY_TYPES: readonly ActivityType[] = [
  'lead_created',
  'assigned',
  'reassigned',
  'followup_scheduled',
  'followup_completed',
  'score_changed',
  'merged',
  'converted',
]

/**
 * Types to request. `undefined` means every type.
 * A selected chip narrows to that group. With no chip, the system toggle hides system events.
 */
export function activityTypesForFilter(
  chip: ActivityChipId | null,
  showSystem: boolean,
): ActivityType[] | undefined {
  if (chip) {
    const match = ACTIVITY_CHIPS.find((item) => item.id === chip)
    return match ? [...match.types] : undefined
  }
  if (showSystem) return undefined
  return ACTIVITY_TYPES.filter((type) => !SYSTEM_ACTIVITY_TYPES.includes(type))
}
