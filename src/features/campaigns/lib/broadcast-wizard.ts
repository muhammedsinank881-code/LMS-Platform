import { validateVariableMap } from '@/lib/inbox/broadcast-variables'
import type { AudienceCount, BroadcastAudience, BroadcastInput, MessageTemplate, VariableMap } from '@/types'

export const WIZARD_STEPS = [
  { id: 'template', label: 'Template' },
  { id: 'audience', label: 'Audience' },
  { id: 'variables', label: 'Variables' },
  { id: 'preview', label: 'Preview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'confirm', label: 'Confirm' },
] as const

export interface WizardState {
  name: string
  templateId: string | null
  audience: BroadcastAudience | null
  variableMap: VariableMap
  mode: 'now' | 'later'
  date: string
  time: string
}

export const INITIAL_WIZARD: WizardState = {
  name: '',
  templateId: null,
  audience: null,
  variableMap: {},
  mode: 'now',
  date: '',
  time: '10:00',
}

/** Local date and time to an ISO timestamp, or null when either is missing. */
export function scheduleAt(date: string, time: string): string | null {
  if (!date || !time) return null
  const value = new Date(`${date}T${time}:00`)
  return Number.isNaN(value.getTime()) ? null : value.toISOString()
}

/** Why the user cannot leave this step yet, or null when they can. */
export function stepError(
  step: number,
  state: WizardState,
  template: MessageTemplate | undefined,
  count: AudienceCount | undefined,
  customKeys: readonly string[],
  now: Date,
): string | null {
  switch (step) {
    case 0:
      return template ? null : 'Choose an approved template.'
    case 1:
      if (!state.audience) return 'Pick who should receive it.'
      if (!count) return 'Counting the audience…'
      return count.eligible > 0 ? null : 'No one in this audience can be messaged.'
    case 2: {
      const errors = validateVariableMap(template?.variables ?? [], state.variableMap, customKeys)
      return Object.keys(errors).length > 0 ? 'Map every variable before continuing.' : null
    }
    case 4: {
      if (state.mode === 'now') return null
      const at = scheduleAt(state.date, state.time)
      return at && Date.parse(at) > now.getTime() ? null : 'Pick a time in the future.'
    }
    case 5:
      return state.name.trim() ? null : 'Give the broadcast a name.'
    default:
      return null
  }
}

export function toBroadcastInput(state: WizardState): BroadcastInput | null {
  if (!state.templateId || !state.audience) return null
  return {
    name: state.name.trim(),
    templateId: state.templateId,
    audience: state.audience,
    variableMap: state.variableMap,
    schedule: {
      mode: state.mode,
      at: state.mode === 'later' ? scheduleAt(state.date, state.time) : null,
    },
  }
}
