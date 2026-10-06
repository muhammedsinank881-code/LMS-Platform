import type { IngestProvider } from '@/types'

/** The workspace lead source (by its stable `key`) each provider files leads under. */
export const PROVIDER_SOURCE_KEY: Record<IngestProvider, string> = {
  facebook_lead_ads: 'facebook',
  instagram: 'instagram',
  google_ads: 'google_ads',
  linkedin: 'linkedin',
  whatsapp: 'whatsapp',
  website: 'website',
  form: 'landing_page',
  api: 'api',
  telephony: 'phone',
}

/** Used in the activity text: "Lead created from <label>". */
export const PROVIDER_LABEL: Record<IngestProvider, string> = {
  facebook_lead_ads: 'Facebook Lead Ads',
  instagram: 'Instagram Lead Ads',
  google_ads: 'Google Ads',
  linkedin: 'LinkedIn Lead Gen',
  whatsapp: 'WhatsApp',
  website: 'Website',
  form: 'a lead capture form',
  api: 'the API',
  telephony: 'a phone call',
}
