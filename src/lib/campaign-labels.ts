import type { CampaignObjective, CampaignPlatform, CampaignStatus } from '@/types'

export const PLATFORM_LABELS: Record<CampaignPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  google_ads: 'Google Ads',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  email: 'Email',
  offline: 'Offline',
  other: 'Other',
}

export const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  awareness: 'Awareness',
  leads: 'Lead generation',
  sales: 'Sales',
  engagement: 'Engagement',
  retention: 'Retention',
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

export const platformLabel = (platform: string): string =>
  PLATFORM_LABELS[platform as CampaignPlatform] ?? platform
