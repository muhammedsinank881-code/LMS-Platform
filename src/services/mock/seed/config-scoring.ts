import type { ScoringRule } from '@/types'
import { seedId, type SeedEnv } from './rng'

/** Default scoring rules: the single source a new workspace's rules come from. */
type ScoreDef = Pick<ScoringRule, 'name' | 'points' | 'conditions'> &
  Partial<Pick<ScoringRule, 'maxApplications' | 'repeatField'>>

export function scoringDefs(env: SeedEnv): ScoreDef[] {
  const sourceIs = (key: string): ScoreDef['conditions'] => [
    { field: 'sourceId', operator: 'equals', value: seedId(env, 'source', key) },
  ]
  return [
    { name: 'Facebook lead', points: 10, conditions: sourceIs('facebook') },
    { name: 'Instagram lead', points: 8, conditions: sourceIs('instagram') },
    { name: 'Google Ads lead', points: 12, conditions: sourceIs('google_ads') },
    { name: 'LinkedIn lead', points: 15, conditions: sourceIs('linkedin') },
    {
      name: 'Budget above ₹1L',
      points: 20,
      conditions: [{ field: 'budget', operator: 'gt', value: 100_000 }],
    },
    {
      name: 'Budget above ₹5L',
      points: 15,
      conditions: [{ field: 'budget', operator: 'gt', value: 500_000 }],
    },
    {
      name: 'Email provided',
      points: 10,
      conditions: [{ field: 'email', operator: 'is_not_empty' }],
    },
    {
      name: 'Company provided',
      points: 10,
      conditions: [{ field: 'company', operator: 'is_not_empty' }],
    },
    {
      name: 'Referral tag',
      points: 15,
      conditions: [{ field: 'tags', operator: 'contains', value: 'Referral' }],
    },
    { name: 'Imported list', points: -10, conditions: sourceIs('import') },
    {
      name: 'WhatsApp replied',
      points: 5,
      conditions: [{ field: 'engagement.whatsappReplies', operator: 'gt', value: 0 }],
      maxApplications: 3,
      repeatField: 'engagement.whatsappReplies',
    },
    {
      name: 'Email opened',
      points: 3,
      conditions: [{ field: 'engagement.emailOpens', operator: 'gt', value: 0 }],
    },
    {
      name: 'Demo attended',
      points: 15,
      conditions: [{ field: 'engagement.demosAttended', operator: 'gt', value: 0 }],
    },
    {
      name: 'Quotation requested',
      points: 10,
      conditions: [{ field: 'engagement.quotationRequests', operator: 'gt', value: 0 }],
    },
    {
      name: 'Form submitted',
      points: 4,
      conditions: [{ field: 'engagement.formSubmissions', operator: 'gt', value: 0 }],
      maxApplications: 3,
      repeatField: 'engagement.formSubmissions',
    },
    {
      name: 'Website visits',
      points: 2,
      conditions: [{ field: 'engagement.websiteVisits', operator: 'gt', value: 0 }],
      maxApplications: 5,
      repeatField: 'engagement.websiteVisits',
    },
  ]
}

