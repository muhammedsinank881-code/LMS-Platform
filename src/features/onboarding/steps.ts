import type { OnboardingValues } from './schemas'

export interface OnboardingStepConfig {
  id: string
  label: string
  title: string
  description: string
  /** Fields validated before moving past this step. */
  fields: Array<keyof OnboardingValues>
  skippable: boolean
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    title: 'Name your workspace',
    description: 'This is how your team will see your company in LeadFlow.',
    fields: ['workspaceName'],
    skippable: false,
  },
  {
    id: 'region',
    label: 'Region',
    title: 'Currency and timezone',
    description: 'Used for deal values, reports and follow-up times. You can change these later.',
    fields: ['currency', 'timezone'],
    skippable: false,
  },
  {
    id: 'import',
    label: 'Import',
    title: 'Bring in your leads',
    description: 'Start with your existing leads, or begin fresh.',
    fields: ['importChoice'],
    skippable: true,
  },
  {
    id: 'invite',
    label: 'Invite',
    title: 'Invite your team',
    description: 'Teammates get a link to join. They start as salespeople.',
    fields: ['inviteEmails'],
    skippable: true,
  },
]
