import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { IntegrationProvider } from '@/types'
import type { SettingsPanelProps } from './components/settings/types'
import type { ConnectFlowProps } from './providers/types'

export interface ProviderDefinition {
  /** The connection stepper, loaded only when someone connects this provider. */
  Flow: LazyExoticComponent<ComponentType<ConnectFlowProps>>
  /** The provider's settings inside the manage drawer. */
  Settings: LazyExoticComponent<ComponentType<SettingsPanelProps>>
}

const leadAds = {
  Flow: lazy(() => import('./providers/LeadAdsFlow').then((m) => ({ default: m.LeadAdsFlow }))),
  Settings: lazy(() => import('./components/settings/LeadAdsSettings').then((m) => ({ default: m.LeadAdsSettings }))),
}

/**
 * One entry per provider. Adding a provider means adding its flow, its settings panel and a row
 * here (plus its metadata and a mock handler), with no change to the page, cards or drawers.
 */
export const PROVIDER_REGISTRY: Record<IntegrationProvider, ProviderDefinition> = {
  whatsapp: {
    Flow: lazy(() => import('./providers/WhatsAppFlow').then((m) => ({ default: m.WhatsAppFlow }))),
    Settings: lazy(() => import('./components/settings/WhatsAppSettings').then((m) => ({ default: m.WhatsAppSettings }))),
  },
  email: {
    Flow: lazy(() => import('./providers/EmailFlow').then((m) => ({ default: m.EmailFlow }))),
    Settings: lazy(() => import('./components/settings/EmailSettings').then((m) => ({ default: m.EmailSettings }))),
  },
  facebook_lead_ads: leadAds,
  instagram: leadAds,
  google_ads: leadAds,
  linkedin: leadAds,
  telephony: {
    Flow: lazy(() => import('./providers/TelephonyFlow').then((m) => ({ default: m.TelephonyFlow }))),
    Settings: lazy(() => import('./components/settings/TelephonySettings').then((m) => ({ default: m.TelephonySettings }))),
  },
  website: {
    Flow: lazy(() => import('./providers/WebsiteFlow').then((m) => ({ default: m.WebsiteFlow }))),
    Settings: lazy(() => import('./components/settings/WebsiteSettings').then((m) => ({ default: m.WebsiteSettings }))),
  },
}
